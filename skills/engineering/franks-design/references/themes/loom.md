---
name: Loom
slug: loom
genre: editorial
paper: light 95 85
display: roman-serif Libre Caslon Display
accent: cool 266
posture: committed
keywords: weaving, textile, linen, wool, weaving studio, cloth, craft, atelier, handmade, natural, indigo, fabric, by the metre, workshop, maker, slow, commission, interiors, samples
material: ecru paper with sand steps, warm near-black ink, Libre Caslon Display heads and prices over Hanken Grotesk, thin rules and one ink rule, cloth photographed close in window light, one deep indigo
photo: natural sat=-12 con=-4
pictured: Narrative Workflow, Poster hero
---

# 织布机

一家编织工作室静静地说话：米色纸，卡斯隆剪裁展示，在朴素的汉肯格罗泰斯克（Hanken Grotesk）上呈现出书本般的平静，细细的规则，以及一种深靛蓝（染色纱线的颜色），它以带子或纽扣的形式出现，而不是以水洗的形式出现。布料是在窗户光线下近距离拍摄的；没有任何东西可以代替它。它读起来是精雕细琢的，因为页面的规则就像一本图案书。这不是一个奶油色和赤土色的工艺页面，也不是所有东西背后都有一张亚麻布照片。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(95.5% 0.014 85); --color-paper-2: oklch(92% 0.022 84); --color-paper-3: oklch(85% 0.032 80);
  --color-ink: oklch(21% 0.012 60); --color-ink-2: oklch(31% 0.012 60); --color-muted: oklch(46% 0.014 62);
  --color-rule: oklch(83% 0.022 84); --color-rule-ink: oklch(21% 0.012 60);
  --color-accent: oklch(34% 0.115 267); --color-accent-2: oklch(43% 0.125 267); --color-accent-ink: oklch(95.5% 0.014 85); --color-focus: oklch(43% 0.15 267);
  --font-display: "Libre Caslon Display", "Libre Caslon Text", ui-serif, Georgia, serif; --font-body: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "DM Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-ink: 2px;
  --shadow-card: none;
  --tracking-display: -0.01em; --display-weight: 400;
}
```

设计记录 (`loom: ecru`) 中注明了三种配色。

| 配色 | 纸、墨、靛蓝 |
| --- | --- |
| `ecru`（默认） | 上面的块 |
| `indigo` | 纸张 `oklch(34% 0.10 266)`，墨水本色 `oklch(95% 0.015 85)`，尺子 `oklch(50% 0.09 266)`；按钮变成米色并带有靛蓝色文本 |
| `oat` | 纸`oklch(88% 0.04 80)`，墨水`oklch(15% 0.01 60)`，墨水中的规则1px，靛蓝`oklch(38% 0.10 266)`保持规则和按钮 |

## Type · 类型

- **显示：** Libre Caslon Display 400，适用于 h1、每个 h2 以及 40px 或以上的任何价格或数字、`--tracking-display`、行高 1.04 (1.0 on a hero head of two lines)、句子大小写、罗马字体。字体只有一种粗细，没有斜体；也不要合成，也不要将其设置在 32px 下，因为它的细线会在此处断裂。
- **项目标题 (h3)：** Hanken Grotesk 500，位于 `--text-title`，行高 1.25，墨水。
- **主体：** Hanken Grotesk 400 和 500，16 至 18px，线高 1.5； `--color-muted` 中的领先者。
- **标签、标题、标签、表格标题：** Hanken Grotesk 500 更小，句子大小写，未跟踪，`--color-muted`。 DM Mono 仅适用于连续比较的数字（以厘米为单位的宽度、每米克数、梁上的米数）和代码。

## Surfaces · 表面

- 1px规则：行间`--color-rule`；列表第一行上方、表格标题下方和导航下方的墨水中的 `--rule-ink` 线；井无边界。
- 到处都是正方形：井、照片、输入和控件上的半径为 0。
- 平坦：深度为纸台阶，`--color-paper-2` 为带状或井状，沙状 (`--color-paper-3`) 为更深的井状；没有什么能留下阴影。
- 条带：一条 `--color-paper-2` 条带，或一条靛蓝条带（`--color-accent` 接地，`--color-accent-ink` 文本）。一页最多两页。
- 照片：布料和织布机，近距离，在窗户的侧光下：织物填充框架，经轴上的经纱，折叠的长度，锥体上的纱线；工作室宽一次。颜色保持真实并稍微柔和（`photo:` 系列）。正方形，8%的墨水插入轮廓，无阴影；标签样式下方的标题包含事实（纤维、每米价格）；字体仅位于照片最平静边缘的墨水粗布上。
- 没有纹理：照片带有编织。

## Range · 范围

- **以规则行表示的规格：** 纤维、宽度、重量、交货时间和价格作为样板书表，左侧的 Hanken 标签，标题大小及以上的 Caslon 值，价格行设置最大；第一行上方的墨迹标尺。
- **价格以数字表示：** 在沙井或下订单的靛蓝带上，以卡斯隆单位显示一米的价格，旁边显示的是按行（米、费率、总计）计算出的总和。
- **以规则刻度表示的时间：** 在 DM Mono 中，在发际线刻度上以周为单位绘制提前期，将布料在织机上的跨度作为沙坝，将其落在的窗口作为靛蓝线；提示本身的几周的图表，而不是一条绘制的线索。
- **两列比较：** 羊毛旁边的亚麻布，被一根墨水尺分开，行对齐。

## Controls · 控制

- 这对：Hanken Grotesk 500 中的靛蓝填充方形按钮，文本链接旁边带有本色文本，文本颜色为 2px 底部边框。在靛蓝上，按钮变成米色并带有靛蓝文本。
- 链接将鼠标悬停时的 2px 下划线提升为 `--color-accent`；输入为方形，带有 1px `--color-rule` 边框和靛蓝调焦环，靛蓝带上为米色。
- 靛蓝是一种填充或一条线：主要的、一条带、悬停时的下划线、聚焦环。

## Motion · 运动

除了状态之外，没有任何移动：下划线变为靛蓝色，主色变亮为 `--color-accent-2`，在 `--ease-out` 上的 `--dur-short` 上一次。

## Voice · 嗓音

织布工在织布机上直白地说：纤维、米数、周数、布料的用途。价格和时间都说了一遍，没有什么难卖的。

## Do-nots · 不该做的事

- 切勿将靛蓝用作本色配色的页面水洗或色调；它是一条带、一条线或一个填充。
- 绝不是单声道标签的声音；宽度和重量可以赢得单声道，而标题则不能。
- 切勿在页面上绘制尺子、经线或线图案；布料被拍照并以类型计价。
- 米色旁边不要有温暖的口音（铁锈色、粘土色、赤土色）；沙子是纸，不是口音。
- 绝不是半径、阴影或软卡；织机是规则、方块和纸阶。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Hanken+Grotesk:wght@400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 400; line-height: 1.04; font-synthesis: none; }
.num { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; }
.btn { display: inline-flex; align-items: center; padding: var(--space-md) var(--space-lg); font: 500 var(--text-sm)/1 var(--font-body); background: var(--color-accent); color: var(--color-accent-ink); transition: background-color var(--dur-short) var(--ease-out); }
.btn:hover { background: var(--color-accent-2); }
.link { font-weight: 500; padding-block: var(--space-2xs); border-bottom: 2px solid currentColor; text-decoration: none; transition: border-color var(--dur-short) var(--ease-out); }
.link:hover { border-color: var(--color-accent); }
.photo img { outline: 1px solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
.photo figcaption { margin-top: var(--space-sm); font: 500 var(--text-sm)/1.4 var(--font-body); color: var(--color-muted); }
.band--indigo { background: var(--color-accent); color: var(--color-accent-ink); }
.band--indigo .btn { background: var(--color-paper); color: var(--color-accent); }
.band--indigo :focus-visible { outline-color: var(--color-accent-ink); }
```
