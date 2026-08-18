# Local Issue Lifecycle

Allowed transitions:

- proposed to ready or cancelled
- ready to in-progress or cancelled
- in-progress to blocked, done, or cancelled
- blocked to ready, in-progress, or cancelled

Requirements:

- Ready: problem, desired outcome, and concrete acceptance criteria are settled.
- In progress: implementation has started and the Activity log records the start.
- Blocked: the Issue records the blocker and the condition that will unblock it.
- Done: every acceptance checkbox is checked, verification is recorded, and Completion summary describes the delivered outcome.
- Cancelled: Completion summary records why the work will not proceed.

Changelog categories are Added, Changed, Fixed, Removed, Security, Documentation, and Cancelled. Use Cancelled automatically for cancelled Issues.
