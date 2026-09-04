# Scoring model

The collector emits versioned diagnostic scores from 0 to 100. They are useful for triage and controlled regression comparisons, not as universal benchmarks.

## Dimensions

| Dimension | Composite weight | Primary evidence |
|---|---:|---|
| Task completion and verification | 25 | Successful test, lint, check, or build commands |
| Context efficiency | 20 | Per-call input growth, large contexts, cache reuse |
| Tool efficiency | 20 | Failed calls and identical repeated calls |
| Trajectory efficiency | 15 | Long sessions and excessive delegation |
| Model and reasoning efficiency | 10 | Reasoning share relative to generated output |
| Stability | 10 | Interruptions and sessions without final answers |

Operational efficiency normalizes the five non-outcome dimensions to 100. Composite harness score is `75% operational + 25% completion evidence` and remains null when no objective verification was observed.

## Interpretation

- 90–100: A, lean in the observed sample.
- 80–89: B, generally healthy with measurable opportunities.
- 70–79: C, recurring inefficiency.
- 60–69: D, substantial friction.
- Below 60: F, severe measured waste or instability.

Confidence is high at 20 sessions and 100 token-bearing calls, medium at 5 sessions and 20 calls, and low otherwise. Parser warnings can prevent high confidence.

Do not compare scores across scoring versions, materially different task classes, models, reasoning efforts, or graders. A high operational score without objective outcomes means only that the observed trajectory was lean.
