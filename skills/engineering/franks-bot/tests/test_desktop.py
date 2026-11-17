from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from session_targets import DesktopTarget, ObservationUnavailable


class DesktopTest(unittest.TestCase):
    def test_transitioning_uia_tree_is_not_an_assertion_success(self):
        target = DesktopTarget.__new__(DesktopTarget)
        with patch.object(target, 'call', side_effect=ObservationUnavailable('tree changing')):
            self.assertFalse(target.check({'name': 'Login', 'kind': 'Button'}))
