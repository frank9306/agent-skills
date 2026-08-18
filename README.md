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
| [`tdd`](skills/engineering/tdd/SKILL.md) | Engineering | Implement behavior through red-green-refactor loops. |
| [`implement-issue`](skills/engineering/implement-issue/SKILL.md) | Engineering | Implement and verify one ready local Issue. |
| [`review-code`](skills/engineering/review-code/SKILL.md) | Engineering | Review Git changes against standards and requirements. |
| [`diagnose-bug`](skills/engineering/diagnose-bug/SKILL.md) | Engineering | Reproduce a bug and determine its root cause. |
| [`frontend-design`](skills/engineering/frontend-design/SKILL.md) | Engineering | Design, build, polish, and audit cohesive, reliable production frontends. |
| [`read-web-content`](skills/content/read-web-content/SKILL.md) | Content | Read and extract useful content from public URLs with privacy-aware fallbacks. |
| [`write-articles`](skills/content/write-articles/SKILL.md) | Content | Write evidence-led articles with factual checks and blue engineering hand-drawn knowledge-card illustrations. |

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
npx skills add frank9306/agent-skills --skill tdd -g
npx skills add frank9306/agent-skills --skill implement-issue -g
npx skills add frank9306/agent-skills --skill review-code -g
npx skills add frank9306/agent-skills --skill diagnose-bug -g
npx skills add frank9306/agent-skills --skill frontend-design -g
npx skills add frank9306/agent-skills --skill read-web-content -g
npx skills add frank9306/agent-skills --skill write-articles -g
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
scripts/
  check-skills.mjs
```

New Skills should remain independent: do not put domain-specific rules in the repository-level validator.

## Contributing

Follow the [Skill Naming Standard](docs/skill-naming.md) when adding or renaming a Skill.
