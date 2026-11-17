"""Local capture/render and online narration. No product interaction lives here."""
import asyncio
import ctypes
import json
from pathlib import Path
import subprocess
import threading
import time

from timeline import srt

DEFAULT_VOICE = 'zh-CN-YunyangNeural'


async def narrate(text, output, voice=DEFAULT_VOICE, rate='+0%'):
    import edge_tts
    cues = []
    stream = edge_tts.Communicate(text, voice, rate=rate, boundary='SentenceBoundary')
    with output.open('xb') as audio:
        async for chunk in stream.stream():
            if chunk['type'] == 'audio':
                audio.write(chunk['data'])
            elif chunk['type'] == 'SentenceBoundary':
                cues.append({'start': chunk['offset']/10000000,
                             'end': (chunk['offset']+chunk['duration'])/10000000,
                             'text': chunk['text']})
    if not cues:
        raise RuntimeError('TTS supplied no sentence boundaries; do not guess subtitle timing')
    duration = float(probe(output)['format']['duration'])
    return {'duration': duration, 'cues': cues, 'voice': voice, 'rate': rate}


class Recorder:
    """DPI-aware HWND capture on its own thread, with a monotonic video clock."""
    def __init__(self, window_id, output):
        self.output = output
        self.window_id = window_id
        self.ready = threading.Event()
        self.stopping = threading.Event()
        self.epoch = None
        self.error = None
        self.process = None
        self.frames = 0
        self.repeated = 0
        self.max_gap = 0
        self.log = output.with_suffix('.log').open('wb')
        self.reader = threading.Thread(target=self._capture, daemon=True)
        self.reader.start()
        if not self.ready.wait(15) or self.error:
            self.stop()
            raise RuntimeError('Window recording did not become ready')

    def _capture(self):
        previous_context = None
        try:
            from PIL import Image, ImageGrab, ImageOps
            user32 = ctypes.windll.user32
            user32.SetThreadDpiAwarenessContext.restype = ctypes.c_void_p
            previous_context = user32.SetThreadDpiAwarenessContext(ctypes.c_void_p(-4))
            if not previous_context:
                raise RuntimeError('Cannot enable per-monitor DPI capture')
            self.process = subprocess.Popen([
                'ffmpeg', '-hide_banner', '-nostdin', '-n', '-f', 'rawvideo', '-pixel_format', 'rgb24',
                '-video_size', '1280x720', '-framerate', '15', '-i', 'pipe:0', '-an', '-c:v', 'libx264',
                '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', str(self.output)],
                stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=self.log,
                creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            last = None
            previous_at = None
            source_size = None
            while not self.stopping.is_set():
                if not user32.IsWindow(ctypes.c_void_p(self.window_id)) or user32.IsIconic(ctypes.c_void_p(self.window_id)):
                    raise RuntimeError('Recording window disappeared or was minimized')
                at = time.perf_counter()
                frame = ImageGrab.grab(window=self.window_id).convert('RGB')
                if source_size and source_size != frame.size:
                    raise RuntimeError('Window size/DPI changed during recording')
                source_size = frame.size
                fitted = ImageOps.contain(frame, (1280, 720))
                canvas = Image.new('RGB', (1280, 720))
                canvas.paste(fitted, ((1280-fitted.width)//2, (720-fitted.height)//2))
                data = canvas.tobytes()
                if self.epoch is None:
                    self.epoch = at
                if previous_at is not None:
                    self.max_gap = max(self.max_gap, at-previous_at)
                    if self.max_gap > .3:
                        raise RuntimeError('Capture stalled for over 300 ms; cannot guarantee narration alignment')
                previous_at = at
                desired = int((at-self.epoch)*15)
                while self.frames < desired:
                    self.process.stdin.write(last or data)
                    self.frames += 1
                    self.repeated += 1
                self.process.stdin.write(data)
                self.frames += 1
                last = data
                self.ready.set()
                self.stopping.wait(max(0, self.epoch+self.frames/15-time.perf_counter()))
            self.output.with_suffix('.capture.json').write_text(json.dumps({
                'fps': 15, 'frames': self.frames, 'repeatedFrames': self.repeated,
                'maxCaptureGapMs': self.max_gap*1000, 'sourceSize': source_size,
                'epoch': self.epoch}), encoding='utf-8')
        except BaseException as exc:
            self.error = exc
            self.ready.set()
        finally:
            if self.process and self.process.stdin:
                self.process.stdin.close()
            if previous_context:
                ctypes.windll.user32.SetThreadDpiAwarenessContext(ctypes.c_void_p(previous_context))

    def elapsed(self):
        if self.error or not self.process or self.process.poll() is not None:
            raise RuntimeError(f'Recorder failed: {self.error}')
        return time.perf_counter() - self.epoch

    def stop(self):
        self.stopping.set()
        self.reader.join(timeout=15)
        if self.process and self.process.poll() is None:
            try:
                self.process.wait(timeout=15)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()
        self.log.close()
        if self.reader.is_alive() or self.error or not self.process or self.process.returncode:
            raise RuntimeError(f'Recorder failed: {self.error or "capture/encoder did not finish"}')

    close = stop


def probe(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)],
                            capture_output=True, text=True, check=True, timeout=30)
    return json.loads(result.stdout)


def ffmpeg(args, folder):
    with (folder/'render.log').open('ab') as log:
        subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-n', *args], cwd=folder,
                       stdout=log, stderr=log, check=True, timeout=600)


def render_scene(raw, voice, timing, output, width=1280, height=720):
    folder = output.parent.resolve()
    subtitle = output.with_suffix('.srt')
    subtitle.write_text(srt(timing['cues']), encoding='utf-8')
    # Generated ASCII scene filenames avoid FFmpeg filter-path escaping on Windows.
    if not subtitle.name.replace('-', '').replace('_', '').replace('.', '').isalnum():
        raise ValueError('Use a simple generated media filename')
    delay = round(timing['speechStart'] * 1000)
    duration = timing['duration']
    video = (f'scale={width}:{height}:force_original_aspect_ratio=decrease,'
             f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,setsar=1,'
             f"subtitles=filename='{subtitle.name}':force_style='FontName=Microsoft YaHei,FontSize=22,"
             "Outline=2,Shadow=0,MarginV=28',format=yuv420p")
    ffmpeg(['-i', str(raw.resolve()), '-i', str(voice.resolve()), '-filter_complex',
            f'[0:v]{video}[v];[1:a]adelay={delay}:all=1,apad,atrim=duration={duration}[a]',
            '-map', '[v]', '-map', '[a]', '-t', str(duration), '-r', '30',
            '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-c:a', 'aac', '-ar', '48000',
            '-ac', '2', '-movflags', '+faststart', str(output.resolve())], folder)
    actual = float(probe(output)['format']['duration'])
    if abs(actual-duration) > .15:
        raise RuntimeError(f'Render duration mismatch: {actual} / {duration}')
