# Cloudflare API and recovery

## Official endpoints used

- Accounts: `GET /accounts`
- Zones: `GET /zones`
- DNS records: `GET /zones/{zone_id}/dns_records`
- Tunnels: `GET /accounts/{account_id}/cfd_tunnel`
- Tunnel configuration: `GET|PUT /accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations`
- Access applications: `GET /accounts/{account_id}/access/apps`
- Access policies: `GET /accounts/{account_id}/access/apps/{app_id}/policies`

Authoritative documentation:

- https://developers.cloudflare.com/api/resources/zero_trust/subresources/tunnels/
- https://developers.cloudflare.com/api/resources/dns/subresources/records/
- https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/
- https://developers.cloudflare.com/api/resources/zero_trust/subresources/access/subresources/applications/subresources/policies/
- https://developers.cloudflare.com/fundamentals/api/reference/permissions/

## Token handling

Create a custom token restricted to the exact account and zone. Prefer separate read-only and write tokens when practical. Inject the token through `CLOUDFLARE_API_TOKEN` for an ephemeral process or `CLOUDFLARE_API_TOKEN_FILE` for a local protected file. On POSIX, the CLI rejects token files readable by group or others.

Rotate or revoke a token in Cloudflare after suspected disclosure, remove it from the process environment or protected file, and verify the old token can no longer call the API. Never use a Global API Key.

## Tunnel rollback

An applied ingress update requires a snapshot file. The CLI saves the complete pre-change API response with restrictive permissions before the PUT. Treat it as sensitive because origin URLs or request settings may contain private data.

To recover, inspect the snapshot locally, extract its `config`, and restore that complete config through the same Tunnel configuration PUT endpoint after explicit authorization. Re-read the configuration afterward. Never restore a snapshot to a different account or Tunnel.

For a simple service correction, the preferred inverse is another guarded `update-ingress-service` call using the newly applied service as `--expected-service` and the previous service as `--new-service`.

## Publication verification

Confirm all of the following:

1. The DNS record is proxied and targets the selected Tunnel hostname.
2. The full ingress list is unchanged except for the intended rule and catch-all remains last.
3. The origin accepts the configured protocol.
4. An unauthenticated public request is redirected to or rejected by Cloudflare Access.
5. An authorized request reaches the intended origin.
