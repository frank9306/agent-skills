---
id: ISSUE-0033
title: "Expand daily-news official sources and prioritize DeepSeek"
status: done
priority: medium
created: 2026-11-02
updated: 2026-11-02
closed: 2026-11-02
related_adrs: []
depends_on: []
---

# ISSUE-0033: Expand daily-news official sources and prioritize DeepSeek

## Problem

Owner selected all seven official-source candidates and requested DeepSeek coverage beyond the existing optional GitHub entry.

## Desired outcome

Enable all seven selected official channels for every run, add DeepSeek homepage/docs/GitHub as mandatory checks with explicit coverage status, and synchronize the installed Skill and archive.

## Acceptance criteria

- [x] Activate the seven owner-selected Microsoft, Meta, Google AI, Amazon Science, Apple ML, ByteDance Seed and Mistral official channels as per-run scans.
- [x] Add DeepSeek homepage announcements, official docs and GitHub to mandatory checks, with per-company output status and release/date distinctions.
- [x] Preserve the yesterday-midnight window, existing supplementary/general sources, and no-scheduler behavior.
- [x] Pass metadata, reference, encoding and source/install/package identity checks and bounded read-only review.

## Out of scope

New fetch infrastructure or paid API calls, scheduler changes, unselected channels, unrelated edits, commits and pushes.

## Decisions

Reuse the instruction-only design from ISSUE-0031/0032. SKILL.md owns per-run coverage and output requirements; references/sources.md owns the official entry registry and source-specific date/claim caveats; agents/openai.yaml reflects the added DeepSeek focus. Promote the existing DeepSeek GitHub entry instead of duplicating it. All seven selected official channels must be checked for candidates each run, while relevance still determines article inclusion. Each failed channel is reported as a coverage gap rather than treated as quiet. DeepSeek official homepage links establish the provenance of announcements and model pages; official documentation is a technical source and does not automatically establish publication time. No new module or executable behavior is added.

## Implementation notes

Enabled all seven selected official channels as per-run scans: Microsoft Research Blog, Meta AI Blog, Google AI Blog, Amazon Science Blog, Apple ML Research, ByteDance Seed Blog & Publication, and Mistral News. Added DeepSeek research/news, homepage announcements, API docs and official GitHub to mandatory coverage and output status; removed the prior optional GitHub duplicate. Corrected the old ambiguous DeepSeek /news/ warning to distinguish the invalid api-docs host path from the verified www.deepseek.com/news/ index. Updated discovery/UI metadata to include DeepSeek, synchronized local installation, and rebuilt the existing daily-news.zip.

Live evidence: https://www.deepseek.com/news/ provides dated announcements and a research index; https://www.deepseek.com/ has announcement links; its banner links to https://api-docs.deepseek.com/zh-cn/guides/search/ and its model navigation reaches https://www.deepseek.com/news/deepseek-v4-1-flash/ . The latter is dated 2026-09-10, demonstrating why homepage placement or crawl time cannot be treated as today's release date. https://github.com/deepseek-ai links back to the official homepage. The seven selected official pages were verified during the preceding source-selection work in this chat; no complete news briefing was rerun in this update.

## Verification

npm run check passed (26 Skills, 3 categories). skill-creator quick_validate.py passed for source and installed daily-news. git diff --check passed with the pre-existing README line-ending warning. UTF-8 without BOM, UI metadata length/invocation, exactly seven selected expansion URLs, no duplicate DeepSeek GitHub row, archive integrity and byte-for-byte source/install/archive identity were verified.

Bounded read-only review compared the previous installed snapshot with all three changed source files using difflib.unified_diff and the existing review-code rubric. Checked all approved channels are scans rather than optional suggestions, three-company output coverage, channel failure reporting, unchanged calendar-window/general-source behavior and no added external calls/scheduler authorization. Clarified that every enabled channel must be checked even though not every channel needs a published item. No actionable findings remained. No executable code changed; unrelated runtime suites and new-chat UI discovery were not run.

Final SHA256: SKILL.md dc8690a59b4fe03d61252bf619217b4b9ff4e89181c540bf19e787791009afba; agents/openai.yaml a4c06f5acea788ee49d236a47f96fd41bf2c9f2655d9640c27f6620f0a3b24fd; references/sources.md bdb0e15b30694afb93adb2f5b21de44097a3fec99f002a0fbfaade7c92ec0fa8. No dependencies, commit, push or scheduler changes. Existing user modifications retained.

## Activity log

### 2026-11-02 — Created

Issue created from the supplied project input.

### 2026-11-02 — Status changed from proposed to ready.

### 2026-11-02 — Status changed from ready to in-progress.

### 2026-11-02 — Status changed from in-progress to done.

## Completion summary

Enabled all seven selected official channels as per-run scans and promoted DeepSeek to mandatory news/homepage/docs/GitHub coverage. Source, installed daily-news and package are synchronized and validated; calendar coverage remains yesterday 00:00 through the current run cutoff.

## Publication authorization

On 2026-11-02, the owner explicitly requested repository synchronization in the same Codex chat. This authorizes committing and pushing the daily-news implementation and its related records to the existing origin/main branch. Earlier no-commit/no-push notes describe the implementation stage before this authorization. Unrelated check-delivery, ISSUE-0030 and October Changelog edits are excluded.
