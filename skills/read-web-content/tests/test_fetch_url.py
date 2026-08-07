import importlib.util
import pathlib
import unittest


SCRIPT = pathlib.Path(__file__).parents[1] / "scripts" / "fetch_url.py"
SPEC = importlib.util.spec_from_file_location("fetch_url", SCRIPT)
fetch_url = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(fetch_url)


class FetchUrlTests(unittest.TestCase):
    def test_stdlib_extractor_drops_navigation_and_scripts(self):
        html = """
        <html><head><title>Useful Page</title><style>hidden</style></head>
        <body><nav>Menu</nav><article><h1>Heading</h1>
        <p>This is a sufficiently detailed paragraph containing useful article content.</p>
        <p>Another paragraph makes the extracted result long enough to validate reliably.</p>
        <p>A final paragraph provides factual details for a grounded summary response.</p>
        </article><script>alert('bad')</script></body></html>
        """
        parser = fetch_url.TextExtractor()
        parser.feed(html)
        result = parser.markdown("https://example.com")
        self.assertIn("# Useful Page", result)
        self.assertIn("Heading", result)
        self.assertNotIn("Menu", result)
        self.assertNotIn("alert", result)
        self.assertTrue(fetch_url.validate_content(result)[0])

    def test_validation_rejects_login_wall(self):
        content = "\n".join(["Please sign in to continue"] * 10)
        valid, reason = fetch_url.validate_content(content)
        self.assertFalse(valid)
        self.assertIn("blocked", reason)

    def test_validation_rejects_short_content(self):
        valid, reason = fetch_url.validate_content("# Tiny\n\nNo useful body")
        self.assertFalse(valid)
        self.assertIn("short", reason)


if __name__ == "__main__":
    unittest.main()

