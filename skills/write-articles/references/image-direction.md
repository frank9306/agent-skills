# Image direction

## Default delivery

- Generate finished images unless the user explicitly opts out.
- Create one cover image plus one image for every core claim and every warning or conclusion that deserves strong attention. Do not set a numeric cap.
- Deliver each finished image as a 16:9 PNG. Use 1600×900 by default.
- Treat SVG, HTML, masks, and intermediate model outputs as working files. Keep them only when the user asks for editable sources.

## Separate style from layout

Use the blue engineering hand-drawn knowledge card as the default visual language unless the user or target publication provides a different art direction. Keep that visual language consistent across an article, not the layout. Reuse:

- warm off-white paper background;
- fine graphite or colored-pencil outlines with slight natural irregularity;
- soft, low-saturation watercolor or marker fills with subtle paper grain;
- muted blue for rules, structure, paths, and the main process;
- green for successful checks, repairs, and reliable feedback;
- orange-yellow for choices, pending work, differences, and reminders;
- restrained red only for failures, risks, and blocked actions;
- rounded Chinese lettering and concise programmatic labels;
- one recurring friendly blue-white rounded robot when an Agent or guide needs embodiment;
- engineering objects such as repositories, maps, workbenches, notebooks, tools, gates, screens, paths, and inspection marks when they explain the claim;
- generous negative space and a consistent bottom-right watermark.

Keep the tone educational, practical, and friendly rather than cinematic. Remove decorative objects that do not explain the article. Do not repeat the same phone, card, shield, or three-column template across an image set. Do not simulate hand drawing by placing clean UI cards inside slightly uneven borders.

## Choose a composition by meaning

| Meaning | Preferred composition | Typical visual metaphor |
| --- | --- | --- |
| Sequence or workflow | Journey, curved path, stepping stones, assembly line | A robot moving between documents, tools, or stations |
| Mechanism | Cutaway, central machine, hub-and-spoke | Inputs entering a visible mechanism and outputs leaving it |
| Comparison | Matched split scene or three-way fork | Parallel roads, shelves, workbenches, or labeled zones |
| Selection | Signpost, branching path, decision gate | One traveler choosing among clearly different destinations |
| Capability boundary | Bridge plus gate, key and lock, fenced zone | Connection exists but a permission checkpoint remains |
| Packaging or delivery | Toolbox, parcel, backpack, storefront | Skills and integrations packed into one installable unit |
| Warning or misconception | Before/after scene, blocked route, crossed-out action | A character attempting the wrong action and meeting a guardrail |
| Evidence or numbers | Programmatic chart or annotated source excerpt | Verified data with restrained illustration around it |

Use a three-column layout only when the content genuinely contains three peer concepts. Even then, create one connected scene rather than three repeated UI containers.

## Hybrid production

Choose the production path before writing the prompt:

1. **Narrative illustration:** Generate a text-free hand-drawn scene with an image model. Add all Chinese text, label containers, and watermark afterward programmatically.
2. **Illustrated infographic:** Generate characters, objects, or background as separate text-free assets. Assemble them with programmatic label containers, text, arrows, and callouts.
3. **Diagram or chart:** Build the complete graphic programmatically. Use generated art only as optional decoration.
4. **Document or UI explanation:** Draw simplified document or interface objects programmatically when exact labels matter; avoid screenshots invented by an image model.

Never ask an image model to render authoritative Chinese text, numbers, quotations, filenames, code, or data. Reserve clean whitespace around signposts, documents, buttons, and callout anchors in the generated foundation. Do not ask the model to draw the final label borders: model-drawn containers rarely match measured text geometry and cause overflow or optical misalignment.

## Deterministic label composition

When local Node.js tooling is available, use `scripts/compose_knowledge_card.mjs` to build a self-contained SVG intermediate from a raster foundation. The compositor creates each rounded label box and its centered text from the same `x`, `y`, `width`, and `height`, calculates a conservative font size, and stops when the copy cannot fit above `minFontSize`.

Create a UTF-8 JSON configuration such as:

```json
{
  "width": 1600,
  "height": 900,
  "artwork": "foundation.png",
  "output": "composed.svg",
  "defaults": {
    "minFontSize": 20,
    "maxFontSize": 32,
    "paddingX": 24,
    "paddingY": 14
  },
  "labels": [
    {
      "x": 110,
      "y": 52,
      "width": 620,
      "height": 92,
      "text": "让关键能力形成持续闭环"
    }
  ]
}
```

Run:

```bash
node scripts/compose_knowledge_card.mjs --config composition.json
```

Use exact final copy in the configuration. Do not estimate a text center from a box already drawn by the image model. Adjust the declared box geometry, line breaks, copy length, or minimum font size deliberately when the compositor rejects a label. Never bypass the rejection by accepting clipped text.

## Explanation copy hierarchy

Every finished explanatory image must contain enough programmatically typeset copy to explain the scene without relying on the article body:

