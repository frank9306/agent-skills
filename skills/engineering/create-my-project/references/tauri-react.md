# Tauri React

Use the officially maintained `create-tauri-app` React TypeScript scaffold. Official source: <https://v2.tauri.app/start/create-project/>.

## Prerequisites

Require `pnpm`, `rustc`, and `cargo`. If any is unavailable, stop before generation and report the missing tool; do not install system or global tools.

## Normalize the identifier

Derive the default identifier as `com.<normalized-name>.app`:

- lowercase the project name;
- replace characters outside ASCII letters and digits with hyphens;
- collapse and trim hyphens;
- use `app` if normalization becomes empty.

Use a user-supplied identifier when present.

## Create

For a target that does not exist, run from its parent:

```text
pnpm create tauri-app <project-name> --manager pnpm --template react-ts --identifier <identifier> --yes
```

For an existing empty target, run from inside it with `.` as the project name. Never pass `--force`.

Do not initialize Git. Do not add Tailwind CSS, shadcn/ui, unrelated plugins, or expanded Tauri permissions.

## Configure tests

Install the approved test tools:

```text
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
pnpm exec playwright install chromium
```

Add package scripts `test` (`pnpm test:unit && pnpm test:e2e`), `test:unit` (`vitest run`), and `test:e2e` (`playwright test`) without removing scaffold scripts.

Create `vitest.config.ts` using the React Vite plugin, `jsdom`, `tests/unit/setup.ts`, and `tests/unit/**/*.test.{ts,tsx}`. Create `tests/unit/setup.ts` importing `@testing-library/jest-dom/vitest`, plus `tests/unit/App.test.tsx` that renders the generated `App` and asserts its visible heading through an accessible query.

Create `playwright.config.ts` using Chromium, `tests/e2e`, base URL `http://127.0.0.1:4174`, and a `pnpm dev --host 127.0.0.1 --port 4174` web server. Reuse an existing server outside CI. Create `tests/e2e/home.spec.ts` that opens `/` and asserts the generated page's visible heading. Test only the Vite web surface; do not configure native Tauri WebDriver testing.

## Verify

Run inside the generated project:

```text
pnpm install
pnpm test:unit
pnpm test:e2e
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

Confirm that `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `tests/unit/`, and `tests/e2e/` exist. Report `pnpm tauri dev` as the next development command. Do not launch the GUI during verification.
