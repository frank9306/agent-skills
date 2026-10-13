# TypeScript and JavaScript structure checks

Prefer the project's existing boundary checker when it covers the agreed contract. The supplied adapter uses dependency-cruiser's resolved graph, including pre-compilation type dependencies and `tsconfig.json` aliases, and the TypeScript compiler's exported symbols. It does not implement a second import parser or resolver.

## Runtime and commands

The reference toolchain is Node 22.18+, 24, or 26+ (dependency-cruiser 18's supported even releases), `dependency-cruiser ^18.6.0`, and `typescript ^5.9.3`. Pin these in the project's lockfile. TypeScript 7 replaced the compiler API: this adapter fails closed when that API is unavailable. Do not downgrade an existing project's compiler; choose its compatible existing checker or explicitly adapt the tooling before claiming support.

Copy `assets/typescript/check-architecture.mjs` to `scripts/check-architecture.mjs` through the initializer. Run:

```sh
node scripts/check-architecture.mjs .
node scripts/check-architecture.mjs . --json
```

Exit codes: `0` passed, `1` structural violations, `2` unavailable tools or invalid contract/configuration. JSON is `{ "ok": boolean, "violations": [{ "rule", "from", "to", "message" }], "errors": [string] }`. The checker never edits source, installs dependencies, or rewrites the baseline. Hooks and CI invoke this same command; disabling Hooks does not disable the checker.

## Contract

All paths are exact, project-relative, case-correct paths using `/`. `public` and `exports` keys are relative to the project, not to the module. Module paths may be directories or individual files; they must not overlap. Declare all JS/TS source roots, including applications, packages, tests, and tooling configuration modules. The checker discovers `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, and `.cjs` throughout the project and rejects undeclared roots or owners.

```json
{
  "schemaVersion": 1,
  "profile": "typescript",
  "sourceRoots": ["src", "tests"],
  "modules": [
    {
      "name": "orders",
      "path": "src/orders",
      "public": ["src/orders/index.ts"],
      "exports": { "src/orders/index.ts": ["placeOrder"] },
      "allow": ["payments"],
      "testPaths": ["tests/orders"]
    },
    {
      "name": "payments",
      "path": "src/payments",
      "public": ["src/payments/index.ts"],
      "exports": { "src/payments/index.ts": ["charge", "Receipt"] },
      "allow": [],
      "testPaths": ["tests/payments"]
    }
  ],
  "externalOwners": { "stripe": ["payments"] },
  "dynamicLoaders": [],
  "baseline": [],
  "excludedPaths": ["scripts/check-architecture.mjs", "scripts/codex-checks.mjs"]
}
```

- `allow` controls direct dependencies on other domain owners. An import must satisfy both direction and public-entry access. Domain cycles fail even when the forward and reverse edges use different files.
- `externalOwners` maps an exact package or package subpath to its allowed owners. A package restriction also covers its subpaths. `node:` and bare spellings of Node built-ins cannot bypass ownership.
- `testPaths` names module-external contract test directories. These tests must import public entries, including for their own owner. Unit tests inside `module.path` may import that module's internals.
- Every public entry needs an exact export-name list, including type exports and `default`. Named reexports of the owner's own internals are allowed. Export additions, removals, and `export *` fail until the public contract is deliberately updated and reviewed.
- `dynamicLoaders` registers exact owned files allowed to compute an `import()` or `require()` target. Literal imports inside these adapters still undergo normal checks. Review each adapter's runtime allowlist; static tools cannot prove its computed target set.
- `excludedPaths` only permits explicit generated/vendor paths and the two exact managed scripts. Standard dependency/cache/output directories are skipped. Arbitrary source/test directories, configuration files, and globs are not valid exclusions. Model a configuration file as a file-owned module when needed. Other symlinks fail closed instead of silently escaping coverage.
- `baseline` entries are exact `{rule, from, to, reason}` dependency-edge exceptions, with the same concrete paths/targets printed in a violation. Only `private-import`, `forbidden-dependency`, `module-cycle`, `external-owner`, and `unresolved-import` may be baselined. A new edge cannot reuse another edge's exception; unused exceptions fail and must be removed. Export/loader/coverage gaps and missing tools cannot be baselined into a pass.

Rule IDs: `private-import`, `forbidden-dependency`, `module-cycle`, `external-owner`, `unresolved-import`, `undeclared-export`, `wildcard-export`, `computed-import`, `unclassified-source`, `unscanned-source`, and `unused-baseline`.

## Prove enforcement

Use `tests/fixtures/typescript` as a small legal reference. Run its normal command, deliberately change `orders` to import `payments/internal`, observe `private-import`, restore the import, and observe success. Repository tests also exercise aliases, type-only imports, literal dynamic imports, CommonJS, reexports, domain cycles, export drift, SDK subpaths, exact/stale baselines, and new-source discovery.

This adapter reads the root `tsconfig.json`. Projects requiring webpack/Babel-only resolution, several incompatible TS configurations, Yarn PnP, or non-JS/TS source formats need their existing native resolver/checker configured and equivalent bypass tests before rollout. Do not silently weaken the contract to accommodate unsupported resolution.

Structural success does not prove semantic module depth. The project design workflow and `review-code` still assess ownership, caller orchestration, hidden implementation knowledge, and behavior-test quality.

Sources: [dependency-cruiser API](https://github.com/sverweij/dependency-cruiser/blob/main/doc/api.md), [resolution and type-dependency options](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md).
