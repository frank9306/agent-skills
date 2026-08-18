# Observability and Recovery

Design failure handling so users can recover and operators can distinguish causes without exposing sensitive data.

- Place route or feature error boundaries where they can preserve navigation and unaffected work.
- Provide contextual retry, reconnect, restore, or safe reset actions instead of requiring a full refresh.
- Normalize errors into stable categories while retaining correlation identifiers for support.
- Capture render failures, rejected requests, critical workflow outcomes, and performance signals through the project-owned telemetry path.
- Include release, route, operation, and environment context; redact credentials, personal data, request bodies, and internal details.
- Avoid duplicate reporting from component, client, and global handlers.
- Verify offline, timeout, chunk-load, incompatible-client, and permission-change recovery when applicable.

Treat the presence of an SDK as insufficient. Confirm events reach the configured destination in an approved non-production environment or mark delivery unverified.
