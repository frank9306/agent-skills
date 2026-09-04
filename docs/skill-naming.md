# Skill Naming Standard

Skill directory names and frontmatter `name` values use lowercase kebab-case with an action-oriented prefix:

```text
<verb>-<artifact>
```

Keep names to two components unless the artifact has an established compound name. Put trigger details and scope boundaries in the Skill description instead of the name.

## Prefixes

| Prefix | Use when | Examples |
|---|---|---|
| `init-` | Safely creating a durable baseline, normally once per project | `init-project`, `init-docs` |
| `to-` | Transforming existing input into a new structured artifact | `to-adr`, `to-report` |
| `capture-` | Bringing external source material into the project | `capture-meeting` |
| `manage-` | Owning an artifact's complete lifecycle and indexes | `manage-issues` |
| `maintain-` | Keeping durable project knowledge aligned with verified facts | `maintain-context` |
| `clarify-` | Resolving requirement ambiguity before work is created | `clarify-requirements` |
| `model-` | Actively discovering and stress-testing a domain representation | `model-domain` |
| `design-` | Shaping a bounded technical structure before implementation | `design-modules` |
| `implement-` | Executing one bounded engineering artifact | `implement-issue` |
| `review-` | Assessing work against explicit standards or requirements | `review-code` |
| `diagnose-` | Reproducing a problem and determining its cause | `diagnose-bug` |
| `route-` | Selecting one owning workflow without performing its work | `route-work` |
| `write-` | Creating or revising a maintained document for a defined audience | `write-agent-docs` |
| `migrate-` | Safely changing an existing persisted structure or convention | `migrate-context` |
| `sync-` | Reconciling two existing sources of truth | `sync-docs` |

## Semantic rules

- `init-` Skills must be safe to rerun, must not overwrite user content, and must not own later maintenance.
- `to-` Skills name the output artifact, not the input source. For example, a confirmed decision becomes `to-adr`.
- `capture-` Skills preserve source provenance and distinguish sourced facts from model inference.
- `manage-` Skills may create, update, close, index, and archive their artifact; use a plural artifact name when the Skill owns a collection.
- `maintain-` Skills update only durable facts. They must not turn temporary progress or speculation into project truth.
- Review and diagnosis Skills report findings unless their descriptions explicitly authorize remediation.
- `route-` Skills select one primary owning Skill and preserve that Skill's authorization and stage gates.
- Established engineering acronyms may stand alone when expansion would reduce recognition, such as `tdd`.

## Number and wording

- Use a singular artifact for one-output transformations: `to-adr`, `to-report`.
- Use a plural artifact for collection lifecycle management: `manage-issues`, `manage-releases`.
- Keep uncountable concepts singular: `maintain-context`.
- Prefer the ecosystem's official spelling for technologies: `init-fastapi`, `init-tauri`.
- Avoid redundant suffixes and implementation details in names.

## Selection guide

```text
Create a reusable baseline?       init-
Transform input into an artifact? to-
Import external source material?  capture-
Own a complete lifecycle?         manage-
Maintain durable project truth?   maintain-
Resolve requirement ambiguity?    clarify-
Discover a domain model?          model-
Shape a technical structure?      design-
Implement one bounded artifact?   implement-
Assess quality or compliance?      review-
Find a root cause?                 diagnose-
Select an owning workflow?        route-
Create or revise a document?       write-
Convert an existing structure?    migrate-
Reconcile existing sources?       sync-
```

Every new Skill must follow this standard. Renames must update the directory, `SKILL.md` frontmatter, `agents/openai.yaml`, repository documentation, commands, tests, and cross-Skill references together.
