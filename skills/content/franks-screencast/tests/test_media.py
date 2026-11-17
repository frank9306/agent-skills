from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from media import render_scene, probe


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'FFmpeg required for media integration')
class RenderTest(unittest.TestCase):
    def test_real_video_preserves_length_and_delays_narration(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x180:r=15',
                            '-t', '2', '-c:v', 'libx264', str(folder/'raw.mp4')], check=True)
            subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.5',
                            str(folder/'voice.wav')], check=True)
            render_scene(folder/'raw.mp4', folder/'voice.wav',
                         {'duration': 2, 'speechStart': .8, 'cues': [{'start': .8, 'end': 1.3, 'text': '中文演示'}]},
                         folder/'scene.mp4', width=320, height=180)
            info = probe(folder/'scene.mp4')
            self.assertAlmostEqual(2, float(info['format']['duration']), delta=.15)
            self.assertEqual({'video', 'audio'}, {s['codec_type'] for s in info['streams']})
            log = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(folder/'scene.mp4'), '-af',
                                  'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'],
                                 capture_output=True, text=True, check=True).stderr
            import re
            first_end = float(re.search(r'silence_end: ([0-9.]+)', log)[1])
            self.assertAlmostEqual(.8, first_end, delta=.08)


if __name__ == '__main__':
    unittest.main()
