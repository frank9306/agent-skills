# Agent Skills

A growing collection of reusable Agent Skills. Each Skill is self-contained under `skills/<category>/<name>` and uses progressive disclosure: a concise `SKILL.md`, optional references, deterministic scripts, and reusable assets.

## Skills

| Skill | Category | Purpose |
|---|---|---|
| [`init-project`](skills/engineering/init-project/SKILL.md) | Engineering | Create minimal React, Tauri, Typer, and FastAPI projects with official scaffolds. |
| [`init-docs`](skills/engineering/init-docs/SKILL.md) | Engineering | Initialize repository-owned AI engineering documentation. |
| [`capture-meeting`](skills/engineering/capture-meeting/SKILL.md) | Engineering | Convert meeting content into a structured project record. |
| [`capture-research`](skills/engineering/capture-research/SKILL.md) | Engineering | Convert sourced investigation into a cited project research record. |
| [`manage-issues`](skills/engineering/manage-issues/SKILL.md) | Engineering | Manage local Issues, their index, and the project Changelog. |
| [`maintain-context`](skills/engineering/maintain-context/SKILL.md) | Engineering | Maintain verified and durable project domain knowledge. |
| [`to-adr`](skills/engineering/to-adr/SKILL.md) | Engineering | Record confirmed architecture decisions as numbered ADRs. |
| [`route-work`](skills/engineering/route-work/SKILL.md) | Engineering | Select the correct project workflow entry point. |
| [`clarify-requirements`](skills/engineering/clarify-requirements/SKILL.md) | Engineering | Resolve ambiguity before creating local Issues. |
| [`model-domain`](skills/engineering/model-domain/SKILL.md) | Engineering | Discover and stress-test domain concepts and invariants. |
| [`design-modules`](skills/engineering/design-modules/SKILL.md) | Engineering | Design stable module ownership, interfaces, and test seams. |
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
| [`manage-credentials`](skills/security/manage-credentials/SKILL.md) | Security | Manage credentials in a local encrypted vault with audit and optional encrypted sync. |
| [`manage-cloudflare`](skills/security/manage-cloudflare/SKILL.md) | Security | Safely inspect and manage Cloudflare Tunnel, DNS, and Access through the official API. |
| [`manage-tailscale`](skills/security/manage-tailscale/SKILL.md) | Security | Automate Tailscale setup, authorized enrollment, private service routing, verification, and maintenance. |
| [`sync-ai-environment`](skills/environment/sync-ai-environment/SKILL.md) | Environment | Initialize, check, synchronize, and upgrade a managed global AI environment. |

## Install

Install one Skill globally with the Skills CLI:

```bash
npx skills add frank9306/agent-skills --skill init-project -g
npx skills add frank9306/agent-skills --skill init-docs -g
npx skills add frank9306/agent-skills --skill capture-meeting -g
npx skills add frank9306/agent-skills --skill capture-research -g
npx skills add frank9306/agent-skills --skill manage-issues -g
npx skills add frank9306/agent-skills --skill maintain-context -g
npx skills add frank9306/agent-skills --skill to-adr -g
npx skills add frank9306/agent-skills --skill route-work -g
npx skills add frank9306/agent-skills --skill clarify-requirements -g
npx skills add frank9306/agent-skills --skill model-domain -g
npx skills add frank9306/agent-skills --skill design-modules -g
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
npx skills add frank9306/agent-skills --skill manage-credentials -g
npx skills add frank9306/agent-skills --skill manage-cloudflare -g
npx skills add frank9306/agent-skills --skill sync-ai-environment -g
```

## Validate

The repository checks use Node.js 18+ and run on Windows, macOS, and Linux without platform-specific shell scripts:

```bash
npm run check
npm test
node skills/engineering/frontend-design/scripts/verify-design.mjs <project-root>
python -m unittest discover -s skills/content/read-web-content/tests -p "test_*.py"
python skills/content/write-articles/scripts/check_draft.py <draft.md>
python skills/content/write-articles/scripts/check_image_specs.py <image.png> [...]
python -m unittest discover -s skills/engineering/audit-codex-harness/scripts/tests -p "test_*.py"
```

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
  environment/
    <skill-name>/
scripts/
  check-skills.mjs
```

New Skills should remain independent: do not put domain-specific rules in the repository-level validator.

## Contributing

Follow the [Skill Naming Standard](docs/skill-naming.md) when adding or renaming a Skill.
