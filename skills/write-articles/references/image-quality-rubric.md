# Image quality rubric

Inspect the final PNG, not only the prompt or editable source. Score each dimension from 0 to 10.

## Scoring

- **Explanatory power:** The title, scene, object labels, callouts, and takeaway make the main claim understandable without the article body.
- **Composition:** One focal action, intentional eye path, balanced negative space, and no accidental crowding.
- **Visual craft:** Organic hand-drawn line work, coherent palette, credible anatomy and objects, and sufficient depth.
- **Typography and accuracy:** Chinese text uses the approved rounded hand-lettered treatment; numbers, filenames, arrows, caption relationship, dimensions, and confirmed watermark are correct and readable.
- **Originality and set consistency:** The image avoids generic templates while preserving the article's character, palette, and illustration language.

Require at least 45/50. Require explanatory power, composition, and typography and accuracy to reach at least 9/10 each. Any hard failure in `image-direction.md` makes the image fail regardless of score.

## Review at two sizes

1. Inspect at 1600×900 for anatomy, line quality, text accuracy, watermark, clipping, and rendering artifacts.
2. Inspect at approximately 750 px wide for WeChat readability, focal clarity, and visual hierarchy.

## Revision policy

- Fix labels, spacing, watermark, and simple arrows programmatically.
- Regenerate when the metaphor, focal action, anatomy, object logic, or overall composition is weak.
- Change the prompt and composition plan before retrying; do not repeat the same prompt and hope for a better seed.
- Compare adjacent images. If two images share the same layout without a semantic reason, redesign one.
- Keep a rejected image only as diagnostic evidence; never place it in the article.

## Set-level acceptance

Before delivery, confirm:

- every core claim has a distinct visual thesis;
- every image contains a descriptive title, labels for its major subjects, and an explicit takeaway;
- the recurring character is recognizable across all narrative scenes;
- no two consecutive images use the same composition archetype;
- palette, outline style, texture, label typography, and watermark remain consistent;
- images add explanation rather than restating headings inside decorative containers.
