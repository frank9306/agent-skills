# Source routing reference

Use the narrowest reliable method available. A successful HTTP response is not sufficient: verify that the returned body contains the requested material.

## GitHub

- Repository metadata, issues, pull requests, and directory trees: prefer a GitHub connector, `gh api`, or GitHub REST API.
- File URLs containing `/blob/`: prefer the corresponding `raw.githubusercontent.com` URL.
- Repository documentation: prefer the raw README or Contents API.
- Use rendered GitHub HTML only for pages whose semantics are not represented by an API.

## PDF

- Use the environment's PDF tooling when layout, tables, figures, or page references matter.
- For text-heavy PDFs, use `pdftotext -layout` when available.
- Render and inspect relevant pages when extraction order or layout is uncertain.
- Do not infer unreadable scanned text; use OCR when available and label OCR uncertainty.

## Feishu and Lark

- Prefer an authenticated Feishu/Lark connector or Open API for block-structured documents.
- Preserve heading levels, lists, code blocks, tables, links, and document metadata.
- Do not send private workspace URLs through public extraction proxies.

## WeChat and JavaScript-heavy pages

- Prefer an available browser tool that can inspect the rendered article body.
- For public pages only, third-party Markdown extractors may be used as a fallback with explicit privacy awareness.
- Confirm the result is the article, not a verification, consent, or login page.

## Ordinary webpages

Use the bundled local extractor first:

```bash
python skills/read-web-content/scripts/fetch_url.py "https://example.com/article"
```

It fetches the target directly and does not disclose the URL to an additional extraction service. Optional `readability-lxml` and `html2text` packages improve main-content extraction; the standard-library fallback remains usable without them.

For a public, nonsensitive URL when local extraction fails:

```bash
python skills/read-web-content/scripts/fetch_url.py --use-proxy "https://example.com/article"
```

Proxy mode tries `defuddle.md` and then `r.jina.ai`. These services receive the complete URL and may log or cache it.

## Quality checks

Reject or warn on:

- empty or extremely short output;
- login, paywall, CAPTCHA, bot-check, consent, or generic error pages;
- navigation-heavy output without the expected title or subject;
- raw JSON when readable Markdown was requested;
- content whose source URL or provenance cannot be established.

