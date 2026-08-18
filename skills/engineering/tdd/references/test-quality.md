# Test Quality

Prefer tests that:

- Name observable behavior in domain language.
- Enter through a public interface or stable seam.
- Use literal expected values derived from the requirement.
- Survive internal renames and refactors.
- Fail for one understandable reason.
- Exercise real collaborators until a slow, nondeterministic, destructive, or externally controlled boundary makes a test double necessary.

Avoid tests that:

- Reimplement the production algorithm to calculate expectations.
- Assert private calls, incidental ordering, or internal data shapes.
- Mock the unit under test or every collaborator.
- Depend on wall-clock timing, shared mutable state, or the network without isolation.
- Pass when the target behavior is removed.

For a regression, first make the test fail against the unfixed behavior. Preserve the test after the fix.
