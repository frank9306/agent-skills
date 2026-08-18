# TypeScript React Vite

Use the official Vite React TypeScript scaffold. Official source: <https://vite.dev/guide/>.

## Prerequisite

Require `pnpm`. If it is unavailable, stop and report that requirement; do not install it globally.

## Create

For a target that does not exist, run from its parent:

```text
pnpm create vite <project-name> --template react-ts --no-interactive
```

For an existing empty target, run from inside it:

```text
pnpm create vite . --template react-ts --no-interactive
```

Do not initialize Git. Do not add Tailwind CSS, shadcn/ui, a router, or unrelated dependencies.

## Configure tests

Install the approved unit, component, and browser test tools:

```text
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
pnpm exec playwright install chromium
```

Add package scripts `test` (`pnpm test:unit && pnpm test:e2e`), `test:unit` (`vitest run`), and `test:e2e` (`playwright test`) without removing scaffold scripts.

Create `vitest.config.ts` using the React Vite plugin, `jsdom`, `tests/unit/setup.ts`, and `tests/unit/**/*.test.{ts,tsx}`. Create `tests/unit/setup.ts` importing `@testing-library/jest-dom/vitest`, plus `tests/unit/App.test.tsx` that renders the generated `App` and asserts visible scaffold behavior through an accessible query.

Create `playwright.config.ts` using Chromium, `tests/e2e`, base URL `http://127.0.0.1:4173`, and a `pnpm dev --host 127.0.0.1 --port 4173` web server. Create `tests/e2e/home.spec.ts` that opens `/` and asserts the generated page's visible heading. Reuse an existing server outside CI; do not launch one manually during verification.

Inspect the generated scaffold before choosing assertions. Test user-visible behavior, not implementation details.

## Verify

Run inside the generated project:

```text
pnpm install
pnpm test:unit
pnpm test:e2e
pnpm build
```

Confirm that `package.json`, a `vite.config.*` file, a TypeScript configuration, `tests/unit/`, and `tests/e2e/` exist. Report `pnpm dev` as the next development command.
