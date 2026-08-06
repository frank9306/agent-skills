# Dependency and Configuration Risk

Inspect the lockfile, package manager, framework versions, build configuration, lint rules, TypeScript settings, and CI commands before proposing changes.

- Prefer platform or existing-project capabilities for small features.
- Before adding a dependency, document purpose, installed and transitive cost, maintenance status, license, browser/runtime support, and existing alternatives; obtain approval.
- Verify APIs against the installed version and official documentation. Do not rely on remembered latest-version behavior.
- Do not weaken strictness, lint, tests, security headers, or build checks to make generated code pass.
- Keep configuration changes narrowly scoped and explain downstream effects on builds, editors, tests, and deployment.
- Treat major upgrades, lockfile replacement, bundler migration, and authentication changes as separately approved work.
- Inspect bundle and runtime evidence before making performance claims about a dependency.

Report exact files and version evidence. Distinguish an observed incompatibility from a package that merely appears old.
