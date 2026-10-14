# Sources and Provenance

Original synthesis and checker implementation. Upstream material informed decisions; no upstream browser driver or style library is bundled. Recheck licenses before copying substantial text or implementation.

| Source revision | Adopted | Deliberately not adopted |
|---|---|---|
| [Waza ui, 318d6c2](https://github.com/tw93/Waza/tree/318d6c2c219894798b09c2b39d7f83d0be1a313c/skills/ui) | Context inheritance, precise complaint/repair boundaries, sibling checks and measured screenshot iteration | Font blacklists, mandatory press scaling, component-count approval gates and universal CSS-combination bans |
| [Anthropic, dbd4588](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md) | Subject-grounded direction, plan critique, typography, content and restraint | Treating a color/font/style as proof of a defect |
| [ECC, b92f181](https://github.com/affaan-m/ECC/tree/b92f181b3b748d1abbc2afd94af6aa7d8c8fca29/skills/frontend-design-direction) | Viewport/state coverage and explicit evidence gaps | Self-declared pass records as verification; effect-count aesthetic scoring |
| [taste-skill, a60a36d](https://github.com/Leonxlnx/taste-skill/tree/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9) | Public-page subject inventory and content argument; screenshot critique loop; existing-product preservation considered from redesign/product-UI branches | Random direction enforcement, house palettes, picture/motion quotas, marketing composition for tools, default browser driver and fixed style presets |
| [writing-for-agents, 49dd158](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336/skills/productivity/writing-for-agents) | Conditional pointers, single authority, positive target behavior and observable completion criteria | Word-count targets or independent skills without distinct invocation needs |

At the pinned taste-skill revision, the [public-page workflow](https://github.com/Leonxlnx/taste-skill/blob/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/taste-skill/SKILL.md) informs subject inventory and screenshot critique; [redesign](https://github.com/Leonxlnx/taste-skill/blob/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/redesign-skill/SKILL.md) informs existing-surface diagnosis. Product-UI alternatives [minimalist](https://github.com/Leonxlnx/taste-skill/blob/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/minimalist-skill/SKILL.md) and [soft](https://github.com/Leonxlnx/taste-skill/blob/a60a36dc2bb3bb77ccf17f2f62041f5ca8a458b9/skills/soft-skill/SKILL.md) were reviewed separately for hierarchy and reflow, without adopting their house styles or mandatory motion. Public-page expression does not become the workspace default.

Google [DESIGN.md specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) is a separate optional format, not the schema of the plain Markdown asset here. Project-owned Playwright assertions/visual regression remain the runtime authority. General engineering review belongs to the established implementation/review workflow.

Earlier synthesis also consulted Vercel Agent Skills, UI UX Pro Max and Kill AI Slop. Their code is not imported. Project visual identity stays in the project, not in this global skill.
