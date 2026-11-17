"""Media timing in seconds; narration begins after the verified UI result."""
import math


def scene_timing(verified_at, audio_duration, cues, duration=None):
    if not all(math.isfinite(x) for x in (verified_at, audio_duration)) or verified_at < 0 or audio_duration <= 0:
        raise ValueError('Invalid media timing')
    start = verified_at + .3
    needed = start + audio_duration + .4
    if duration is not None and (not math.isfinite(duration) or duration < needed):
        raise ValueError(f'Scene too short: needs at least {needed:.3f} seconds')
    previous = -1
    normalized = []
    for cue in cues:
        if not (0 <= cue['start'] < cue['end'] <= audio_duration + .05) or cue['start'] <= previous or not cue['text'].strip():
            raise ValueError('Subtitle boundary outside audio or overlapping')
        if normalized:
            normalized[-1]['end'] = min(normalized[-1]['end'], cue['start'])
        normalized.append(dict(cue, end=min(cue['end'], audio_duration)))
        previous = cue['start']
    return {'speechStart': start, 'duration': needed if duration is None else duration,
            'cues': [dict(c, start=c['start'] + start, end=c['end'] + start) for c in normalized]}


def srt(cues):
    def stamp(seconds):
        ms = round(seconds * 1000)
        return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'
    return '\n'.join(f"{i}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}\n"
                     for i, c in enumerate(cues, 1))
