# Visual fallback

Use this path when the intended control is visible but structured observation cannot identify a usable target, such as a button painted inside a Canvas. Codex interprets the screenshot; app-use binds that image to one guarded click. This uses the current model's vision, with no separate OCR/model service or Laya vision capability.

## Look, select, click, verify

1. Bind the exact tab or desktop window and explicitly focus it using the normal observation/action workflow. Prefer a unique DOM/UIA target whenever one is available.
2. Run `node <skill>/scripts/app-use.mjs visual-observe --session <id> --out <new-PNG-file>`. The output contains `id`, `identity`, `coordinateSpace:"image-pixels"`, and `image:{mime,width,height,path}`. The CLI saves the exact PNG locally and refuses to overwrite a file. View `image.path` with `view_image` at original detail before selecting a target.
3. Identify one clearly visible target and bound it in the returned image's pixels. Use the image's reported dimensions; desktop images include window borders, and browser image pixels can differ from CSS pixels. If the displayed preview is scaled, use the original image rather than estimating from the preview. Describe the intended control briefly. If icons are indistinguishable, a control is obscured, or its meaning is uncertain, stop and resolve that ambiguity.
4. Send the visual observation `id` and region through `visual-click --request <JSON-file>`. The runtime clicks the rectangle's center after freshness and surface checks. Then verify the intended result with a new structured assertion or a fresh screenshot that you actually inspect. A dispatched click is not a verified goal.

The request shape is:

```json
{
  "session": "bound-session",
  "observation": "id-from-the-viewed-screenshot",
  "target": {
    "x": 120,
    "y": 80,
    "width": 48,
    "height": 48,
    "description": "The single triangular play icon"
  }
}
```

These example numbers are illustrative. Derive all four coordinates from the current viewed image, not a fixture's source, earlier screenshots or remembered screen positions. The description must be nonempty and at most 200 characters. All rectangle numbers must be finite, its width and height positive, and the whole rectangle inside the image. Coordinates are neither normalized values nor global screen positions. The runtime maps image pixels to the bound surface.

## Freshness and failure

The visual token lasts at most 60 seconds and is consumed by a click attempt. A new visual observation replaces it; ordinary observations/actions, adapter operations, stop or disconnect invalidate it. Do not insert another observation between viewing the image and clicking. A stale or rejected attempt requires a new screenshot and visual selection; do not reuse its coordinates automatically.

Immediately before dispatch, app-use checks the target session, current foreground/active tab, surface geometry and a fresh PNG against the stored image. It also checks the image after moving the pointer to the target: a hover highlight or a rearranged painted control requires another look, with the pointer now in place. Visible repaint, scrolling, animation, resizing, changed DPI or navigation can invalidate the click. Exact image comparison intentionally stops on change; capture a stable state and look again. These checks are not an atomic lock on an application's rendering. Bounds checks and matching pixels protect freshness, but cannot prove that the model picked the intended icon or that a painted button is semantically enabled.

Successful execution returns `actionExecuted:true, goalVerified:false` with a fresh observation and diagnostics. The goal remains unverified until its result is checked. Preserve errors and uncertain results instead of retrying a business write blindly.

## Supported surfaces and privacy

Browser visual clicks address the visible main document; iframe targets and pinch-zoom viewports are refused. Use structured frame targets where available. Desktop visual clicks stay inside the prepared foreground window and its current physical geometry. Only a single left click is supported by this fallback.

Browser capture refuses sensitive fields, including fields outside a narrowed observation. Desktop screenshots retain password masking and visual clicks refuse masked password regions. Captures after sensitive input remain refused. Use sanitized fixtures for screenshot-based acceptance and keep images local.

Visual operations are interactive session commands. They do not add free-form coordinates, model-selected actions or vision branching to frozen runner cases. For repeatable tests, retain structured assertions and the runner's declared actions; record real visual acceptance separately.
