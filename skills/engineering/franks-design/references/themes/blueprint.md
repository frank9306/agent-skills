---
name: Blueprint
slug: blueprint
genre: modern-minimal
paper: mid 35 256
display: geometric-sans Chakra Petch
accent: neutral 240
posture: drenched
keywords: architecture, architect, engineering, construction, structural, interiors, planning, surveying, cad, drafting, fabrication, prefab, developer, technical, spec, permit, renovation, build, drawings, architecture studio, timber
material: prussian-blue sheet, white line ink, Chakra Petch capitals over IBM Plex Sans with mono measurements, square double keylines and dimension strings, photographs printed as cyanotypes, the white line as the only signal
photo: duotone paper-3 ink con=30 exp=-10
pictured: Bento Grid, Poster hero
---

# 蓝图

一张绘图纸作为材料：普鲁士蓝纸、一条白线墨水、Chakra Petch 在 IBM Plex Sans 上绘制大写字母、带有单位的单色测量、用键线代替卡片，以及以蓝晒版印刷的照片，纸张在阴影中呈蓝色，在光线中呈白色。它读起来是技术性的，因为一切都是一条线、一个尺寸或一个地面上的印刷品，而线是唯一的信号。它不是带有蓝色渐变的深色产品页面，也不是霓虹灯线框。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(35% 0.105 256); --color-paper-2: oklch(31% 0.10 257); --color-paper-3: oklch(26.5% 0.095 258);
  --color-ink: oklch(97% 0.012 240); --color-ink-2: oklch(90% 0.025 242); --color-muted: oklch(80% 0.045 244);
  --color-rule: oklch(93% 0.02 240 / 0.85); --color-rule-2: oklch(93% 0.02 240 / 0.32);
  --color-grid: oklch(97% 0.01 240 / 0.09); --color-grid-2: oklch(97% 0.01 240 / 0.2);
  --color-accent: oklch(97% 0.012 240); --color-accent-ink: oklch(33% 0.105 256); --color-focus: oklch(97% 0.012 240);
  --font-display: "Chakra Petch", ui-sans-serif, sans-serif; --font-body: "IBM Plex Sans", ui-sans-serif, sans-serif;
  --font-outlier: "IBM Plex Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-heavy: 2px; --shadow-card: none;
  --tracking-display: -0.012em; --display-weight: 600; --sheet-inset: 20px; --tick: 14px;
}
```

三张，印有设计记录 (`blueprint: cyanotype`)。

| 床单 | 接地、线路、静音 |
| --- | --- |
| **氰型**（默认） | 上面的设计令牌 |
| **白皮书** | 接地 `oklch(97.5% 0.006 240)`，墨水 `oklch(35% 0.105 256)`，静音 `oklch(52% 0.07 255)` |
| **棕线** | 地面 `oklch(86% 0.045 80)`、墨水 `oklch(28% 0.05 50)`、静音 `oklch(45% 0.05 55)`、红色铅笔 `oklch(45% 0.19 28)` 仅用于注释 |

## Type · 类型

- **显示：** Chakra Petch 600 每个头，`--tracking-display`，罗马，一个头一个重量：h1 和 h2 大写，行高 1.02 (55a)，h3 句子大小写。
- **正文：** IBM Plex Sans 400 用于散文，500 用于标签和控件；纸上反面，没有任何东西比 400 轻。
- **标签、说明文字、表格标题、元数据：** IBM Plex Sans 500 更小，句子大小写。 IBM Plex Mono 500 使用其单位、阶段或绘图编号、尺寸字符串和代码上的年份来设置测量，仅此而已。

## Surfaces · 表面

- 仅线条：每个表面上都有 1px `--color-rule` 关键线，图形或照片上的 `--color-rule-2` 5px 内部有第二条关键线。半径0，无阴影；深度是第二条线、`--rule-heavy` 线或一步较暗的地面。
- 尺寸字符串：两端有 45° 刻度线（`--tick` 长）和短延长线的细线，其值设置在其上方。它衡量的是真实的东西，而不是装饰。
- 网格：`--color-grid` 中的 24px 次线，`--color-grid-2` 中的 120px 主线，由 `--sheet-inset` 偏移，仅在真实数据的绘图、明细表或图表下。
- 条带：`--color-paper-2`或`--color-paper-3`，一页最多两个；纸张已经是颜色（湿透），因此没有其他字段。
- 照片：一座又一座的建筑，正方拍摄，读起来就像图画（向上的框架，从下看的屋顶，桌子上的模型），在双键线内打印为蓝晒版；选择具有真实白色和真实阴影的框架，因为灰色打印平整。 Type over 1 位于 `--color-paper-3` 稀松布的边缘。

## Range · 范围

- **数字作为尺寸：** 提示在 Chakra Petch 中显示大小的一个数字，设置在尺寸字符串上，该尺寸字符串在其两个实际末端之间跨越十或十二列（第一年和现在，最小和最大跨度），末端为单声道。
- **作为绘图寄存器的表格：** 阶段时间表、可交付成果列表或价格表作为键控表格，阶段编号在其自己的列中为单声道，行标题较重，标题行下方有一条 `--rule-heavy` 行；在 `--color-paper-2` 上，它读取为一组的寄存器表。
- **作为标题块的表单：**字段设置为键控块的单元格，每个标签位于单元格的左上角，单元格的大小根据它们所容纳的内容而定，提交的墨迹填充在块的底部。
- **作为立面的比较和步骤：** 两个选项并排作为由一条粗线分隔的列，或者作为沿着一个长尺寸字符串运行的阶段，每个阶段都有一个勾号，每个阶段一个数字、一个标题和一条线。

## Controls · 控制

- 一个充满墨水的主纸，带有单张彩色文本，旁边是一个 1px 轮廓的墨水辅助纸，均为方形，48px，IBM Plex Sans 500。
- 带有 1px 下划线的墨水链接，悬停时会清除；输入方形，48px，`--color-paper-2`上有1px `--color-rule`键线，白色对焦环，从不发光。
- 线条是重音：蓝色、白色、规则、主要填充和聚焦环。

## Motion · 运动

静态，起草。规则或尺寸字符串可以在一页上绘制一次（在 `--ease-out` 上的 `--dur-long` 上从其左侧刻度开始缩放 X）；将鼠标悬停在带有键线的表面上，链接会使地面变暗一步。

## Voice · 嗓音

说明语音：每幅图上的建筑类型、阶段、年份、格式、单位；没有什么是一张绘图笔记不能承载的。

## Do-nots · 不该做的事

- 绝不是填满的卡片、模糊的或抬起的面板；纸张有线条，没有层。
- 切勿在蓝晒版、字体或照片中使用第二种颜色；红色铅笔属于棕色线表。
- 绝不是为代表项目而绘制的建筑物、框架或剖面，也绝不是具有虚构值的尺寸字符串；绘图是真实的项目数据，或者不存在。
- 永远不要把网格作为散文背后的壁纸，也永远不要使用小写的 h1 或 h2。
- 任何地方都没有圆角。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 600; }
h1, h2 { text-transform: uppercase; line-height: 1.02; }
.num { font-family: var(--font-outlier); font-weight: 500; }
.fig { position: relative; border: var(--rule-hair) solid var(--color-rule); }
.fig::after { content: ""; position: absolute; inset: 5px; z-index: 2; border: var(--rule-hair) solid var(--color-rule-2); pointer-events: none; }
.dim { position: relative; height: var(--rule-hair); background: var(--color-rule); }
.dim::before, .dim::after { content: ""; position: absolute; top: calc(var(--tick) / -2); width: var(--rule-hair); height: var(--tick); background: var(--color-rule); transform: rotate(45deg); }
.dim::before { left: 0; } .dim::after { right: 0; }
.btn { border: var(--rule-hair) solid var(--color-rule); border-radius: 0; background: transparent; color: var(--color-ink); padding: var(--space-sm) var(--space-lg); font-weight: 500; }
.btn--primary { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-accent-ink); }
```
