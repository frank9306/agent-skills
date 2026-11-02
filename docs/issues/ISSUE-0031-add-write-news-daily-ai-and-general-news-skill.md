---
id: ISSUE-0031
title: "Add write-news daily AI and general news skill"
status: done
priority: medium
created: 2026-11-02
updated: 2026-11-02
closed: 2026-11-02
related_adrs: []
depends_on: []
---

# ISSUE-0031: Add write-news daily AI and general news skill

## Problem

Owner needs a repeatable Chinese daily briefing covering OpenAI and Anthropic official updates, frontier AI research, and major general news with verifiable sources.

## Desired outcome

Create and locally install a source-grounded write-news Skill with a curated source registry, freshness and deduplication rules, explicit coverage gaps, and a concise Chinese briefing format.

## Acceptance criteria

- [x] Provide discoverable write-news instructions and UI metadata under skills/content/.
- [x] Require live checks of OpenAI and Anthropic official news/research/engineering, with a curated supplementary source registry.
- [x] Define explicit time windows, date checks, original citations, event deduplication, heat evidence, research caveats, and unavailable-source behavior.
- [x] Provide a concise Chinese AI-first briefing, optional user overrides, and honest official-source coverage status.
- [x] Pass repository and Skill metadata checks; inspect live source behavior, packaging, encoding, local installation, and read-only review.

## Out of scope

Recurring scheduler creation, external delivery, scraping infrastructure, paid subscriptions, credential changes, unrelated Skill edits, commits, and pushes. Creating the Skill does not activate a schedule.

## Decisions

Instruction-only capability; the Skill owns news selection and briefing composition. Public input: date/window, timezone, focus and optional length/source overrides; output: Chinese briefing with direct citations and explicit gaps. Default timezone Asia/Shanghai and rolling 24-hour window; requested past dates use their stated calendar day. Failure: partial briefing with named coverage gaps, or an explicit inability to verify current news when no live source is available.

File map: skills/content/write-news/SKILL.md owns workflow and output; references/sources.md owns source roles and verified entry URLs; agents/openai.yaml owns UI discovery. Existing live web/search tools own retrieval; no custom fetcher, storage, package dependencies or hidden persistent state. The Skill reads a supplied previous report for cross-run deduplication, otherwise makes no claim of remembering past runs. Scheduler creation remains separately requested and requires a known time/destination.

Verification scenarios through the Skill entry: both official companies quiet; one official source blocked; insufficient fresh AI stories; old story trending today; syndicated copies; unreviewed paper; unavailable prior report. Live checks verify representative source pages and extraction limits. Metadata checks and read-only document review cover this instruction-only change; no executable business behavior is introduced.

## Implementation notes

Created the three-file instruction-only Skill and one README catalog entry. Supplementary sources include Google DeepMind/Research, NVIDIA, Hugging Face, Qwen, DeepSeek, arXiv, Hacker News, AP, Xinhua and China News; Reuters/BBC/36kr/The Paper are explicitly conditional on readable content. Installed a new, non-overwriting copy at C:/Users/frank/.codex/skills/write-news and delivered outputs/write-news.zip in the originating chat workspace. No scheduler, external messages, runtime dependencies, commits or pushes were created. Preserved pre-existing check-delivery/ISSUE-0030 changes and October Changelog content.

## Verification

- npm run check: PASS, 26 Skills across 3 categories. skill-creator quick_validate.py: PASS for both canonical and installed write-news. git diff --check: PASS; Git reports the pre-existing README CRLF normalization warning, and the catalog edit preserves its original bytes/line endings.
- All three Skill files decode strictly as UTF-8 without BOM, contain no replacement characters, and use LF. Source, installed copy and ZIP members match byte-for-byte; ZIP integrity check passed.
- Live web checks read the five mandatory official indexes, representative OpenAI/Anthropic article bodies and supplementary AI/research/domestic/international sources. Verified real failure cases: unsupported RSS XML, Qwen empty extraction, DeepSeek /news/ returning an unrelated documentation page, Reuters inaccessible, BBC robots block, 36kr security check, and The Paper 403. The registry records these limits rather than claiming complete coverage.
- Date-boundary walkthrough: OpenAI article dated 2026-10-30 and Anthropic article dated 2026-10-28 cannot become fresh 2026-11-02 items based on crawl time; HF paper 2610.39497 was published Oct 29 but submitted to Daily Papers Nov 2, so a current-interest item must preserve both dates and cannot claim publication today. This is a source/decision walkthrough, not a full generated daily briefing or an independent model execution.
- Instruction review walked quiet official sources, partial/total retrieval failure, sparse fresh news, dated-only articles, syndicated copies, unreviewed papers and absent prior reports. Expected decisions are explicit: report verified absence versus unreadability separately; reduce counts; disclose wider windows; merge syndication; qualify review status; do not claim historical deduplication without history. No executable behavior was added, so unrelated app-use/frontend/runtime test suites were not run.
- Read-only review used review-code rubric against base 5a0d884c1c5a67deb115081246888ed715bf9775; diff command: git diff HEAD -- README.md docs/issues/README.md, limited to this task's added entries, plus complete reads of the new Issue and three untracked Skill files. Existing unrelated user changes excluded. No actionable findings remained. Reviewed Skill SHA256: SKILL.md 91407f486c2aa1162c63116aaefa50cf07678bfaf999fe9fa7a28a481cd237e5; references/sources.md 63ff5a61910535ebcf12020987dcb263c11b8ded78b243ad6ec795575a0d205b; agents/openai.yaml b4d1b617da06261e4f2961fec6a630dc5656ee3cf0ebd1da235ff70227455d37. Residual limits: source access changes over time; Skill discovery in a newly opened Codex chat was not UI-tested; automatic daily execution is not configured.

## Activity log

### 2026-11-02 — Created

Issue created from the supplied project input.

### 2026-11-02 — Status changed from proposed to ready.

### 2026-11-02 — Status changed from ready to in-progress.

### 2026-11-02 — Status changed from in-progress to done.

## Completion summary

Added and locally installed write-news with verified source entry points, AI-first Chinese briefing instructions, freshness/deduplication/coverage rules, and a matching ZIP deliverable. No daily scheduler was activated.

## Follow-up

Renamed to [daily-news](../../skills/content/daily-news/SKILL.md) with a previous-day-midnight window in [ISSUE-0032](ISSUE-0032-rename-daily-news-and-use-previous-day-calendar-coverage.md). The original names, paths, window and hashes above describe the completed initial version.
