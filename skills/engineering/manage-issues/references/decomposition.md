# Issue Decomposition

Keep one Issue when a fresh agent can implement and verify the whole outcome in one coherent session.

Split when work has independent acceptance outcomes, meaningful blocking edges, or more context than one implementation session can safely hold. Prefer vertical slices that cross the necessary layers and leave the project working:

- A thin end-to-end behavior with its tests.
- A compatibility expansion before caller migration.
- One independently verifiable migration batch.

Avoid horizontal slices such as all schema work, all API work, then all UI work when none is useful alone.

For a wide mechanical change that cannot remain green as vertical slices, use expand, migrate, contract:

1. Add the new form beside the old.
2. Migrate callers in green batches.
3. Remove the old form after no caller remains.

Each generated Issue must contain its own problem, desired outcome, acceptance criteria, scope, source links, and depends_on identifiers. Create blockers first so references point to real Issue IDs.
