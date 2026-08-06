# Interaction and Content

## Organize around user intent

Make orientation, status, primary action, supporting detail, and recovery paths easy to find. Use progressive disclosure for complexity, not hidden navigation for ordinary tasks. Keep destructive and irreversible actions visually and spatially distinct.

## Define complete states

Design every reachable state that materially changes user action:

- initial, loading, refreshing, and optimistic
- empty with a useful next action
- partial data and stale data
- validation and recoverable error
- offline or unavailable dependency
- disabled with an understandable reason
- permission denied and authentication required
- success and undo where recovery is feasible
- destructive confirmation and irreversible completion

Do not use a spinner where content structure can be preserved with a skeleton. Do not show an empty state while data is still unknown.

## Write interface copy

- Name controls by the result users recognize: "Save changes", not "Submit".
- Keep the action name consistent across button, progress, toast, and history.
- Use sentence case, active voice, concrete nouns, and plain verbs.
- Explain what failed and the smallest recovery action.
- Make labels label, examples demonstrate, and help text clarify; do not make one string do several jobs.
- Preserve domain terminology when users rely on it. Avoid exposing implementation names.

## Provide feedback

Every action needs proportionate feedback. Prefer immediate local acknowledgement. Reserve persistent banners and dialogs for conditions that genuinely interrupt the workflow. High-frequency keyboard actions should not animate as a default.
