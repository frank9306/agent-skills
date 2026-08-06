# Type and Runtime Safety

Treat TypeScript as a compile-time model, not proof that external data is valid.

- Remove `any`, broad assertions, non-null assertions, and optional chaining used to conceal an unresolved invariant.
- Validate untrusted API, storage, URL, message, and feature-flag data at the boundary using the project's existing validation approach.
- Keep transport DTOs distinct from domain and display models when semantics differ.
- Model meaningful variants with discriminated unions and exhaustive handling.
- Generate types from the authoritative contract when the project supports it; detect drift in CI.
- Convert validation failures into observable, recoverable application errors without logging sensitive payloads.

Do not add a validation dependency without approval. Static matches are review leads; inspect the surrounding contract before reporting severity.
