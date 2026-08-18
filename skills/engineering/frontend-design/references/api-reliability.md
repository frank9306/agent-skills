# API Reliability

Locate the authoritative API contract, generated client, schema, fixtures, or observed response before editing integration code. Do not infer semantics from field names.

- Centralize transport configuration, authentication, serialization, and error normalization in the project-owned client.
- Keep transport-to-domain conversion outside presentation components.
- Represent loading, empty, partial, stale, error, retrying, and unauthorized states when the endpoint can produce them.
- Handle cancellation or stale-response suppression, timeouts, retries, idempotency, and duplicate submission according to operation semantics.
- Retry only safe or explicitly idempotent operations, with bounded backoff and visible recovery where appropriate.
- Distinguish validation, authentication, authorization, conflict, rate-limit, network, timeout, and server errors when users need different recovery.
- Test partial success and concurrent updates for batch or collaborative operations.

Verify against a real contract or captured behavior. Mark timeout, retry, and error-shape conclusions unverified when the server policy is unavailable.
