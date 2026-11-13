---
name: Vellum
slug: vellum
genre: editorial
paper: light 94 82
display: blackletter Grenze Gotisch
accent: cool 268
posture: committed
keywords: roastery, coffee, bakery, wine, cellar, apothecary, bookshop, press, letterpress, guild, heritage, artisan, manuscript, parchment, edition, tasting, vintage, craft, old world, slow
material: parchment paper, a long tan fibre wash on bands, umber ink, Grenze Gotisch heads over Hanken Grotesk with Grenze roman for statements, hairline and double rules, one ultramarine pigment
photo: warm con=6
pictured: Trade Ledger, Poster hero
---

# 牛皮纸

一家古老的印刷厂：羊皮纸底，棕色墨水，Grenze Gotisch 用作头像，它的罗马兄弟 Grenze 用作大句子，普通的 Hanken Grotesk 用作所有阅读内容，发际线和双线，以及群青作为一种颜料。哥特式的面孔承载着时代的气息，所以没有其他任何装饰：没有小酒馆，没有做旧的仿制品，没有奶油色和衬线的社论页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(94% 0.024 82); --color-paper-2: oklch(90% 0.032 80); --color-paper-3: oklch(86% 0.036 78);
  --color-ink: oklch(23% 0.025 55); --color-ink-2: oklch(31% 0.024 58); --color-muted: oklch(46% 0.024 64);
  --color-rule: oklch(75% 0.035 72);
  --color-accent: oklch(43% 0.17 268); --color-accent-deep: oklch(35% 0.15 268); --color-accent-soft: oklch(89% 0.035 268); --color-accent-ink: oklch(95% 0.02 82);
  --color-focus: oklch(50% 0.18 268); --color-field: var(--color-accent);
  --font-display: "Grenze Gotisch", ui-serif, Georgia, serif; --font-body: "Hanken Grotesk", ui-sans-serif, sans-serif;
  --font-outlier: "Grenze", ui-serif, Georgia, serif;
  --radius-card: 2px; --radius-pill: 2px; --rule-hair: 1px; --rule-double: 4px; --shadow-card: none;
  --tracking-display: -0.01em; --display-weight: 600; --fibre: 0.5;
}
```

设计记录 (`vellum: parchment`) 中注明了三种配色。

| 配色 | 底色、墨色、颜料 |
| --- | --- |
| **羊皮纸**（默认） | 上面的设计令牌 |
| **深红色，反转** | 地面 `oklch(27% 0.09 20)`，墨水 `oklch(94% 0.02 80)`，颜料金 `oklch(84% 0.11 85)` 地面文字，规则 `oklch(44% 0.08 20)`，纤维为 0.25 |
| **靛蓝，账本** | 研磨 `oklch(93% 0.012 240)`，油墨 `oklch(24% 0.035 265)`，相同群青，规则 `oklch(76% 0.02 250)`，纤维为 0.14 |

## Type · 类型

- **显示：** `h1` 和 `h2` 的 Grenze Gotisch 600，行高 0.92，`--tracking-display`，句子大小写。它收盘价低于 30px，因此 `h3` 和 Hanken Grotesk 600 中的较小组合。
- **离群值，Grenze 400：** 罗马兄弟，对于设置为 `--text-display-s` 的一个句子以及显示尺寸为行高 1.02 的数字。绝不用于运行文本。
- **主体：** Hanken Grotesk 400 和 500，线高 1.55；导航链接为 600。一个页面最多三个权重：400、500、600。
- **标签、标题、表头、元：** Hanken Grotesk 500 更小，句子大小写，未跟踪。表格比较的数字（重量、批次、日期）采用汉肯的表格数字，右对齐。

## Surfaces · 表面

- 规则：1px `--color-rule` 行之间的细线，1px 沿着部分顶部的墨水，以及 `--rule-double` 双墨水规则，其中打印机将加倍：在桌子的头部上方，在刊头下方，沿着带的顶部。
- 半径 2px 无处不在，无丸粒，无阴影：页面打印平整。
- 带子：带有纤维洗涤液的 `--color-paper-2` 带子和群青 `--color-field` 带子；最多一页两个，从不接触。
- 照片：在自己的光线下进行交易（滚筒、冷却盘、麻袋、柜台、长凳上的手），近距离，没有面对镜头；加热后，2px 半径，1px `--color-rule` 边缘。下面的标题说明了一个事实；一个头放在一个仅覆盖在棕色稀松布上的头上。
- 纹理，纤维洗涤：SVG 湍流的长棕褐色纤维，缝合，因此它们永远不会平铺，在 `--fibre`（`texture.md`，低频洗涤）处倍增，仅在带或井上。

## Range · 范围

- **表格作为日表：** 周列表为双规则下的全角规则表，颜料数字索引行，标题大小为 Hanken 600 中的名称，表格数字中的值；悬停的行采用 `--color-accent-soft`。
- **带有数字的声明：** Grenze 400 中提示的一个句子跨越纤维带上的九列或十列，在其下方，由发际线分隔，提示自己的 Grenze Gotisch 数字以显示尺寸使用颜料，每个数字下方都有一个普通标签。
- **现场形式：** 当方形单元边对边连接时，群青带保持工作选择（尺寸、频率），这是 Grenze Gotisch 中截面尺寸的运行答案。
- **行作为索引：** 三到五行，标题用 Grenze Gotisch 表示，旁边有一行 Hanken 文字：术语、访问次数、购买方式。

## Controls · 控制

- 填充颜​​料的原色（`--color-accent` 上的 `--color-accent-ink`）在悬停时加深至 `--color-accent-deep`，旁边是带有 1px 墨水边框的重影，均为 2px 半径，Hanken Grotesk 500。
- 悬停时链接会以颜料显示下划线；输入采用 2px 半径和 1px 墨水边框。
- 群青是一种颜料：主要的、链接的悬停、聚焦环、索引列表的数字、数字、一条带。

## Motion · 运动

仍然。颜料中的悬停下划线、一排柔和的水洗以及 `--dur-micro` 上的初步加深；没有显露，没有视差。

## Voice · 嗓音

Ledger-简单明了并注明日期：物品、重量、年份、城镇，就像店员输入的那样。绝不是*手工*、*策划*或提示未给出的故事。

## Do-nots · 不该做的事

- 切勿使用粘土、赤土色或紫红色作为羊皮纸上的颜料；牛血只是地面。
- 段落长度切勿低于 30px 的 Grenze Gotisch，或在大写 I 上打开一个头，读作 J。
- 绝不会有褶皱边缘、晕影、咖啡环、烧伤或第二纹理。
- 从来不把建国之年单独当作首屏主视觉的头；它位于一个句子、一行或一个带有标签的图形中。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@600&family=Grenze:wght@400&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
h1, h2 { font-weight: 600; line-height: 0.92; }
h3 { font-family: var(--font-body); font-weight: 600; }
.statement { font: 400 var(--text-display-s)/1.02 var(--font-outlier); }
.btn { border: var(--rule-hair) solid currentColor; border-radius: var(--radius-card); padding: var(--space-sm) var(--space-lg); font-weight: 500; color: inherit; background: transparent; transition: background-color var(--dur-micro) var(--ease-out); }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-deep); border-color: var(--color-accent-deep); }
.band--pigment { background: var(--color-field); color: var(--color-accent-ink); }
.rule-double { border-top: var(--rule-double) double var(--color-ink); }
.ledger tbody tr:hover { background: var(--color-accent-soft); }
.fibre { position: relative; isolation: isolate; }
.fibre::before { content: ""; position: absolute; inset: 0; z-index: -1; opacity: var(--fibre); mix-blend-mode: multiply; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='p' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004 0.02' numOctaves='4' seed='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.62 0 0 0 0 0.52 0 0 0 0 0.36 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E"); }
```
