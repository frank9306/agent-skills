---
name: Hedgerow
slug: hedgerow
genre: editorial
paper: dark 24 158
display: high-contrast-serif Prata
accent: chromatic-green 118
posture: drenched
keywords: distillery, gin, brewery, forager, botanicals, nature reserve, walking, trail, seeds, plants, nursery, hedge, countryside, field guide, provenance, harvest, batch, seasonal, map, miles
material: deep leaf-green paper, cream ink, Prata heads over Manrope, low-key photographs in true colour, square flat surfaces with pill controls, one chartreuse signal with a moss strength for cream
photo: natural sat=-10 con=8 exp=-8
pictured: Field Guide, Poster hero
---

# 树篱

深色的页面读起来是绿色的，而不是夜晚：深叶绿色的底色，奶油色墨水，普拉塔在安静的曼索上鲜明的高对比度名称，在阴影下拍摄的植物，以及标记控件和页面绘制的几条线的黄绿色。它给人一种植物般的、精确而新鲜的感觉，就像一本在长凳上打开的野外指南。它不是带有金色点缀的黑色奢华，也不是质朴的牛皮纸页。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(24% 0.052 158); --color-paper-2: oklch(19.5% 0.045 158); --color-paper-3: oklch(29.5% 0.05 158);
  --color-ink: oklch(93% 0.022 88); --color-ink-2: oklch(81% 0.035 150); --color-muted: oklch(69% 0.045 150);
  --color-rule: oklch(35% 0.05 158);
  --color-accent: oklch(87% 0.19 118); --color-accent-2: oklch(92% 0.13 118); --color-accent-deep: oklch(46% 0.12 128); --color-accent-ink: oklch(22% 0.05 158); --color-focus: oklch(92% 0.13 118);
  --font-display: "Prata", Georgia, serif; --font-body: "Manrope", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "IBM Plex Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: none;
  --tracking-display: -0.005em; --display-weight: 400;
}
```

一枚表盘、配色，在设计记录 (`hedgerow: hedge`) 中注明。 `--color-accent-deep` 是信号的苔藓强度：它占据了奶油色带上黄绿色的位置，而黄绿色在此处消失。

| 配色 | 地面 | 墨水 | 口音 |
| --- | --- | --- | --- |
| `hedge`（默认） | oklch(24% 0.052 158) | 奶油 oklch(93% 0.022 88) | 黄绿色 oklch(87% 0.19 118) |
| `sloe` | 李子 oklch(25% 0.06 320) | oklch(94% 0.02 80) | 吸管 oklch(88% 0.15 95) |

## Type · 类型

- **显示：** Prata 400，其唯一重量，`font-synthesis: none`；行高 1.08，句子大小写，罗马。物品标题也采用 Prata，但绝不是在 22px 下，因为它的细线变薄了。报表尺寸中的数字为 Prata、衬里。
- **主体：** Manrope 400，17px，线高 1.6，`--color-ink-2`； 500 用于标签，700 仅用于控件。
- **标签、标题、表格标题：** Manrope 500 更小，句子大小写，未跟踪，`--color-muted`。在这种风格中，植物的拉丁名位于其常见的罗马名旁边。 IBM Plex Mono 仅限内部代码。

## Surfaces · 表面

- 1px 规则：行之间的 `--color-rule`，两部分分开的 `--color-muted`，1.5px 黄绿色规则标题最重要的一个列表。
- 方形和扁平：孔、照片和输入的半径为 0；没有阴影，没有模糊，没有渐变，只有一张照片的稀松布。深度是纸上的步骤：`--color-paper-3` 中的一口井，`--color-paper-2` 中的一条带。
- 频段：一根 `--color-paper-2` 频段和一根奶油色频段（`--color-ink` 地面、`--color-paper` 文字、苔藓线条、树篱绿色控制）用于最密集的部分。一页最多两页。
- 照片：采集者遇见的植物，亲密而低调：树荫下一臂之遥的植物，小巷旁的树篱，第一缕阳光下的土地，静止的，​​黑暗长凳上的一杯玻璃。正方形，1px 奶油色环，浓度为 8%，颜色保持真实，绝不调成绿色。框架下的标题为植物命名；仅在树篱绿色稀松布上以 45% 至 70% 的比例在照片上打字。
- 线条仅适用于图表或真实地点地图，1.2px 黄绿色笔画，未填充。没有质感。

## Range · 范围

- **作为字段指南的索引：** Prata 中常用名称位于 `--text-2xl` 或更大的行，标签样式中的拉丁名称，然后一行，根据黄绿色规则；这些植物有一个没有图片的部分。
- **数字作为瓶子标签：** `--text-display-s` 及以上的 Prata 批次、数量、价格、距离，由 `--color-paper-2` 条带上的 `--color-rule` 垂直线分隔；一个黄绿色的人物。
- **奶油色的声明：** 在绿色上显示大小的一个 Prata 句子，或带有苔藓规则的带有工作控件（Prata 中的数量及其运行总数）的奶油带。
- **表格作为静态日志：**批次、装瓶日期、计数和价格作为规则行、数字表格、当前行的规则黄绿色。

## Controls · 控制

- 这对产品是：Manrope 700 中的黄绿色药丸，在 1.5px 黄绿色药丸旁边带有 `--color-accent-ink` 文字。悬停时主灯会变亮​​为 `--color-accent-2`。奶油色带上的树篱都变成绿色。
- 链接为奶油色，带有 1px 黄绿色下划线；输入为正方形，1px `--color-muted` 边框位于 `--color-paper-2` 上，环位于 `--color-focus` 上。

## Motion · 运动

仍然。仅说明，在 `--ease-out` 上的 `--dur-short` 上：主色变亮，下划线变粗，一行线变成黄绿色。没有成长，没有漂移，没有滚动显示。

## Voice · 嗓音

现场导游的：植物及其生长地点、距离和时间，只有提示才知道；永远不要发明距离或月份。出处作为一个句子，而不是一个徽章。

## Do-nots · 不该做的事

- 没有第二种口音；售完是静音，而不是红色。
- 绝不是黑色或蓝黑色的底色；深色是叶绿色，或者 `sloe` 上的李子色。
- 绝不是明亮、高调的照片：白色的浆果或阳光明媚的草地看起来就像绿色中的一个洞。
- 切勿使用黄绿色的文字、黄绿色的条带或黄绿色的奶油色。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Prata&family=Manrope:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 400; line-height: 1.08; font-synthesis: none; }
.btn { border: 1.5px solid var(--color-accent); border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-lg); font-size: var(--text-sm); font-weight: 700; transition: background-color var(--dur-short) var(--ease-out); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-2); border-color: var(--color-accent-2); }
.btn--secondary { background: transparent; color: var(--color-accent); }
.band--cream { background: var(--color-ink); color: var(--color-paper); --color-rule: color-mix(in oklab, var(--color-paper) 22%, var(--color-ink)); }
.band--cream .btn { border-color: var(--color-paper); color: var(--color-paper); }
.band--cream .btn--primary { background: var(--color-paper); color: var(--color-ink); }
.band--cream .figure { color: var(--color-accent-deep); }
.index { border-top: 1.5px solid var(--color-accent); }
.index > li { border-bottom: var(--rule-hair) solid var(--color-rule); }
.photo img { outline: var(--rule-hair) solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
.figure { font-family: var(--font-display); font-variant-numeric: lining-nums tabular-nums; }
a { text-decoration-color: var(--color-accent); }
```
