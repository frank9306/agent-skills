# Frozen case contract

The executable contract and examples are maintained alongside the runner. A case binds a prepared `session`, `id`, `version:1`, `start`, a state map, optional `prepare`/`cleanup` action lists, local `inputs`, a `projectRoot` and declared build metadata. Defaults: step 5000 ms, case 120000 ms, max 100 steps; explicit positive bounded overrides are accepted.

For a large app, freeze `observation:{selector,context,limit}` for a browser, or `observation:{scope:{name,role}}` for a unique desktop subtree. Omit unused fields. Each runner read uses that declared scope; it must be complete, and model decisions apply only to it. A browser limit is at most 1000. This changes observation scope, never the frozen expected values.

Each state owns one `action`, `assert`, `wait`, `branch`, `judge` or `finish`, plus its fixed next state. Actions in scripts use exact `match` objects resolved against each fresh observation, rather than replaying ephemeral IDs. Assertions have a target match, property and literal equals. Waits use the same assertion and a finite timeout. Rules precede a declared semantic fallback. Semantic candidates carry fixed IDs, meanings and next states; include an unknown candidate. An unknown choice or a probability below minProbability stops unverified. The model cannot add actions, destinations or assertions.

The runner snapshots JSON before execution and binds file/tool/artifact digests. Reports distinguish pass, fail, unverified, error and stopped. A pass requires at least one executed successful non-N/A assertion and successful completion; unreachable required assertions cannot silently disappear. Business assertion failures are fail; missing controls, invalid scripts, timeouts and execution failures are error. No valid assertion is unverified. Cleanup is explicit; cancellation dispatches no new actions, including cleanup.

Preparation and cleanup share the user's current browser/site state. Declare any test-created data/tabs and restore only those resources. Supply a meaningful build readback assertion if build identity matters; a source hash is not a running-build attestation. Screenshots are local and may contain business data: use controlled sanitized fixtures and keep secrets out of observed regions.

Example state map (put it in a version-1 case with the prepared session and `start:"ready"`):

```json
{
  "ready": {"wait":{"assertion":{"target":{"selector":"#ready"},"property":"name","equals":"Ready v1"},"timeoutMs":5000},"next":"input"},
  "input": {"action":{"type":"fill","match":{"selector":"#input"},"text":"Controlled result"},"next":"apply"},
  "apply": {"action":{"type":"click","match":{"selector":"#apply"}},"next":"goal"},
  "goal": {"assert":{"target":{"selector":"#result"},"property":"name","equals":"Controlled result"},"next":"done"},
  "done": {"finish":"complete"}
}
```

An assertion target supports exact `id/role/name/value/automationId/context/selector` fields; each match must be unique. Assertion properties are `name/value/enabled/visible/focused/selected/role`. An absent wait target may become ready; ambiguity/incomplete/property-unavailable is an error. A normal assertion with the wrong literal is `fail`; stale, disabled or occluded execution is `error` with retained evidence. `branch:{rules:[{when:<assertion>,next:"state"}],otherwise:"judge"}` runs deterministic rules before an optional `judge` state. Judge shape: `{question,options:[{id,meaning,next},{id:"unknown",meaning,unknown:true}],minProbability,timeoutMs:60000}`. Exactly one unknown candidate has no destination. The worker checks complete context/candidate token budgets, never truncates into a decision, and returns only IDs/probabilities. The runner validates them and reobserves before dispatch; changed UI stops unverified. Cancellation kills the owned worker and discards late replies.

Evidence includes the frozen script, durable `events.jsonl`, report, screenshots, tool/input/artifact digests, target identity and runtime build pipe. `inspect` rejects edited/deleted inputs, tools, report or artifacts. An interrupted run with no final report remains unverified; its event log is still available. This is integrity checking, not signed attestation against a malicious local user. `build` is a declaration; a required literal UI assertion must provide actual running-build readback.

## Layout adapter

Import `createPageAdapter(client,session)` from `scripts/page-adapter.mjs`; pass it to sibling frontend-design's unchanged `checkUI(page,contract,options)`, and revalidate its saved `reportPath` with `verifyUIReport`. Prepare/focus the actual tab first. Missing sibling checker must be reported as an unavailable layout prerequisite. Call `page.dispose()` to release remote handles. No layout algorithm is copied into app-use.

Supported checker subset: page `evaluate/evaluateHandle/viewportSize/locator/waitForFunction/url/context().browser().version()/content/screenshot`; locator `count/isVisible/waitFor(visible)/textContent/inputValue/evaluate/boundingBox/elementHandle/scrollIntoViewIfNeeded`; handle `evaluate/dispose`; keyboard `press`; mouse `move/wheel`. Viewport/url/version bind at creation, so recreate after navigation or resize. Screenshot supports viewport PNG only. Main-frame CSS selectors must be unique; cross-frame UI operations use normal observed context IDs. This is a small adapter contract, not full Playwright compatibility. Existing project browser tests remain unchanged.
