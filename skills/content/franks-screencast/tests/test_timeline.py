import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from timeline import scene_timing, srt


class TimingTest(unittest.TestCase):
    def test_service_sentence_overlap_switches_subtitle_at_next_sentence(self):
        result = scene_timing(0, 4.8, [{'start': .1, 'end': 2.2625, 'text': '首先输入会话名称。'},
                                      {'start': 2.2125, 'end': 4.7375, 'text': '这里搜索星河演示会话。'}])
        self.assertAlmostEqual(2.5125, result['cues'][0]['end'])
        self.assertAlmostEqual(2.5125, result['cues'][1]['start'])

    def test_short_scene_refuses_to_cut_off_narration(self):
        with self.assertRaisesRegex(ValueError, 'short'):
            scene_timing(8, 3, [], 10)

    def test_cues_outside_the_audio_are_rejected(self):
        with self.assertRaises(ValueError):
            scene_timing(0, 2, [{'start': 1, 'end': 3, 'text': '越界'}])

    def test_speech_waits_for_verified_state_and_subtitles_follow_audio(self):
        timing = scene_timing(2.4, 3.0, [{'start': .1, 'end': 2.9, 'text': '打开归档。'}], 10)
        self.assertAlmostEqual(2.7, timing['speechStart'])
        self.assertEqual(10, timing['duration'])
        self.assertEqual('1\n00:00:02,800 --> 00:00:05,600\n打开归档。\n', srt(timing['cues']))


if __name__ == '__main__':
    unittest.main()
