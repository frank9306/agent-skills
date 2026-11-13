---
name: Almanac
slug: almanac
genre: editorial
paper: mid 84 245
display: grotesk-sans Hanken Grotesk
accent: chromatic-magenta 350
posture: restrained
keywords: almanac, yearbook, field guide, reference, handbook, manual, index, catalogue, encyclopedia, data, figures, tables, statistics, research, dataset, records, directory, glossary, specifications
material: cool slate stock with a pale printed sheet, blue-black ink, Hanken Grotesk heads over Newsreader prose with mono figures, two rule weights and square corners, one chart magenta
photo: muted
pictured: Workbench, Stage hero
---

# 年鉴

一本参考书的登记册：冷板岩纸，蓝黑色墨水，汉肯·格罗泰斯克（Hanken Grotesk）阅读新闻阅读器的散文，单色数字排列到小数点，两种重量的规则，以及一种深洋红色（海图打印灯光的颜色），保持很小。它读起来之所以准确，是因为规则和数字具有权威，而不是颜色或装饰。它不是灰色的仪表板，也不是温暖的编辑页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(84% 0.012 245); --color-paper-2: oklch(81% 0.012 245); --color-paper-3: oklch(77% 0.012 245);
  --color-ink: oklch(16% 0.020 245); --color-ink-2: oklch(24% 0.018 245); --color-muted: oklch(38% 0.016 245);
  --color-rule: oklch(73% 0.013 240); --color-rule-2: oklch(32% 0.018 240);
  --color-accent: oklch(45% 0.180 350); --color-accent-2: oklch(37% 0.160 350); --color-accent-ink: oklch(97% 0.006 245); --color-focus: oklch(46% 0.190 350);
  --color-sheet: oklch(93.5% 0.008 245);
  --font-display: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Newsreader", ui-serif, Georgia, serif;
  --font-outlier: "IBM Plex Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 2px; --rule-hair: 1px; --rule-bar: 2px; --shadow-card: none;
  --tracking-display: -0.02em; --display-weight: 600;
}
```

## Type · 类型

- **显示：** Hanken Grotesk 600 每个头，`--tracking-display`，行高 1.05，句首字母大写，罗马；首屏主视觉头部收紧至 -0.035em，行高为 0.95。 grotesk 设置结构；衬线从不突出。
- **主体：** Newsreader 400 和 500，具有光学尺寸，行高 1.55；斜体仅是段落内的强调。
- **标签、标题、表格标题、元：** Newsreader 500 缩小一步，句子大小写，`--color-muted`。从来没有单声道。
- **数字：** 带 `tabular-nums` 的 IBM Plex Mono 400 和 500，在一列中右对齐，小数点对齐。 Mono 设置数字，仅此而已；单独的数字（价格、计数）可能会在 Plex Mono 500 的 -0.04em 中运行到 `--text-display`。

## Surfaces · 表面

- 两个规则权重：`--color-rule` 零件行和分区中的 `--rule-hair`； `--color-rule-2` 中的 `--rule-bar` 在头部或表头部下方画一条坚固的线。没有什么更重的。
- 每个表面上都有方角，控件上最多 2px。没有盒装卡片，没有阴影：深度是规则和纸上步骤（`--color-paper-2` 在井或备用行上）。
- 纸张：`--color-sheet` 是印刷页，是放在石板上的浅色纸张，其头部有 2px 墨尺，内部有细线；产品自己的页面和表格位于其上，而不是段落。
- 条带：一条 `--color-paper-2` 条带，或一条 `--color-ink` 条带，带有纸质文本和单色纸张颜色。每页最多两个波段；从来没有洋红色领域。
- 照片：工作距离处的拍摄对象（低水位的港口、船台、恶劣天气下的大海）、中远景、平坦的阴天或第一道光，没有脸部朝向镜头。正方形，插图 1px `--color-rule-2` 轮廓，全出血或跨十列；下面的标题载有一个事实；文字永远不会出现在照片上。
- 无纹理：格纹纸，绝不是卡片表面。

## Range · 范围

- **页面本身：** 与印刷书籍设置的表格一样，在纸张上设置：2px 规则上的日期标题、新闻阅读器中的行名称、Plex Mono 中的时间和高度右对齐、页面指向的洋红色行；它本身就带有首屏主视觉或分裂。
- **一张图表，设置大：** 2px 的洋红色单一系列，横跨十二列，夜间或非工作时间用纸阶梯阴影，每个转折点都用单色标记；有了控件，它就成为页面的一个工作对象。
- **墨带上的文件：** 标题行和 Plex Mono 中的一些样本行（采用纸张颜色）、洋红色的列名称、说明整个文件内容的标题。
- **版本或计划的比较：** 两列或三列的表格，标题下的固定规则，单一数字的价格，最后一行的操作。

## Controls · 控制

- 一个洋红色填充控件（`--color-accent` 上的 `--color-accent-ink`）和一个用墨水绘制细线轮廓的控件，两者都是 Hanken Grotesk 500 在 2px 半径处。
- 墨水链接，在 0.15em 偏移处带有 1px 洋红色下划线，悬停时会变厚；输入带有 1px `--color-muted` 边的正方形。
- 洋红色保持在屏幕的 5% 以下：填充控件、链接下划线、图表争论的系列。

## Motion · 运动

除了状态之外，没有任何东西移动：悬停时链接色调的行，链接的下划线变粗。没有透露，没有计数，没有字幕。

## Voice · 嗓音

声明性、注明日期、准确：引用数字、版本、来源、单位。从来都不是炒作形容词。

## Do-nots · 不该做的事

- 绝不是亮粉色或紫罗兰色；洋红色保持在 L 44，色调 350，足够深，可以作为图表打印来读取。
- 切勿使用热纸或白纸；色相为 245 的板岩，始终着色。
- 绝不是盒装卡片或投影；每个表面都有两个规则重量。
- 永远不要把巨大的数字作为首屏主视觉，一页小图表，或者每一天或港口的一个标记：一张大图表承载着数据。
- 切勿在字体后面添加装饰性波浪或线条；曲线仅显示为带有轴的图表。
- 切勿将一栏中的数字按比例排列；比较的数字是 Plex Mono、表格、右对齐。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
body { color: var(--color-ink-2); }
h1, h2, h3 { font-weight: 600; color: var(--color-ink); }
.num, td.num { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; text-align: right; }
thead th, .rule-firm { border-bottom: var(--rule-bar) solid var(--color-rule-2); }
th { font: 500 var(--text-sm)/1.3 var(--font-body); color: var(--color-muted); text-align: left; }
td { border-top: var(--rule-hair) solid var(--color-rule); }
.btn { border: var(--rule-hair) solid var(--color-ink); border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-lg); font: 500 var(--text-sm)/1 var(--font-display); color: var(--color-ink); background: transparent; }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); } .btn--primary:hover { background: var(--color-accent-2); }
.well { background: var(--color-paper-2); border-top: var(--rule-bar) solid var(--color-rule-2); }
.sheet { background: var(--color-sheet); border-top: var(--rule-bar) solid var(--color-ink); }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
.chart .series { fill: none; stroke: var(--color-accent); stroke-width: 2; }
.photo > img { outline: var(--rule-hair) solid var(--color-rule-2); outline-offset: -1px; }
a { color: var(--color-ink); text-decoration-color: var(--color-accent); text-underline-offset: 0.15em; } a:hover { text-decoration-thickness: 2px; }
```
