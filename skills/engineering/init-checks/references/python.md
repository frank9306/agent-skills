# Python project checks

Reuse an existing boundary checker first. Otherwise install the tested development dependency **`import-linter==2.15`** through the project's existing package manager and lockfile. The copied `scripts/check_architecture.py` requires Python 3.10+ and runs without Node:

```sh
python scripts/check_architecture.py .
python scripts/check_architecture.py . --json
```

Exit codes are `0` (pass), `1` (structural violations), and `2` (configuration, parse, dependency, or engine error). JSON is `{ "ok": boolean, "violations": [{ "rule", "from", "to", "message" }], "errors": [] }`. Missing dependencies never count as pass. Use the same environment and commands locally, in Codex, and in CI.

## Project contract

The shared `.architecture.json` schema is version 1. All paths are project-relative POSIX paths. `sourceRoots` are Python import search directories, typically `src`; they are not package names. `modules` declare non-overlapping file or directory ownership, explicit `public` Python files, matching `exports` lists, allowed module dependencies, and external `testPaths`. `externalOwners` maps an import's top-level package to the permitted owner names. `dynamicLoaders` names the few reviewed source files allowed to perform nonliteral loading. `baseline` contains exact `rule` / `from` / `to` / nonempty `reason` entries.

```json
{
  "schemaVersion": 1,
  "profile": "python",
  "sourceRoots": ["src"],
  "modules": [
    {
      "name": "orders",
      "path": "src/orders",
      "public": ["src/orders/__init__.py"],
      "exports": {"src/orders/__init__.py": ["place"]},
      "allow": [],
      "testPaths": ["tests"]
    }
  ],
  "externalOwners": {"sqlite3": ["orders"]},
  "dynamicLoaders": [],
  "baseline": [],
  "excludedPaths": ["scripts/check_architecture.py", "scripts/codex_checks.py"]
}
```

The public entry re-exports explicitly named behavior and uses one literal `__all__` matching its configured exports. Helpers and incidental imports use underscore-prefixed names. Star imports, dynamic public `__getattr__`, and mutation of `__all__` fail. Public symbol imports and ordinary module attribute access are also checked against the declared export list.

## Discovery and checks

- Grimp discovers and resolves imports, including relative imports, aliases, and imports under `TYPE_CHECKING`; native Import Linter protected contracts enforce private access, allowed direct dependencies, and infrastructure ownership. Cross-owner edges use Grimp's native reachability analysis to detect cycles, including cycles whose edges occur in different files. No custom Python dependency resolver replaces the engine.
- The adapter uses native contract classes and is deliberately pinned to Import Linter 2.15. Dependency upgrades require rerunning the acceptance suite and updating the adapter/version check together. Its AST supplement checks exports, explicit dynamic imports, loading guards, and source coverage.
- Use importable regular packages with `__init__.py`, including the external test package. Root package initializers must be explicitly owned. In `src/app/orders` / `src/app/billing`, assign `src/app/__init__.py` to a separate file module rather than declaring an overlapping `src/app` owner. A minimal bootstrap exports no names and has `__all__ = []`. Namespace packages and loose top-level scripts require adapting and proving discovery before enabling this template; this version fails rather than silently omitting them.
- All project `.py` files are inventoried, including newly added source roots and packages. Unowned files fail; source omitted by the native graph fails. Metadata and dependency caches are ignored. `excludedPaths` permits generated/vendor/build directories and exact managed checker/Hook scripts; it cannot hide an owned module. Do not exclude source directories to make the check pass.
- External `testPaths` must not overlap a module or another contract-test path. Contract tests may only call public entries. Module-internal tests can access their owner's implementation; production cannot import external contract tests.
- Literal `importlib.import_module` calls, including relative imports with a literal package, enter the same native graph checks. Ordinary aliases and constant `getattr` loader access are recognized. Nonliteral loading, module attribute lookup, `exec`, `eval`, and `compile` require a reviewed `dynamicLoaders` entry. Registered loaders still undergo static import and literal dynamic import checks.
- Baselines suppress only an exact dependency edge (`private-import`, `forbidden-dependency`, `module-cycle`, `external-owner`, or `unresolved-import`), never a directory or wildcard. Export, computed-loader, coverage, and baseline control failures cannot be exempted. Resolved, mismatched, duplicate, or wildcard baselines fail. Remove an exemption when its coupling is removed; adding or changing exemptions requires diff review.

These checks are structural engineering controls, not a Python security sandbox. Arbitrary reflection, monkeypatching, custom loaders, or runtime-generated code can defeat static reasoning. Keep such capabilities within reviewed loader adapters and cover their behavior with integration tests. Interface depth and correct business ownership remain design/review decisions.

## Acceptance and integration

Run the source fixture through **pass → illegal private import fails → restored public import passes** before installing Hooks. The regression suite uses the actual dependency engine:

```sh
INIT_CHECKS_PYTHON=/path/to/project/python python -m unittest discover -s skills/engineering/init-checks/tests -p test_python_checks.py
```

On Windows set `$env:INIT_CHECKS_PYTHON` in PowerShell instead. If unset, tests use the current interpreter, which must have the pinned engine installed. Required cases cover private and type-only imports, aliases, dependency direction, cross-module cycles, new/unresolved source, export changes, dynamic loaders, infrastructure ownership, external tests, and exact baseline cleanup. CI executes the checker directly without Hooks, so disabling local Hooks does not disable the merge check. Keep Hook trust and branch protection setup as explicit verified integration steps.

Primary references: [Import Linter protected contracts](https://import-linter.readthedocs.io/en/stable/contract_types/protected/), [Grimp graph construction and queries](https://grimp.readthedocs.io/en/stable/usage.html). The native API adapter is covered by the pinned-engine acceptance tests; the documentation is not a promise of API stability.
