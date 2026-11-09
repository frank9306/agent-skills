# Reviewed project plan, version 1

The owner of project acceptance reviews the inventory and commands before use. `requiredDelivery` is the existing project contract, not a list chosen to make a run green. Store the plan inside the project and include relevant architecture, configuration, tests, source and acceptance documents. Directory inputs collect all ordinary files, including untracked/new files; `.git`, `node_modules` and `.codex` are excluded. Symbolic links and common credential files are rejected. Keep secrets out of all declared inputs and check output. Generated outputs belong outside the input inventory. The plan itself is always hashed.

```json
{
  "version": 1,
  "inputs": ["src", "tests", "package.json", "package-lock.json", "AGENTS.md", "docs/agents"],
  "checks": [
    {"id":"unit-slice","command":"node","args":["node_modules/vitest/vitest.mjs","run","src/example.test.ts"],"stages":["slice"],"timeoutMs":60000},
    {"id":"unit","command":"node","args":["node_modules/vitest/vitest.mjs","run"],"stages":["module","delivery"],"timeoutMs":120000},
    {"id":"build","command":"node","args":["C:/verified/npm/bin/npm-cli.js","run","build"],"stages":["delivery"],"timeoutMs":120000}
  ],
  "requiredDelivery":["unit","build"],
  "context": {
    "always":["AGENTS.md","docs/issues/active.md"],
    "documents":[{"path":"docs/context/CONTEXT.md","phases":["implement","qa"]}]
  }
}
```

This is a schema example, not a complete acceptance plan. Replace paths/commands and retain actual lint/typecheck/architecture/design/browser gates. Commands are argv arrays executed without a shell in the project cwd. `node` means the running executable; other commands must be absolute executables. Windows `.cmd` wrappers are not executables: invoke Node with their verified CLI module. Do not install dependencies or auto-repair the environment. Output must be a private directory disjoint from the project.

```text
NODE SKILL/scripts/team-delivery.mjs context --project P --plan P/delivery.json --out PRIVATE --task FRA-X --session RUN-ID --agreement PLAN-V1 --actor developer --phase implement
NODE SKILL/scripts/team-delivery.mjs check --project P --plan P/delivery.json --out PRIVATE --stage slice --only unit-slice
NODE SKILL/scripts/team-delivery.mjs check --project P --plan P/delivery.json --out PRIVATE --stage delivery
NODE SKILL/scripts/team-delivery.mjs freeze --project P --plan P/delivery.json --out PRIVATE --receipt PRIVATE/runs/RUN/receipt.json
NODE SKILL/scripts/team-delivery.mjs verify --project P --plan P/delivery.json --out QA-PRIVATE --bundle BUNDLE --bundle-id ID-FROM-NATIVE-HANDOFF
```

Receipt trust is local operational provenance, not cryptographic authorship. The content-addressed seal detects tampering relative to the trusted ID supplied in the native handoff. QA verifies input coverage, independently executes checks, and retains its native verdict. Never derive the trusted ID solely from an untrusted bundle. Do not treat a developer's editable receipt as independent test evidence. A valid integrity check does not establish behavioral correctness.

`context` hashes project/plan/task/session/agreement/actor and emits mandatory current documents plus changed/unseen phase documents. Default 24,000-byte budget applies only to optional loads; mandatory authority may exceed it. A deferred document is not marked read. A new task/session/actor/agreement or explicit `--reset` reloads. If output is truncated, or session context was compacted, rerun with reset and scoped inputs. One actor is the only writer for a scoped receipt; do not run parallel context calls for the same actor/session.

## Browser VM

Use existing Playwright MCP and the allowed browser evidence root; do not expand filesystem roots. `browser-kit` emits an async function expression. In a UTF-8 case file, wrap the emitted source mechanically as:

```js
async (page) => {
  const batch = /* paste the browser-kit.js function expression here */;
  await page.goto('PROJECT_AUTHORIZED_URL');
  await page.getByRole('button', {name:'Existing label'}).waitFor({state:'visible'});
  const results = await batch(page, [
    {id:'label',kind:'text',selector:'#status',expected:'Ready'},
    {id:'contrast',kind:'contrast',selector:'#status',minimum:4.5}
  ]);
  return {passed:results.length>0 && results.every(r=>r.passed),results};
}
```

Use the MCP tool's documented `code`/`filename` field as actually exposed. Do not import a test runner, use Node globals or fixed sleeps. Batch state assertions after observable readiness; interactions remain explicit and project-owned. Helper contrast uses computed foreground and alpha-composited ancestor backgrounds; gradients, group opacity, filters or blending fail as unsupported and need a project-specific measurement. Covered content is ordinary DOM text; overlays/pseudo-elements/images and actual visibility need independent inspection. Never relax the threshold or treat unsupported as passed. Preserve all required viewport/theme/interaction cases and screenshots.
