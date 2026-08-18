---
name: diagnose-bug
description: Diagnose a reported bug, test failure, intermittent behavior, or performance regression by reproducing it, minimizing the feedback loop, testing hypotheses, and establishing an evidence-backed root cause. Use for diagnosis only; create a local Issue for the confirmed fix instead of modifying production code.
---

# Diagnose a Bug

Determine the cause before proposing a fix. Do not modify production code, implement the fix, or claim a root cause from correlation.

## Protect evidence

Read root agent instructions, relevant local Issues, Context, ADRs, logs, tests, configuration, and affected code. Redact secrets and sensitive user data from commands, notes, and reports. Read references/diagnosis-loop.md.

## Reproduce and minimize

Write the observed behavior, expected behavior, environment, and known-good comparison. Find the narrowest existing command that fails on this bug. Run it repeatedly when intermittency matters and record exact outcomes.

Reduce irrelevant inputs, layers, and timing without changing the failure. If a reliable reproduction cannot be established, report that limit and the highest-value evidence still needed; do not move on to confident causal claims.

## Test hypotheses

List plausible hypotheses ranked by evidence. For each, name an observation that would distinguish it, run a read-only diagnostic check, and update the ranking. Separate symptom, trigger, contributing condition, and root cause.

Confirm the root cause only when evidence explains the reproduction and rules out credible alternatives. Use history or a known-good comparison when it strengthens causality.

## Produce a fix-ready Issue

Return reproduction steps, failing command, minimized case, confirmed root cause, supporting evidence, rejected hypotheses, affected scope, proposed correction boundary, and the regression test that should fail before the fix.

Use $manage-issues to create a proposed local Issue containing that evidence when the root cause is confirmed. If it is unavailable, return the complete Issue-ready brief and report the missing Skill. Do not transition the Issue to ready until desired behavior and acceptance criteria are settled. Do not implement the fix; hand it to $implement-issue after clarification and readiness.
