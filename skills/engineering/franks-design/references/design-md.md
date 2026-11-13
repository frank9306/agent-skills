# design.md：锁定系统

当用户要求将当前构建的系统锁定为可移植文件时，或者当重新设计达到不止一页（`redesign.md`）时，在脚手架运行后加载：文件是从 `tokens.css` 写入的，而不是从主题文件写入的。单个构建永远不会自行编写 `design.md`； `tokens.css` 已经使每个构建都变得便携，并且 设计决策清单提供了一条线的锁定。

## 触发器

*锁定系统*，*锁定设计系统*，*给我一个design.md*，*将其导出为design.md*，*提取令牌*，*使其可移植*，*我想在另一个项目中使用它*。其他任何内容（包括同一提示上的更多迭代）都会跳过此文件。

- **多个页面的页面构建和重新设计。** 单个组件太小，不足以成为一个系统。
- **永远不要覆盖。** 如果根目录下存在 `design.md` 或 `DESIGN.md`，请刷新其 `## Exports` 并在一行中说明： *design.md found;导出刷新，系统不变。*

## 格式

在项目根目录下，按照项目的案例约定，大约有 45 行：足以为另一个页面提供种子，又足够短以方便维护。首先大声说出选择（*类型：社论。形状：长文档。主题：新闻纸。将其锁定为项目的系统。*），然后写：

````markdown
# Design: <project name>

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: <editorial | modern-minimal | atmospheric | playful>
- Shape of the first page: <macrostructure, or app screen>
- Theme: <catalog name, or custom (vibe: "<4 to 8 words>")>
- Axes: <paper band>/<display class>/<accent band> · posture: <posture>

## Tokens
`tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(<L> <C> <H>);  --color-paper-2: oklch(…);  --color-paper-3: oklch(…);
  --color-ink: oklch(…);  --color-ink-2: oklch(…);  --color-muted: oklch(…);  --color-rule: oklch(…);
  --color-accent: oklch(…);  --color-accent-ink: oklch(…);  --color-focus: oklch(…);
  --font-display: "<face>", <fallbacks>;  --font-body: "<face>", <fallbacks>;  --font-outlier: <…>;
  --radius-card: <px>;  --radius-pill: <px>;  --rule-hair: <px>;  --shadow-card: <value or none>;
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `tokens.css`.

## Controls
- Primary: <fill> · <radius> · <height>
- Secondary: <outline or text> · same radius and height

## Motion
- Character: <still | severe | brisk | calm>; one reveal at most; under reduced motion everything ends at once.

## Exports
`tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request, per `export-formats.md`.
````

## 文件存在后

预飞行会在以后每次运行 (SKILL.md Step 0) 时找到它。从那时起，每个选择都遵循它，品种规则反转（页面共享系统而不是不同），并且真正需要其他内容的页面会使用 `## Variants` 部分修改 `design.md`，而不是在本地覆盖它。
