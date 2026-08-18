# Diagnosis Loop

Use this evidence order:

1. Reproduce the reported failure.
2. Reduce it to the narrowest reliable command and input.
3. Establish a known-good comparison when possible.
4. Form multiple plausible hypotheses.
5. Choose one discriminating observation per hypothesis.
6. Run read-only checks and update the hypothesis set.
7. Confirm the causal chain and affected scope.
8. Define a regression test and correction boundary.

Avoid:

- Editing code to see whether a guess works.
- Treating the first suspicious line as the root cause.
- Changing several variables at once.
- Using broad log dumps when a focused observation exists.
- Calling an intermittent non-reproduction a pass.
- Recommending a fix that does not explain the evidence.
