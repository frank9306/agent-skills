"""Produce a narrated product demonstration using one franks-bot task connection."""
import argparse
import asyncio
from contextlib import closing
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import sys
import time

from media import DEFAULT_VOICE, Recorder, ffmpeg, narrate, probe, render_scene
from timeline import scene_timing, srt

VERSION = '0.1.0'


def save(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


def validate(plan):
    scenes = plan.get('scenes', [])
    if not scenes:
        raise ValueError('Plan needs scenes')
    ids = [s['id'] for s in scenes]
    if len(ids) != len(set(ids)) or any(not re.fullmatch('[a-zA-Z0-9_-]+', key) for key in ids):
        raise ValueError('Scene IDs must be unique simple identifiers')
    for scene in scenes:
        if not scene.get('steps') or not scene.get('narration', '').strip():
            raise ValueError('Each scene needs verified bot steps and narration')
        if 'durationSeconds' in scene and (not math.isfinite(scene['durationSeconds']) or scene['durationSeconds'] <= 0):
            raise ValueError('Scene duration must be positive')
        step_ids = [s['id'] for s in scene['steps']]
        if len(step_ids) != len(set(step_ids)):
            raise ValueError('Duplicate step IDs within scene')
        for step in scene['steps']:
            if not re.fullmatch('[a-zA-Z0-9_-]+', step['id']) or not step.get('expect'):
                raise ValueError('Every action needs a simple ID and an observable assertion')
    target = plan['target']
    if target['kind'] not in ('windows', 'chromium'):
        raise ValueError('Supported targets: windows or chromium with a bound Windows window')
    window = target if target['kind'] == 'windows' else target['window']
    if not window.get('executable') or window.get('windowId', 0) <= 0 or window.get('processId', 0) <= 0:
        raise ValueError('Bind the recording window by executable, PID and HWND')


class SceneTarget:
    """Intermediate scene completion keeps the task overlay alive."""
    def __init__(self, target):
        self.target = target

    def __getattr__(self, name):
        return getattr(self.target, name)

    def feedback(self, phase, message):
        self.target.feedback('wait' if phase == 'success' else phase, message)


def produce(plan, output, bot_path):
    validate(plan)
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise RuntimeError('Install FFmpeg with libx264 and subtitles support first')
    bot_scripts = bot_path.resolve()/'scripts'
    if not (bot_scripts/'session.py').is_file():
        raise ValueError('franks-bot skill path is missing')
    sys.path.insert(0, str(bot_scripts))
    from session import run_case, build_manifest
    from session_targets import BrowserTarget, DesktopTarget
    output = output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    manifest = {'version': VERSION, 'bot': build_manifest(), 'voice': plan.get('voice', DEFAULT_VOICE),
                'sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in Path(__file__).parent.glob('*.py')}}
    save(output/'manifest.json', manifest)
    timeline = []
    try:
        speech = []
        for scene in plan['scenes']:
            folder = output/scene['id']; folder.mkdir()
            audio = asyncio.run(asyncio.wait_for(narrate(scene['narration'], folder/'voice.mp3',
                                manifest['voice'], plan.get('rate', '+0%')), timeout=180))
            save(folder/'speech.json', audio)
            # Fail before recording/actions if even an instantaneous action cannot fit.
            scene_timing(0, audio['duration'], audio['cues'], scene.get('durationSeconds'))
            speech.append(audio)
        spec = plan['target']
        factory = DesktopTarget if spec['kind'] == 'windows' else BrowserTarget
        with closing(factory(spec, output)) as target:
            proxy = SceneTarget(target)
            window = target if spec['kind'] == 'windows' else target.overlay
            if window is None:
                raise ValueError('Chromium recording needs a bound Windows window')
            for scene, audio in zip(plan['scenes'], speech):
                folder = output/scene['id']
                window.call('focus')
                with closing(Recorder(window.spec['windowId'], folder/'raw.mp4')) as recorder:
                    if not run_case({'steps': scene['steps']}, proxy, folder):
                        raise RuntimeError(f"Scene {scene['id']} failed; no final video produced")
                    verified = recorder.elapsed()
                    timing = scene_timing(verified, audio['duration'], audio['cues'], scene.get('durationSeconds'))
                    target.feedback('wait', f"{scene['id']} · 保留讲解画面")
                    while recorder.elapsed() < timing['duration'] + .15:
                        time.sleep(.05)
                raw_duration = float(probe(folder/'raw.mp4')['format']['duration'])
                if raw_duration < timing['duration'] - .1:
                    raise RuntimeError('Capture too short; refusing to invent missing video frames')
                timing.update(id=scene['id'], verifiedAt=verified, rawDuration=raw_duration)
                timeline.append(timing)
                save(output/'timeline.json', timeline)
            target.feedback('success', '录制完成，正在合成')
        total = 0
        subtitles = []
        for scene in timeline:
            folder = output/scene['id']
            render_scene(folder/'raw.mp4', folder/'voice.mp3', scene, folder/'scene.mp4')
            subtitles.extend(dict(c, start=c['start']+total, end=c['end']+total) for c in scene['cues'])
            scene['videoStart'] = total
            total += scene['duration']
        (output/'subtitles.srt').write_text(srt(subtitles), encoding='utf-8')
        (output/'concat.txt').write_text(''.join(f"file '{s['id']}/scene.mp4'\n" for s in timeline), encoding='utf-8')
        ffmpeg(['-f', 'concat', '-safe', '1', '-i', 'concat.txt', '-c', 'copy', '-movflags', '+faststart',
                'candidate.mp4'], output)
        final = probe(output/'candidate.mp4')
        if abs(float(final['format']['duration'])-total) > .2 or {s['codec_type'] for s in final['streams']} != {'audio', 'video'}:
            raise RuntimeError('Final video stream or duration mismatch')
        ffmpeg(['-i', 'candidate.mp4', '-vn', '-c:a', 'pcm_s16le', 'narration.wav'], output)
        save(output/'timeline.json', timeline)
        save(output/'verification.json', {'passed': True, 'expectedDuration': total, 'media': final})
        (output/'candidate.mp4').rename(output/'demo.mp4')
        return output/'demo.mp4'
    except BaseException as exc:
        save(output/'failure.json', {'error': str(exc), 'completedScenes': len(timeline)})
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', action='store_true')
    parser.add_argument('--plan', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--bot-path', type=Path, default=Path.home()/'.codex/skills/franks-bot')
    args = parser.parse_args()
    if args.version:
        print(VERSION); return
    if not args.plan or not args.output:
        parser.error('--plan and --output are required')
    print(produce(json.loads(args.plan.read_text(encoding='utf-8-sig')), args.output, args.bot_path))


if __name__ == '__main__':
    main()