1. **Title:** one clear claim, normally 14–24 Chinese characters.
2. **Object labels:** name the two to four subjects, destinations, or stages that carry the metaphor.
3. **Explanatory callouts:** one short action or causal explanation for each major subject; normally 6–16 Chinese characters.
4. **Takeaway:** one visually prominent conclusion or rule, normally no more than 24 Chinese characters.
5. **Watermark:** the approved publication or author identity.

Use labels as part of the scene: signboards, document headings, speech bubbles, tags, arrows, or a compact conclusion sticker. Keep the illustration dominant. Do not replace visual explanation with paragraphs, repeated cards, or a table. A cover may omit detailed callouts, but it still needs a title and takeaway or subtitle.

Before rendering, write the exact copy in a production table with columns for `role`, `text`, `anchor object`, and `placement`. Reject vague labels such as “功能”“能力”“内容” when a more specific phrase is available.

## Typography and label treatment

Match the reference look with bold, rounded, hand-lettered Chinese rather than a formal UI sans serif:

- Prefer an installed rounded handwritten Chinese face such as `FZYaoti` / `方正姚体`; fall back to `YouYuan`, `KaiTi`, then `Microsoft YaHei` only when necessary.
- Use near-black `#171B19`, bold weight, compact line height, and slightly loose Chinese character spacing.
- Keep characters upright and highly legible; the hand-drawn quality should come from the typeface and container, not from warping glyphs.
- Put titles and important labels inside warm cream `#FFFDF7` or a restrained pale-blue fill with a 2–4 px muted-blue outline such as `#5278A3` and 10–14 px corner radius.
- Use 30–44 px for the main title, 20–28 px for object labels and callouts, and 16–18 px for the watermark on a 1600×900 canvas.
- Avoid condensed corporate fonts, thin gray UI text, monospaced code styling for Chinese prose, glossy pills, gradients, pure-black heavy borders, and shadow-heavy labels.

Render a short Chinese font proof before producing the full set. Confirm that all glyphs exist and that the result remains readable near 750 px display width.

## Image specification

For every image define:

- the exact paragraph and claim it supports;
- one-sentence visual thesis: what the reader should understand without reading the caption;
- one primary metaphor and one focal action;
- composition archetype and eye path;
- main subject, supporting objects, foreground, background, and reserved text zones;
- palette, line quality, depth, and aspect ratio;
- the functional meaning of every blue, green, orange-yellow, or red accent;
- exact title, object labels, explanatory callouts, takeaway, and watermark to overlay;
- exclusions that prevent factual errors, visual clutter, generic corporate UI, photorealism, 3D rendering, and unwanted text;
- caption, alt text, disclosure label, and watermark.

## Production sequence

1. Stabilize the article and list the required images.
2. Write a distinct visual thesis and metaphor for each image.
3. Select the composition from the meaning table; reject repeated layouts unless repetition is semantically necessary.
4. Create a monochrome composition sketch or explicit spatial plan before final generation.
5. Generate the text-free foundation or programmatic diagram.
6. Inspect composition, character anatomy, object logic, and reserved text space before adding labels.
7. Define exact label copy and box geometry. Add the full explanation copy hierarchy and watermark programmatically; use the deterministic compositor when available. Check that every major visual object has a clear meaning.
8. Render the intermediate to a 1600×900 PNG.
9. Inspect the PNG at full size and near 750 px article width. For every label, verify exact copy, horizontal and vertical centering, containment, internal padding, legibility, and crop safety. A valid SVG, successful render, or correct dimensions do not replace this visual check.
10. Regenerate or revise the weakest dimension until the image passes. Compare all images as a set for consistency and repetition.

## Watermark

- Always show the exact proposed watermark string and ask the user to confirm it before final image production. Confirmation is required even when publication and author identity appear obvious.
- Combine multiple confirmed identifiers into one concise line using ` · ` unless the user requests another separator. Example: `knowledge.webfrank.top · Frank的知识库`.
- Place it inside the bottom-right safe area, at least 28 px from the right and bottom edges on a 1600×900 canvas.
- Use a single-line text watermark at 14–18 px, medium weight, with 55–70% opacity.
- Keep wording, typography, position, color, and opacity identical across the article's image set.
- Do not invent an account name, logo, handle, or copyright claim.
- Reconfirm when the project, publication, author, domain, or requested wording changes. Reuse confirmation only within the same image-production request.

## Hard failures

Do not deliver an image when any of these are present:

- incorrect, garbled, clipped, or model-generated Chinese text;
- label text outside its container, visibly off-center, touching the border, or reduced below the minimum readable size;
- repeated template layout that does not match the claim;
- no clear focal subject or action;
- missing title, missing object explanations, or no explicit takeaway;
- decorative scene that fails to explain the paragraph;
- broken anatomy, impossible object geometry, inconsistent recurring character, or contradictory arrows;
- unsupported data or a generated scene presented as documentary evidence;
- missing watermark, wrong dimensions, unreadable labels, or content inside unsafe crop margins.
