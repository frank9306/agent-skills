"""Run the same observable Hook/CLI contract against the Node-only adapter."""
import json
from pathlib import Path
import shutil
import subprocess
import unittest

from test_python_hooks import PythonHooksTests


class TypeScriptHookTests(PythonHooksTests):
    def invoke(self, event=None, mode=None, cwd=None):
        runner = Path(__file__).resolve().parents[1] / "assets/typescript/codex-checks.mjs"
        args = [shutil.which("node"), str(runner)]
        if mode:
            args += ["--run", mode]
        result = subprocess.run(args, cwd=cwd or self.root,
                                input=json.dumps(event) if event is not None else None,
                                text=True, capture_output=True, encoding="utf-8", timeout=20)
        self.assertTrue(result.stdout.strip(), result.stderr)
        self.assertEqual(result.stderr, "", result.stderr)
        return result.returncode, json.loads(result.stdout)


# Avoid collecting the imported base class a second time in unittest discovery.
del PythonHooksTests

if __name__ == "__main__":
    unittest.main()
