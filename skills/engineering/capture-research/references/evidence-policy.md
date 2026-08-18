# Research Evidence Policy

## Source quality

Prefer evidence in this order when it is relevant and current:

1. Project-owned code, tests, configuration, records, and direct experiment output.
2. Primary sources such as official documentation, standards, specifications, datasets, and research papers.
3. Reputable secondary analysis that identifies its primary evidence.
4. Informal discussion used only as a lead or clearly labeled experience report.

Authority does not guarantee applicability. Record version, date, environment, and scope when they affect whether a source applies to the project.

## Claim discipline

- Give each source a stable `S<n>` identifier and cite it beside supported claims.
- Use `Source-supported findings` only for claims the cited material directly supports.
- Put comparisons, extrapolations, recommendations, and combined interpretations under `Analysis and synthesis`.
- Record conflicting evidence without silently selecting a winner.
- Label an experiment result as an observation, including inputs, environment, method, output, and whether it was reproduced.
- Mark unsupported but useful possibilities as open questions, not conclusions.

## Provenance

For each source, record its title or description, origin or repository path, author or publisher when known, publication or version date when known, access date for external material, and relevant limitations. Never expose secrets, tokens, private endpoints, or sensitive data in the record.

## Promotion boundary

A research conclusion remains advisory until the user or an authoritative project source confirms it. Use the owning Skill to promote confirmed outcomes: `to-adr` for technical decisions, `manage-issues` for work, and `maintain-context` for durable domain knowledge.
