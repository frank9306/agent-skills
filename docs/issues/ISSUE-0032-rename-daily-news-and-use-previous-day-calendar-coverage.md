---
id: ISSUE-0032
title: "Rename daily-news and use previous-day calendar coverage"
status: done
priority: medium
created: 2026-11-02
updated: 2026-11-02
closed: 2026-11-02
related_adrs: []
depends_on: []
---

# ISSUE-0032: Rename daily-news and use previous-day calendar coverage

## Problem

Owner selected daily-news and wants coverage from yesterday at local midnight through the current run cutoff, plus official company source candidates to select.

## Desired outcome

Rename source, installed Skill, active catalog and package consistently; update window and overlapping-report rules; present verified official-source candidates without enabling unselected channels.

## Acceptance criteria

- [x] Rename canonical and installed Skill folders, frontmatter, invocation prompt, active README entry and downloadable archive to daily-news, without leaving active write-news duplicates.
- [x] Default to yesterday 00:00 in the user timezone through a frozen run cutoff, search all covered dates, preserve explicit historical date overrides, and handle overlap without dropping key news.
- [x] Present a verified shortlist of official company news/blog sources for owner selection; leave the existing source registry unchanged until selections arrive.
- [x] Validate metadata, source/install/archive identity, UTF-8 and reference consistency; preserve unrelated user changes and historical Issue/Changelog records.

## Out of scope

Source activation before owner selection, scheduler creation, new dependencies, unrelated edits, commits and pushes. Historical Issue filenames/titles and completed Changelog entries retain their original provenance.

## Decisions

Reuse ISSUE-0031 instruction-only design: inputs, outputs and retrieval ownership remain unchanged. The owner explicitly selected daily-news, overriding the repository default verb-artifact naming preference for this Skill only. Rename its three-file directory and installed copy; SKILL.md owns the calendar-window and overlap rules, agents/openai.yaml owns the new invocation prompt, and references/sources.md remains the unchanged active source registry.

The lower bound is local midnight of the calendar day before the frozen cutoff date, computed by calendar subtraction in the selected timezone rather than 24 hours before cutoff. Explicit user windows and single-date history requests remain authoritative. Search both covered calendar dates. Existing prior-report context marks continuing important events as already reported or updated rather than silently discarding them. Verify normal evening, month boundary, year boundary and explicit historical-day decisions. No executable runtime behavior or new module boundary is introduced; metadata checks and bounded instruction review are appropriate.

The source shortlist will cite confirmed official landing pages and describe their distinct coverage. Some attempted endpoints are invalid, under maintenance or unreadable; exclude them from the primary recommendations. Choosing candidates does not activate them in the Skill.

## Implementation notes

Renamed the canonical three-file Skill and local Codex installation from write-news to daily-news, updated metadata/invocation and the active README entry, and renamed/rebuilt outputs/daily-news.zip with only daily-news/ members. Updated time-window, all-covered-date search, and overlap instructions. Added a follow-up pointer to ISSUE-0031 while preserving its original evidence and title; historical indexes and Changelog entries intentionally retain that provenance. No additional sources were enabled.

Official-source shortlist for owner selection:
1. Microsoft Research Blog: https://www.microsoft.com/en-us/research/blog/ (research and evaluations); Microsoft AI official news has moved to https://news.microsoft.com/source/topics/ai/.
2. Meta AI Blog: https://ai.meta.com/blog/ (models, multimodal and open research).
3. Google AI Blog: https://blog.google/innovation-and-ai/technology/ai/ (product/platform AI updates, complements already-enabled DeepMind/Research).
4. Amazon Science Blog: https://www.amazon.science/blog (reasoning, robotics, ML, cloud/systems research).
5. Apple ML Research: https://machinelearning.apple.com/ (on-device models, inference and ML research).
6. ByteDance Seed Blog & Publication: https://seed.bytedance.com/en/research/ (Seed models, image/video/audio, Agent and infrastructure research).
7. Mistral News: https://mistral.ai/news/ (additional frontier lab, open models, coding and speech).

Live source checks confirmed the above official pages have meaningful content. Do not promote failed/unrelated entry guesses into a default channel: volcengine.com/blog showed an error/help shell; research.baidu.com/Blog is under maintenance; generic Seed /blog endpoints were empty but the research/ Blog & Publication page works; Tencent AI Lab /news served an unrelated app landing page and Hunyuan root extracted no text. Owner can select by shortlist number in chat; future source edits remain pending that selection.

## Verification

- npm run check: PASS, 26 Skills across 3 categories. skill-creator quick_validate.py: PASS for both canonical and installed daily-news; git diff --check: PASS (existing README CRLF normalization warning only).
- Source/install/archive files match byte-for-byte, ZIP testzip passed, all Skill text strictly decodes as UTF-8 without BOM, local references resolve, UI prompt names $daily-news, and no active old-name directory or old archive remains. Runtime source registry SHA256 remains 63ff5a61910535ebcf12020987dcb263c11b8ded78b243ad6ec795575a0d205b, proving unselected channels were not activated.
- Manual calendar decision walkthrough: 2026-11-02 18:00 Asia/Shanghai starts 2026-11-01 00:00 (42 hours); 2026-12-01 starts 2026-11-30 00:00; 2027-01-01 starts 2026-12-31 00:00; explicit history date uses its own calendar-day range. Instructions fix the cutoff before retrieval, search every covered date, and label still-important overlapping items already reported or updated.
- Final read-only review used the existing review-code rubric and ISSUE-0031 instruction-only design. Scope: three renamed Skill files, current README row, ISSUE-0031 follow-up note, ISSUE-0032/index/Changelog updates, and source/install/package identity. Inspected final instructions and references; no actionable findings remained. No executable business code changed, so unrelated runtime suites and an additional complete news-generation run were not performed. New-chat UI discovery is not claimed.
- Final Skill SHA256: SKILL.md 51ea410ab7ba361d8b6c6296e86e9e19b536794ad7491d2da89336ea8dc33926; agents/openai.yaml 426d08c7b16ed5f3a6d593830dd17a39866d229a8dd0545faa851a0f5c585bf2; references/sources.md 63ff5a61910535ebcf12020987dcb263c11b8ded78b243ad6ec795575a0d205b. Preserved unrelated check-delivery/ISSUE-0030/October Changelog changes; no commit, push or scheduler change.

## Activity log

### 2026-11-02 — Created

Issue created from the supplied project input.

### 2026-11-02 — Status changed from proposed to ready.

### 2026-11-02 — Status changed from ready to in-progress.

### 2026-11-02 — Status changed from in-progress to done.

## Completion summary

Renamed the canonical and installed Skill plus package to daily-news; default coverage now starts yesterday at local midnight through a frozen run cutoff, with overlap handling. Prepared seven verified official-source candidates for owner selection; active sources remain unchanged.

## Follow-up

The owner subsequently selected all seven candidates and requested DeepSeek; activation is tracked in [ISSUE-0033](ISSUE-0033-expand-daily-news-official-sources-and-prioritize-deepseek.md).
