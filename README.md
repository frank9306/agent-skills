# Agent Skills

A growing collection of reusable Agent Skills. Each Skill is self-contained under `skills/<name>` and uses progressive disclosure: a concise `SKILL.md`, optional references, deterministic scripts, and reusable assets.

## Skills

| Skill | Purpose |
|---|---|
| [`frontend-design`](skills/frontend-design/SKILL.md) | Design, build, polish, and review cohesive production frontend interfaces. |

## Install

Install one Skill globally with the Skills CLI:

```bash
npx skills add frank9306/agent-skills --skill frontend-design -g
```

## Validate

The repository checks use Node.js 18+ and run on Windows, macOS, and Linux without platform-specific shell scripts:

```bash
npm run check
node skills/frontend-design/scripts/verify-design.mjs <project-root>
```

The frontend verifier reports static review leads. It does not replace browser, accessibility, or project-owned test evidence.

## Structure

```text
skills/
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
