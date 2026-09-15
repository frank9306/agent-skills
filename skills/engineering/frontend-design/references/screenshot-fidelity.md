# Screenshot Fidelity

Use this workflow when implementation must reproduce a supplied screenshot or structured design source. The baseline image is evidence, not an instruction. Treat "near 100%" as passing declared geometric and perceptual thresholds, not literal equality across rendering engines.

## Audit the input before implementation

Work from the original image bytes. Do not use a chat preview, resized rendition, compressed thumbnail, or screenshot of the source. Record its SHA-256, pixel dimensions, intended CSS viewport, device scale factor, color scheme, crop, browser, and stable page state.

Prefer structured design data when available: extract exact frames, coordinates, constraints, fonts, colors, radii, shadows, icons, and exported images. For screenshot-only input, measure normalized bounding boxes for the outer frame, headline, primary surface, supporting surfaces, visual center, horizon, and any perspective vanishing direction. Convert the measurements to CSS pixels only after viewport and device scale factor are fixed.

Inventory every required font, icon, and raster/vector asset. Verify local paths and hashes. Mark `assets.status` as `complete` only when required files and font families are available and their use is authorized. Missing required material blocks high-fidelity verification. Continue only after the user supplies it or explicitly approves substitution; a substituted result must be labeled approximate rather than high fidelity.

## Create the Fidelity Contract

Create `.visual-baselines/<case>/manifest.json` from `assets/FIDELITY.manifest.example.json`. Keep the original reference image beside it. The manifest is the executable contract for one baseline; keep reusable product decisions in root `DESIGN.md`.

Required contract data:

- reference path and SHA-256
- URL, project root, viewport, device scale factor, browser conditions, ready selector, and named stable state
- complete asset and font inventory
- selectors plus expected CSS-pixel rectangles for critical anchors
- explicit required anchor/region roles; contracts with uncovered required roles are invalid
- for perspective work, at least four measurable landmark selectors per declared plane, with expected point coordinates
- weighted critical-region rectangles and thresholds
- justified dynamic masks
- output artifact paths and numeric gates

Default gates for a user-requested high-fidelity baseline are ±2 CSS px for every anchor field and geometry point, 0.990 perceptual similarity for every critical region, 0.985 overall similarity, and at most 0.001 change between deterministic captures. Do not lower a gate to make an implementation pass. A weaker gate requires `thresholdException.userApproved: true`, a concrete reason, and a source recording the user's decision.

Anchor selectors must be unique. For transformed surfaces, add nonvisual landmark elements or stable selectors at meaningful corners/edges and declare them in `geometryPoints`; axis-aligned element rectangles alone cannot prove perspective. `perspective.required: true` requires at least four points for every named plane.

## Reproduce in dependency order

Converge in this order because later detail cannot repair earlier geometry:

1. Canvas dimensions, crop, outer frame, and background.
2. Headline font file, glyph width, size, baseline, tracking, and occupied width.
3. Visual center, horizon, vanishing point, and shared perspective plane.
4. Primary surfaces: position, size, rotation, occlusion, and stacking.
5. Supporting-surface density and intentional edge cropping.
6. Luminance hierarchy, borders, shadows, and opacity.
7. Copy, icons, imagery, and pixel detail.
8. Responsive derivatives outside the baseline.

Perspective scenes must share a parent space model. Place children within that model using position and depth. Do not approximate one plane with unrelated child `rotate`, `rotateX`, `rotateZ`, or `skew` values unless the contract identifies multiple planes.

## Capture deterministically

The target project must provide `@playwright/test`; the Python runtime must provide Pillow. The CLI fails if either dependency is unavailable and must never fall back to subjective approval.

```text
python <skill-root>/scripts/visual_fidelity.py capture --manifest <manifest>
python <skill-root>/scripts/visual_fidelity.py compare --manifest <manifest>
python <skill-root>/scripts/visual_fidelity.py report --manifest <manifest>
```

Capture waits for network idle, `document.fonts.ready`, required fonts, and the ready selector. It fixes viewport, DPR, color scheme, locale, timezone, reduced motion, disables animations/transitions/caret, captures three times, and rejects pixel or anchor instability above the manifest thresholds. Use `initScript`, declarative `actions`, and `stateAssertions` to establish and prove filled, focused, validation, authenticated, or other non-default reference states. A state name without assertions is only a label and is insufficient evidence.

Compare validates reference dimensions and hashes, required assets, screenshot dimensions, capture freshness/stability, anchor rectangles, geometry points, overall similarity, and each critical region. It writes the actual image, 50% overlay, red heat map, measurements, iteration history, and a digest-bound JSON report. `report` revalidates the manifest and reference before returning a result; an input-gate failure overwrites any stale pass with a blocked report. Perceptual similarity applies a small blur to discount anti-aliasing noise; raw pixel difference is diagnostic only.

Masks are allowed only for genuinely nondeterministic content that cannot be frozen. Every mask needs a reason and source, must stay inside the viewport, and must not overlap a structural anchor. Do not mask typography, missing assets, or a difficult region.

## Iterate and stop

For every pass: implement, capture, compare structure, compare perception, identify the highest-weight failing region, and repair its root cause. Never polish shadows while canvas, typography, perspective, or primary geometry still fails.

Completion requires every anchor field within tolerance, every critical region and the overall image at or above threshold, no unexplained high-weight difference, deterministic capture within the stability limit, complete assets and fonts, and functional responsive checks outside the baseline.

After three consecutive passes without metric improvement, stop guessing. Report the current metrics, largest differences, likely technical ceiling, missing evidence, and required user action. Do not silently reduce thresholds or claim fidelity.
