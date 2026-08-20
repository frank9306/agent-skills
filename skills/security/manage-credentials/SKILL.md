---
name: manage-credentials
description: Add, list, search, retrieve, audit, and sync credentials (API keys, tokens, passwords, secrets, personal account data) in a local Fernet-encrypted vault under the user's home directory. Use when the user says "帮我记住 X", "存一下 X", "save this", "记一下我的 X 是 Y", or when an automation needs a stored secret. Covers Agent intent recognition for save requests, mandatory data-quality checks (detect pre-masked plaintext, suspicious short secrets, duplicates), and an optional sync layer to a personal remote vault repository.
---

# Manage Credentials

Store, retrieve, and audit personal credentials in a local Fernet-encrypted vault. Recognize save intents from conversation and persist them automatically. Never invent or guess missing plaintext.

## When to load

- User asks to **save / 记住 / 存** a credential (API key, token, password, account info, personal data).
- User asks to **retrieve / 给我 / 查** a stored credential.
- An automation needs a stored secret.
- User asks to **audit / 检查 / 看看** the vault for rot or masked entries.
- User mentions multi-device sync or migrating between machines.

## Storage model

The vault lives at `<VAULT_DIR>` (default: `~/.agent-vault/`). Layout:

```text
<VAULT_DIR>/
  manifest.json         # plain metadata index: name, account, category, tags, created_at, updated_at
  entries/
    <name>.json         # one Fernet-encrypted JSON per entry: { "password": "...", "note": "..." }
  .master_key           # local-only Fernet master key (chmod 600). Never sync.
```

- **Master key**: Fernet key (`Fernet.generate_key()`) stored at `<VAULT_DIR>/.master_key` with `0600` permissions. On first run, generate one if missing.
- **Encryption**: each entry's `password` field is encrypted with the master key. `manifest.json` is plain text (no secrets).
- **Backward compatibility**: if a legacy `passwords.json` (single-file flat store) is detected at `<VAULT_DIR>/passwords.json`, run `scripts/pwmgr.py migrate` once to split into the new layout.

## Scripts

All scripts run from the skill root and read `VAULT_DIR` from env (default `~/.agent-vault`):

```bash
# Add or update
python scripts/pwmgr.py add <name> <account> <password> [note]
python scripts/pwmgr.py add --category api --tags minimax,llm <name> <account> <password>

# List and search
python scripts/pwmgr.py list                       # names only
python scripts/pwmgr.py list --category api        # filter by category
python scripts/pwmgr.py list --tag llm             # filter by tag
python scripts/pwmgr.py search <keyword>           # name / account / note / tag substring

# Retrieve (one entry, full detail)
python scripts/pwmgr.py get <name>

# Audit
python scripts/pwmgr.py audit                      # flag pre-masked, short, duplicates

# Delete
python scripts/pwmgr.py delete <name>

# Migration (legacy flat store)
python scripts/pwmgr.py migrate --from <legacy.json>

# Sync (optional)
python scripts/pwmgr.py sync status                # local vs remote divergence
python scripts/pwmgr.py sync push                  # local -> remote (encrypted only)
python scripts/pwmgr.py sync pull                  # remote -> local
```

Sync writes **only** `manifest.json` and `entries/*.json` (already encrypted) to the configured remote repository. The `.master_key` file is local-only by design.

## Agent intent recognition

When the user says any of:

- "帮我记住 / 记一下 / 存一下 X 是 Y"
- "save this / remember this"
- "my X key is Y / 我的 X 是 Y"
- "记一下我的邮箱是 foo@bar.com"

…and the value looks like a credential (API key, token, password, phone, ID number, account, email), **ask one short confirmation** with a suggested category, then run `add`:

1. Identify `name` (kebab-case short slug, e.g. `minimax-code-plan`, `wife-qq`).
2. Identify `account` (username, email, or service identifier).
3. Identify `password` (the value — must be the **full** plaintext, never truncated).
4. Identify `category` from this fixed list: `api`, `account`, `payment`, `identity`, `note`, `other`.
5. Identify `tags` (free-form, comma-separated).
6. Confirm with the user: "将保存 `<name>` 到 `<category>` 分类,标签 `<tags>`,确认吗?"
7. Run `add` with the verified plaintext. If plaintext contains `...` or is suspiciously short for its category, **refuse and route the user to retrieve the full value** (see audit section).

If the user says "我的 X 是什么 / give me my X", run `get <name>` and surface any truncation warning to the user explicitly.

## Data quality audit (mandatory before trusting a stored value)

Before returning any password to the user, run these checks. If any fails, **do not return the value as-is**:

1. **Pre-masked**: plaintext contains `...` (e.g. `sk-cp-...G720`). The full secret was never stored. Route to re-issue.
2. **Suspiciously short**: API keys should be 40+ chars; passwords 8+ chars; tokens 20+. Anything below the category minimum is suspect.
3. **Duplicate accounts**: two entries share the same `(account, category)` pair — warn the user, do not silently merge.
4. **Stale `updated_at`**: older than 365 days — warn but do not block.

The `audit` command runs checks 1–3 across the whole vault and prints a report. Use it when the user asks "我的密码都还好吗" or before any sync.

## Sync model (optional, opt-in)

Sync targets a user-owned remote repository (default convention: `frank9306/frank-store` or any Git repo the user configures). Sync is a thin wrapper around git:

- `sync push` commits `manifest.json` + `entries/*.json` to the remote. The master key file is in `.gitignore` of the remote and never leaves the local machine.
- `sync pull` rebases local entries over remote (last-write-wins by `updated_at` per entry name).
- Each device holds its own `.master_key`. Loss of the master key = loss of all data on that device, even if the remote vault is intact. The user is responsible for backing up the master key out-of-band (password manager, paper backup, etc.).

The `frank-store` repository bundles a `sync.py` skeleton that delegates to `scripts/pwmgr.py sync` and provides the `pull/push/status` interface.

## Protect secrets

- Never echo a stored password to logs, debug output, or third-party services.
- Never include `manifest.json` lines or `entries/` filenames in user-visible traces unless the user explicitly asks.
- Never run `get` to "confirm" a value to the user — that re-exposes it. Confirm by summary only (`name`, `account`, length, last-updated).
- Refuse to add an entry if the plaintext looks like it was already redacted.

## Out of scope

- Browser / OS keychain integration (Linux `secret-tool`, macOS Keychain, Windows DPAPI). Future extension.
- Encrypted backup beyond the user's own remote repository.
- Sharing entries between different master keys or different users.
