# Visual storytelling

## Convert prose into a scene

Do not illustrate nouns in isolation. Visualize the actor, action, obstacle, and result.

Use this transformation:

```text
claim → causal action → physical metaphor → focal scene → supporting labels
```

Example:

```text
Claim: A Skill tells an Agent to read a form before performing a complex action.
Action: The Agent reads instructions, then continues.
Metaphor: A traveler checks a route sign before taking the correct road.
Scene: A friendly robot walks from SKILL.md to forms.md along a curved path.
Labels: “复杂操作先读 forms.md” and “复用读文件能力”.
```

## Scene rules

- Give the image one protagonist and one focal action.
- Let the eye travel through foreground, action, and result; use paths, gaze, gestures, or arrows sparingly.
- Show cause and effect spatially. Place the cause before or to the left of the result unless another direction is necessary.
- Use background objects to establish a world, not to fill every empty area.
- Reserve at least 20% quiet space for labels and breathing room.
- Limit major explanation groups to three or four, but ensure every major subject is labeled and the image includes an explicit takeaway. Move secondary detail into the caption when the image becomes crowded.
- Prefer familiar physical objects—roads, doors, bridges, boxes, keys, maps, workbenches—over abstract dashboards.

## Character continuity

When using a recurring robot guide, define and repeat:

- rounded white body, dark navy face screen, two cyan eyes;
- compact proportions with a head slightly wider than the torso;
- simple gray joints and blue-gray shoes;
- friendly, purposeful body language rather than exaggerated emotion;
- identical silhouette, palette, and facial design across images.

Create a character reference image first when the set contains three or more narrative illustrations. Include it as a reference in subsequent generations when the tool supports referenced images.

When the user supplies no visual reference, use `../assets/editorial-illustration-style-reference.png` for the recurring robot, warm paper background, line quality, palette, and texture. Treat it as a style sheet, not a layout template.

## Prompt structure

Write prompts in this order:

1. editorial purpose and single focal action;
2. exact spatial composition from left to right and foreground to background;
3. character and object descriptions;
4. hand-drawn visual language, palette, and material texture;
5. reserved clean whitespace for title, object labels, short callouts, takeaway, and watermark; the model must not draw final label borders;
6. negative constraints;
7. `16:9 landscape, 1600×900 target`.

Prompt example:

```text
Create a warm editorial knowledge illustration explaining that an AI agent should read task-specific instructions before a complex action. A small friendly white robot with a dark navy face and cyan eyes walks along a curved cream-colored path from a large paper document on the left toward a checked form document on the right. A wooden signpost stands behind the robot and points to the right. Keep the center action readable and reserve clean undecorated whitespace for later Chinese labels; do not draw label boxes, borders, or placeholder glyphs. Add sparse pale-green shrubs, tiny stones, two light-blue outline clouds, and a few blue motion marks. Hand-drawn black outlines with varied line weight, subtle colored-pencil texture, low-saturation cream, green, blue, and ochre palette, flat editorial illustration, natural asymmetry, generous negative space. No text, no letters, no numbers, no logos, no watermark, no photorealism, no 3D render, no glossy UI, no gradients, no dense background. 16:9 landscape, 1600×900 target.
```

## Negative prompt vocabulary

Use only relevant exclusions:

- no embedded text, letters, numbers, signatures, or logos;
- no photorealism, 3D render, glossy vector UI, glassmorphism, or corporate dashboard;
- no repeated cards, repeated phones, rigid equal columns, or oversized shield;
- no neon colors, dramatic cinematic lighting, heavy shadows, or gradient background;
- no extra limbs, malformed hands, floating objects, contradictory arrows, or unreadable symbols;
- no clutter, edge crowding, tiny labels, or decorative elements competing with the focal action.
