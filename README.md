# Agent Skills

A growing collection of reusable Agent Skills. Each Skill is self-contained under `skills/<category>/<name>` and uses progressive disclosure: a concise `SKILL.md`, optional references, deterministic scripts, and reusable assets.

## Skills

| Skill | Category | Purpose |
|---|---|---|
| [`create-my-project`](skills/engineering/create-my-project/SKILL.md) | Engineering | Create minimal React, Tauri, Typer, and FastAPI projects with official scaffolds. |
| [`frontend-design`](skills/engineering/frontend-design/SKILL.md) | Engineering | Design, build, polish, and audit cohesive, reliable production frontends. |
| [`read-web-content`](skills/content/read-web-content/SKILL.md) | Content | Read and extract useful content from public URLs with privacy-aware fallbacks. |
| [`write-articles`](skills/content/write-articles/SKILL.md) | Content | Write evidence-led articles with factual checks and blue engineering hand-drawn knowledge-card illustrations. |

## Install

Install one Skill globally with the Skills CLI:

```bash
npx skills add frank9306/agent-skills --skill create-my-project -g
npx skills add frank9306/agent-skills --skill frontend-design -g
npx skills add frank9306/agent-skills --skill read-web-content -g
npx skills add frank9306/agent-skills --skill write-articles -g
```

## Validate

The repository checks use Node.js 18+ and run on Windows, macOS, and Linux without platform-specific shell scripts:

```bash
npm run check
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
