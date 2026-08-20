# Data Quality Audit Reference

The `audit` command runs four checks across every vault entry. Use this reference when explaining findings to the user or building custom integrations.

## Check 1 — Pre-masked plaintext

A plaintext containing `...` was almost certainly written in truncated form (`sk-cp-...G720`, `****abcd`). Decryption returns the same masked string; the full secret was never stored.

**Action**: route the user to retrieve the full value from the service console and re-issue. Never invent the missing portion.

## Check 2 — Suspiciously short plaintext

Minimum lengths enforced per category at write time:

| Category | Minimum length |
|---|---|
| `api` | 40 chars |
| `account` | 6 chars |
| `payment` | 8 chars |
| `identity` | 8 chars |
| `note` | 1 char |
| `other` | 1 char |

API keys are typically base64/url-safe, no internal whitespace. Anything below the minimum is treated as suspect and refused at `add` time.

## Check 3 — Duplicate accounts

Two entries with the same `(account, category)` pair suggest the user accidentally saved the same credential twice (perhaps with an updated password). The audit reports both names so the user can decide which to keep.

## Check 4 — Stale `updated_at`

Entries last updated more than 365 days ago are flagged as stale. This is advisory only — the audit does not auto-rotate or block access.

## Implementation note

`audit` performs all decryption in-process. On a vault of N entries, this is N `Fernet.decrypt` calls plus JSON parsing — typically <100 ms even for 1000 entries. For very large vaults, consider running `audit` against a filtered subset (`list --category api && get` per name) instead of the full sweep.
