# Agent Skills

Reusable Agent Skills for engineering, content, and service operations. Personal Agent setup and usage guides are maintained in [ai-playbook](https://github.com/frank9306/ai-playbook); this repository owns executable Skills and their development records. Each Skill is packaged under `skills/<category>/<name>` and uses progressive disclosure: a concise `SKILL.md`, optional references, deterministic scripts, and reusable assets.

## Skills

| Skill | Category | Purpose |
|---|---|---|
| [`init-docs`](skills/engineering/init-docs/SKILL.md) | Engineering | Initialize repository-owned AI engineering documentation. |
| [`init-checks`](skills/engineering/init-checks/SKILL.md) | Engineering | Enforce project-owned TypeScript/Python module contracts through checks, Codex Hooks, and CI. |
| [`capture-meeting`](skills/engineering/capture-meeting/SKILL.md) | Engineering | Convert meeting content into a structured project record. |
| [`capture-research`](skills/engineering/capture-research/SKILL.md) | Engineering | Convert sourced investigation into a cited project research record. |
| [`manage-issues`](skills/engineering/manage-issues/SKILL.md) | Engineering | Manage local Issues, their index, and the project Changelog. |
| [`maintain-context`](skills/engineering/maintain-context/SKILL.md) | Engineering | Maintain verified and durable project domain knowledge. |
| [`to-adr`](skills/engineering/to-adr/SKILL.md) | Engineering | Record confirmed architecture decisions as numbered ADRs. |
| [`route-work`](skills/engineering/route-work/SKILL.md) | Engineering | Select the correct project workflow entry point. |
| [`grill-me`](skills/engineering/grill-me/SKILL.md) | Engineering | Resolve ambiguity before creating local Issues. |
| [`model-domain`](skills/engineering/model-domain/SKILL.md) | Engineering | Discover and stress-test domain concepts and invariants. |
| [`tdd`](skills/engineering/tdd/SKILL.md) | Engineering | Implement behavior through red-green-refactor loops. |
| [`implement-issue`](skills/engineering/implement-issue/SKILL.md) | Engineering | Implement and verify one ready local Issue. |
| [`review-code`](skills/engineering/review-code/SKILL.md) | Engineering | Review Git changes against standards and requirements. |
| [`review-architecture`](skills/engineering/review-architecture/SKILL.md) | Engineering | Review a codebase for evidence-backed structural problems. |
| [`diagnose-bug`](skills/engineering/diagnose-bug/SKILL.md) | Engineering | Reproduce a bug and determine its root cause. |
| [`write-agent-docs`](skills/engineering/write-agent-docs/SKILL.md) | Engineering | Write concise, scoped project instructions for agents. |
| [`frontend-design`](skills/engineering/frontend-design/SKILL.md) | Engineering | Design, build, polish, and audit cohesive, reliable production frontends. |
| [`dispatch-dsh-task`](skills/engineering/dispatch-dsh-task/SKILL.md) | Engineering | Dispatch audited my-knowledge work from Hermes to the restricted DSH runner. |
| [`audit-codex-harness`](skills/engineering/audit-codex-harness/SKILL.md) | Engineering | Audit project-scoped Codex traces and score harness efficiency. |
| [`read-web-content`](skills/content/read-web-content/SKILL.md) | Content | Read and extract useful content from public URLs with privacy-aware fallbacks. |
| [`write-articles`](skills/content/write-articles/SKILL.md) | Content | Write evidence-led articles with factual checks and blue engineering hand-drawn knowledge-card illustrations. |
| [`manage-cloudflare`](skills/security/manage-cloudflare/SKILL.md) | Security | Safely inspect and manage Cloudflare Tunnel, DNS, and Access through the official API. |
| [`manage-tailscale`](skills/security/manage-tailscale/SKILL.md) | Security | Automate Tailscale setup, authorized enrollment, private service routing, verification, and maintenance. |

## Development workflow

Use `route-work` for the current stage, `grill-me` for unresolved behavior, and `model-domain` only for material terminology uncertainty. Before generating implementation or behavior tests, apply the shared [pre-generation module design gate](skills/engineering/implement-issue/references/module-depth-gate.md), reusing valid project contracts. `tdd` uses those public seams and `review-code` checks the design evidence and delivered behavior. `implement-issue` owns ready local Markdown Issues; other trackers keep their own lifecycle.

`init-docs` and `init-checks` are separate opt-in setup tasks. Scaffold new projects with the requested framework's native tooling. Installing a Skill does not initialize project governance, enable native Hooks, or make CI required. The unfinished `init-checks` rollout remains tracked in [ISSUE-0019](docs/issues/ISSUE-0019-add-project-owned-deep-module-checks-and-codex-feedback.md); use its templates only after project-specific validation.

See [the personal development handbook](https://github.com/frank9306/ai-playbook/blob/main/docs/development-workflow.md) for adoption and day-to-day examples. Do not maintain a second personal handbook or global instruction source here.

## Install

Install one Skill globally with the Skills CLI:

```bash
npx skills add frank9306/agent-skills --skill init-docs -g
npx skills add frank9306/agent-skills --skill init-checks -g
npx skills add frank9306/agent-skills --skill capture-meeting -g
npx skills add frank9306/agent-skills --skill capture-research -g
npx skills add frank9306/agent-skills --skill manage-issues -g
npx skills add frank9306/agent-skills --skill maintain-context -g
npx skills add frank9306/agent-skills --skill to-adr -g
npx skills add frank9306/agent-skills --skill route-work -g
npx skills add frank9306/agent-skills --skill grill-me -g
npx skills add frank9306/agent-skills --skill model-domain -g
npx skills add frank9306/agent-skills --skill tdd -g
npx skills add frank9306/agent-skills --skill implement-issue -g
npx skills add frank9306/agent-skills --skill review-code -g
npx skills add frank9306/agent-skills --skill review-architecture -g
npx skills add frank9306/agent-skills --skill diagnose-bug -g
npx skills add frank9306/agent-skills --skill write-agent-docs -g
npx skills add frank9306/agent-skills --skill frontend-design -g
npx skills add frank9306/agent-skills --skill dispatch-dsh-task -g
npx skills add frank9306/agent-skills --skill audit-codex-harness -g
npx skills add frank9306/agent-skills --skill read-web-content -g
npx skills add frank9306/agent-skills --skill write-articles -g
npx skills add frank9306/agent-skills --skill manage-cloudflare -g
```

## Validate

The Skill validator uses Node.js 18+. The complete acceptance suite also needs a supported dependency-cruiser runtime (Node 22.18+, 24, or 26+) and Python 3.10+ with the pinned test dependencies from requirements-dev.txt. Activate a project virtual environment before installing them; INIT_CHECKS_PYTHON may select an existing compatible Python environment for the checker tests. Native Hook and operating-system support still need their separate rollout evidence:

```bash
python -m pip install -r requirements-dev.txt
npm run check
npm test
node skills/engineering/frontend-design/scripts/verify-design.mjs <project-root>
python -m unittest discover -s skills/content/read-web-content/tests -p "test_*.py"
python skills/content/write-articles/scripts/check_draft.py <draft.md>
python skills/content/write-articles/scripts/check_image_specs.py <image.png> [...]
python -m unittest discover -s skills/engineering/audit-codex-harness/scripts/tests -p "test_*.py"
```

The `init-checks` Skill adds project-owned executable contracts and two verification entry points, reusing existing tools. Preview setup with `python skills/engineering/init-checks/scripts/init_checks.py --project <absolute-project-root> --profile typescript|python --contract <absolute-contract-json> --full-command <json-argv> --plan`. Generated TypeScript checks use Node; generated Python checks use Python. The full wrapper always runs structure checks before the supplied project verification command. Its acceptance tests run with `npm run test:init-checks` and are included in `npm test` (the Python checker requires the pinned Import Linter environment); follow its setup instructions to validate a real project with a deliberate violation and subsequent repair. Project Hooks require native Codex trust, and required CI status checks must be enabled in the repository host before claiming merge protection.

The frontend verifier and article checks report review leads. They do not replace browser inspection, visual review, factual verification, accessibility checks, or project-owned test evidence.

## Structure

```text
skills/
  engineering/
    <skill-name>/
      SKILL.md
      agents/openai.yaml
      references/
      scripts/
      assets/
  content/
    <skill-name>/
      SKILL.md
      agents/openai.yaml
      references/
      scripts/
      assets/
  security/
    <skill-name>/
scripts/
  check-skills.mjs
```

New Skills should remain independent: do not put domain-specific rules in the repository-level validator.

## Contributing

Follow the [Skill Naming Standard](docs/skill-naming.md) when adding or renaming a Skill.
