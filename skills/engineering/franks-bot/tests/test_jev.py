import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('jev_next', Path(__file__).resolve().parents[1] / 'scripts/jev-next.py')
jev = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jev)


class JevTest(unittest.TestCase):
    def test_no_match_is_preserved_as_model_decision(self):
        with tempfile.TemporaryDirectory() as folder:
            image = Path(folder) / 'screen.png'
            image.write_bytes(b'fixture')
            decision = Path(folder) / 'decision.json'
            decision.write_text(json.dumps({'goal': 'select', 'progress': '', 'candidates': {'no_match': 'none', 'a': 'first'}}))
            response = io.BytesIO(json.dumps({'model': 'jev-test', 'answers': {'next': {'type': 'choice', 'choice': 'no_match', 'confidence': .9}}}).encode())
            output = io.StringIO()
            with patch.dict('os.environ', {'TYPESAFE_API_KEY': 'fixture'}), patch('sys.argv', ['jev-next.py', str(image), str(decision)]), patch.object(jev, 'urlopen', return_value=response), contextlib.redirect_stdout(output):
                code = jev.main()
            self.assertEqual(0, code)
            self.assertEqual('no_match', json.loads(output.getvalue())['choice'])
            self.assertEqual('jev-test', json.loads(output.getvalue())['model'])
