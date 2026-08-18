# Frontend Security Boundaries

Treat the browser and all browser-controlled data as untrusted. Frontend checks improve UX but never replace server authorization, validation, or output encoding.

- Trace HTML injection sinks, URL construction, redirects, cross-window messaging, storage, uploads, downloads, and third-party scripts to their trust boundaries.
- Avoid raw HTML insertion. When required, use an established sanitizer with an explicit policy and test malicious inputs.
- Allowlist redirect destinations and URL schemes; do not navigate directly to untrusted parameters.
- Validate upload type, size, name, and content on the server; preview safely and revoke object URLs.
- Keep secrets out of bundles, source maps, storage, logs, analytics, and user-facing errors.
- Prefer secure, server-managed session mechanisms. Evaluate token storage against the application's threat model rather than applying a universal recipe.
- Verify authorization on every protected server operation; hidden or disabled controls are not enforcement.

Do not claim security from static scanning alone. Report source-to-sink evidence, required server controls, exploit conditions, and unverified assumptions.
