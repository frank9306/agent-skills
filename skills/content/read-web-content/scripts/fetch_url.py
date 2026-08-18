#!/usr/bin/env python3
"""Fetch a public webpage as Markdown with local-first, opt-in proxy fallback."""

from __future__ import annotations

import argparse
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

USER_AGENT = "Mozilla/5.0 (compatible; read-web-content/1.0)"
BLOCKED_MARKERS = (
    "sign in to continue",
    "log in to continue",
    "please sign in",
    "just a moment...",
    "checking your browser",
    "captcha",
    "请登录",
    "登录后查看",
    "人机验证",
    "机器人验证",
)


def fetch_bytes(url: str, timeout: float) -> tuple[bytes, str]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        content_type = response.headers.get("Content-Type", "")
        return response.read(), content_type


def decode_body(raw: bytes, content_type: str) -> str:
    match = re.search(r"charset=([\w.-]+)", content_type, re.IGNORECASE)
    charset = match.group(1) if match else "utf-8"
    try:
        return raw.decode(charset, errors="replace")
    except LookupError:
        return raw.decode("utf-8", errors="replace")


class TextExtractor(HTMLParser):
    DROP_TAGS = {"script", "style", "nav", "footer", "aside", "noscript", "form", "svg"}
    BREAK_TAGS = {"p", "div", "section", "article", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "br", "tr"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.drop_depth = 0
        self.in_title = False
        self.title_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.DROP_TAGS:
            self.drop_depth += 1
        elif tag == "title":
            self.in_title = True
        elif tag in self.BREAK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.DROP_TAGS:
            self.drop_depth = max(0, self.drop_depth - 1)
        elif tag == "title":
            self.in_title = False
        elif tag in self.BREAK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self.drop_depth:
            return
        if self.in_title:
            self.title_parts.append(data)
        else:
            self.parts.append(data)

    def markdown(self, source_url: str) -> str:
        title = " ".join("".join(self.title_parts).split())
        lines = [" ".join(line.split()) for line in "".join(self.parts).splitlines()]
        body = "\n\n".join(line for line in lines if line)
        prefix = f"# {title}\n\n" if title else ""
        return f"{prefix}> Source: {source_url}\n\n{body}\n"


def html_to_markdown(html: str, source_url: str) -> tuple[str, str]:
    try:
        from readability import Document  # type: ignore
        import html2text  # type: ignore
    except ImportError:
        parser = TextExtractor()
        parser.feed(html)
        return parser.markdown(source_url), "stdlib"

    document = Document(html)
    converter = html2text.HTML2Text()
    converter.body_width = 0
    converter.ignore_links = False
    converter.ignore_images = False
    body = converter.handle(document.summary(html_partial=True)).strip()
    title = (document.short_title() or "").strip()
    prefix = f"# {title}\n\n" if title else ""
    return f"{prefix}> Source: {source_url}\n\n{body}\n", "readability"


def validate_content(content: str) -> tuple[bool, str]:
    meaningful = [line for line in content.splitlines() if line.strip()]
    if len(meaningful) < 4 or len(content.strip()) < 160:
        return False, "content is too short"
    lowered = content.lower()
    marker = next((item for item in BLOCKED_MARKERS if item in lowered), None)
    if marker:
        return False, f"response looks blocked ({marker})"
    return True, ""


def local_extract(url: str, timeout: float) -> tuple[str, str]:
    raw, content_type = fetch_bytes(url, timeout)
    if "html" not in content_type.lower() and content_type:
        raise ValueError(f"unsupported content type: {content_type}")
    return html_to_markdown(decode_body(raw, content_type), url)


def proxy_extract(proxy_base: str, url: str, timeout: float) -> str:
    raw, content_type = fetch_bytes(f"{proxy_base}{url}", timeout)
    return decode_body(raw, content_type)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url")
    parser.add_argument("--use-proxy", action="store_true", help="allow third-party extractor fallback")
    parser.add_argument("--timeout", type=float, default=20.0)
    args = parser.parse_args()

    parsed = urllib.parse.urlparse(args.url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        parser.error("url must be an absolute http(s) URL")

    try:
        content, extractor = local_extract(args.url, args.timeout)
        valid, reason = validate_content(content)
        if valid:
            print(f"[fetch] tier=local status=ok extractor={extractor}", file=sys.stderr)
            sys.stdout.write(content)
            return 0
        print(f'[fetch] tier=local status=fail reason="{reason}"', file=sys.stderr)
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as error:
        print(f'[fetch] tier=local status=fail reason="{error}"', file=sys.stderr)

    if not args.use_proxy:
        print('[fetch] status=fail reason="local extraction failed; proxy fallback requires --use-proxy"', file=sys.stderr)
        return 1

    for tier, base in (("defuddle", "https://defuddle.md/"), ("jina", "https://r.jina.ai/")):
        for attempt in range(2):
            try:
                content = proxy_extract(base, args.url, args.timeout)
                valid, reason = validate_content(content)
                if valid:
                    print(f"[fetch] tier={tier} status=ok", file=sys.stderr)
                    sys.stdout.write(content)
                    return 0
            except (urllib.error.URLError, TimeoutError, OSError) as error:
                reason = str(error)
            if attempt == 0:
                time.sleep(1)
        print(f'[fetch] tier={tier} status=fail reason="{reason}"', file=sys.stderr)

    print("[fetch] status=fail reason=\"all enabled tiers failed\"", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

