---
name: Squeeze
slug: squeeze
genre: playful
paper: mid 41 154
display: geometric-sans Gabarito
accent: warm 56
posture: drenched
keywords: fruit, food box, grocer, market, delivery, weekly, seasonal, farm shop, subscription, produce, veg box, cheerful, family, treats, stall, orchard, local, fresh
material: forest-green paper with real chroma, warm white ink, Gabarito 800 heads and figures over Manrope, soft rounded tiles a step lighter or deeper, fruit photographed bright and close, juicy peach controls
photo: natural vib=12 con=4
pictured: Bento Grid, Stage hero
---

# 挤

色彩缤纷的市场摊位：具有真实色彩的森林绿色地面，温暖的白色墨水，坚固的曼绳上加巴里托圆润而沉重的头部和人物，柔软的瓷砖或浅或深，拍摄的水果明亮而接近，多汁的桃子控件和一张暖白色的卡片。它是令人愉快的，因为绿色是整个表面，水果是它的颜色；在加巴里托，价格或一天的价格与一箱水果一样重要。它不是带有绿色按钮的中性杂货模板，也不是衬线和牛皮纸的有机标签。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(41% 0.100 154); --color-paper-2: oklch(47% 0.105 154); --color-paper-3: oklch(34% 0.090 156);
  --color-ink: oklch(99% 0.005 90); --color-ink-2: oklch(94% 0.020 120); --color-muted: oklch(90% 0.030 150); --color-rule: oklch(55% 0.100 154);
  --color-accent: oklch(83% 0.115 56); --color-accent-2: oklch(74% 0.150 46); --color-accent-ink: oklch(30% 0.070 40); --color-focus: oklch(88% 0.14 85);
  --color-card: oklch(97% 0.012 85); --color-card-ink: oklch(24% 0.05 160);
  --font-display: "Gabarito", ui-sans-serif, system-ui, sans-serif; --font-body: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: var(--font-display);
  --radius-card: 24px; --radius-control: 16px; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 0 14px 32px -16px oklch(22% 0.05 160 / 0.5);
  --tracking-display: -0.025em; --display-weight: 800;
}
```

## Type · 类型

- **显示：** Gabarito 800，`--tracking-display`，行高 1.0，句首字母大写，每个头一种颜色。圆形、紧凑、沉重，因此采用无盖共享显示秤；永远不会低于700。
- **数字：** Gabarito 800 的价格、日期和天数，带有表格、内衬数字；单个模型可以运行截面头的三到四倍，跟踪至-0.04em，其单位重量相同。
- **主体：** Manrope 500，线高 1.55，`--color-muted`；链接和行标题为 700。总共三个权重：800、700、500。
- **标签、标题、表格标题、元数据：** Manrope 700 更小，句子大小写，未跟踪。决不单声道，决不大写。

## Surfaces · 表面

- 瓷砖，而不是卡片：一块瓷砖是地面在`--radius-card`处亮一步（`--color-paper-2`），没有边框，没有阴影；沉井需要`--color-paper-3`。访客可以选择的瓷砖在选择时会沉入 `--color-paper-3` 并获得 3px `--color-accent` 戒指。
- 一个凸起的表面是暖白色卡片（`--color-card`、`--color-card-ink` 类型、`--shadow-card`），一页一次，用于访客付费的内容；其内部的对焦环采用 `--color-card-ink`。
- `--color-rule` 中 `--rule-bar` 的规则；列表行之间的唯一规则是 `--rule-hair`。
- 条带：页面是绿色的，因此条带是较浅或较深的绿色（`--color-paper-2`、`--color-paper-3`）；一页最多两页，绝不是白色、灰色或桃色带。
- 照片：日光下的水果，上方的板条箱，水果被举着，摊位上的一堆水果；明亮，水果填满整个框架。 `--radius-card`，无环，无阴影；标签样式下的标题；照片上的文字以 45% 至 65% 的比例覆盖在 `--color-paper-3` 稀松布上。
- 无纹理：绿色是平淡的颜色。

## Range · 范围

- 价格、尺寸或日期按声明尺寸设置为一个数字：Gabarito 800 直接在果岭上用墨水书写，其单位为全重量，头部和旁边的一行位于其余栏上。绿色和人物单独占据了屏幕。
- 以图块或全角行形式显示真实日期的时间表：每个日期在 Gabarito 中大，标签样式中的工作日，所选日期沉入 `--color-paper-3` 并用桃子圈起来；作为控制装置的摊位黑板。
- 一项承诺作为对更深绿色带的声明，Gabarito 以十列的显示尺寸，其下有一个动作。
- 问题或简单术语为行：Gabarito 标题在左侧，Manrope 答案在右侧，发丝规则在 `--color-rule` 之间。

## Controls · 控制

- 对照对：一个桃色填充的初级，带有 `--color-accent-ink` 文本，旁边是 2px 墨水轮廓的次级，均位于 `--radius-control`，Manrope 700。标签和芯片是药丸；导航链接可能是 `--color-paper-2` 药丸。
- 链接在 700 处为墨迹，悬停时下划线变为桃色；输入在 `--radius-control` 和 `--color-focus` 环处采用 2px `--color-rule` 边界。
- 桃子停留在控件上：主要的、选定的芯片或图块环、链接的悬停； `--color-accent-2` 仅是主控制器的按下和悬停步骤。从来没有桃型，也从来没有桃田。

## Motion · 运动

欢快而快速，仅说明：控件在 `--dur-micro` 处按下 1px，所选图块在 `--ease-out` 上的 `--dur-short` 处响起，可选图块在悬停时会出现绿色指示灯。无显露、无视差、无循环；任何不能按下的东西都不会做出反应。

## Voice · 嗓音

周四早上，摊主大声喊道：水果、它到来的那一天、成熟的水果拿在手上的感觉。简短而温馨的句子，价格明明白白；从来不是美食，也不是健康宣传。

## Do-nots · 不该做的事

- 绝不是中性地。白色为一张牌；灰色不存在。页面是绿色的。
- 绝不是暗绿色或灰绿色；地面保持其色度，否则就会变成军队剩余。
- 字重不得低于 500、衬线或单色数字：数字为 Gabarito。
- 从来没有发丝般的边界； 1px 规则仅存在于列表行之间。
- 从来没有一张暗淡的照片，也从来没有在每个屏幕上都有一张：当绿色和类型有自己的屏幕时，水果是最亮的。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@800&family=Manrope:wght@500;700&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); }
h1, h2 { line-height: 1; }
.figure { font: var(--display-weight) clamp(7rem, 16vw, 15rem)/0.85 var(--font-display); letter-spacing: -0.04em; font-variant-numeric: lining-nums tabular-nums; }
.tile { background: var(--color-paper-2); border-radius: var(--radius-card); }
.tile:has(:checked) { background: var(--color-paper-3); box-shadow: inset 0 0 0 3px var(--color-accent); }
.card { background: var(--color-card); color: var(--color-card-ink); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.btn { border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-control); padding: var(--space-sm) var(--space-lg); font: 700 var(--text-md)/1.25 var(--font-body); color: var(--color-ink); transition: translate var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); border-color: var(--color-accent); }
.btn--primary:hover { background: var(--color-accent-2); border-color: var(--color-accent-2); }
.btn:active { translate: 0 1px; }
.photo img { border-radius: var(--radius-card); }
::selection { background: color-mix(in oklab, var(--color-accent) 45%, transparent); color: var(--color-card-ink); }
```
