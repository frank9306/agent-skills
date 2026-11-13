---
name: Halftone
slug: halftone
genre: playful
paper: light 96.2 94
display: slab-serif Ultra
accent: warm 33
posture: committed
keywords: drinks, soda, food brand, print shop, zine, magazine, record label, packaging, campaign, label, bottle, can, screen print, bold, one colour, retail, craft, loud, fruit, snack
material: butter-cream stock, brown-black ink, Ultra over Chivo, three-pixel ink rules and square wells, one vermilion printed solid and through a dot screen, photographs in full colour
photo: natural vib=25 sat=10 con=6
pictured: Back of the Can, Settled hero
---

# 半色调

响亮的单色印刷声音：奶油色原料、棕黑色墨水、用于头部的厚厚 Ultra 平板、用于其他所有内容的 Chivo、3px 墨水规则和一种朱红色，可在控件上打印实心，并在带或井上作为点屏幕。照片是唯一的全彩、近距离且明亮的照片，就像标签的产品照片一样。它给人的感觉是丝网印刷的，因为只有一种墨水，它的点从实心褪色成无，而不是因为绘制了任何东西。它不是漫画书波普艺术页面，也不是柔和的零食品牌。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(96.2% 0.032 94); --color-paper-2: oklch(92.6% 0.046 92); --color-paper-3: oklch(87.5% 0.058 90);
  --color-ink: oklch(23% 0.040 38); --color-ink-2: oklch(33% 0.045 40); --color-muted: oklch(44% 0.048 44);
  --color-rule: oklch(82% 0.042 82);
  --color-accent: oklch(54.5% 0.215 33); --color-accent-deep: oklch(46% 0.19 31); --color-accent-ink: oklch(97% 0.022 94); --color-focus: oklch(46% 0.19 31);
  --color-dot: var(--color-accent); --halftone-size: 12px; --halftone-dot: 3px;
  --font-display: "Ultra", ui-serif, Georgia, serif; --font-body: "Chivo", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-input: 3px; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 3px;
  --shadow-card: none;
  --tracking-display: 0.005em; --display-weight: 400;
}
```

承诺：现场有屏幕、控制器和现场乐队。设计记录上注明的三支股票（`halftone: cream`）。

| 库存 | 纸张和墨水 | 现场 |
| --- | --- | --- |
| **奶油色和朱红色**（默认） | 上面的设计令牌 | `oklch(54.5% 0.215 33)` |
| **黑色柠檬** | `oklch(19% 0.01 60)`下`oklch(96% 0.02 90)` | 黄色 `oklch(88% 0.17 95)`，上面有深色墨水 |
| **血橙** | 入库颜色: `oklch(72% 0.17 45)` 下梅色 `oklch(24% 0.06 25)` | 梅子墨也是斑点，所以点印得暗 |

## Type · 类型

- **显示：** Ultra 400，其唯一粗细，罗马字体，句子大小写，行高 1.08（Ultra 的下行部分接触下一行更紧），`--tracking-display`；每个头一种颜色。 Ultra 的数字是其最响亮的字母：200px 及以上的数字可以在现场打印实心，跟踪 -0.02em，当它单独在线时，行高为 0.9。
- **主体：** Chivo 400，17px，线高 1.55，`--color-ink-2`； Chivo 700 在控件和标签面板中的名称上。
- **标签、标签、表格标题、说明文字：** Chivo 500 更小，句子大小写，未跟踪； 3px 规则赋予他们权力。没有单声道。

## Surfaces · 表面

- 规则负责边框的工作：`--rule-bar` 在墨水中跨越部分、表格或列表的顶部，`--rule-hair` 在行之间的`--color-rule` 中。
- 井是一个盒装表面：`--color-paper-2` 位于 `--rule-bar` 墨水边框内，方形，内部没有盒装任何东西。到处都没有影子。
- Radii：按钮和输入上的 3px，芯片上的完整药丸；井、标签和照片都是方形的。
- 条带：`--color-paper-2`，带有奶油色文字的斑点字段，或带有奶油色文字的 `--color-ink`。一页最多两页。 `--color-accent-deep` 是按下的点：悬停、对焦环以及 24px 下的任何点类型。
- 照片：产品和其中的成分，紧密而明亮（切开的柠檬，生姜，玻璃杯中的气泡），明亮的日光照射在普通的地面上。该页面唯一的全彩；正方形，1px 墨水细线，下面有一个标题，命名其中的内容。这个地方永远不会给图片染色。
- 屏幕（`texture.md` § 2）：`--halftone-size` 单元上的一个 `--halftone-dot` 点，在条带或孔上被遮蔽以从实心淡出到无；每个部分一个屏蔽字段，切勿在文字或照片下方或上方。

## Range · 范围

- **作为海报的数字：** 240px 及以上的 Ultra 中的一个实数（卡路里、尺寸、价格），奶油上的实心点，其单位及其旁边的剖面尺寸中的 Ultra 墨水中的一条线。
- **作为面板的标签：** 全宽行上的 3px 墨迹规则、Chivo 700 中的名称、Ultra 中项目尺寸的值、之间的细线、罐头背面的读取方式；从来没有缩小到一个盒子里。
- **现场顺序：** 带有奶油色淘汰头的点带、步进器及其 Ultra 中的运行总数，屏幕从空侧后面的一个边缘淡入。
- **一项被淘汰的声明：** 在显示尺寸的 Ultra 中的一个直白的句子，奶油色的墨水或斑点，除了它的链接之外没有其他任何东西。

## Controls · 控制

- Chivo 700 中位于 3px 的斑点填充按钮，旁边是无框的普通 `--rule-bar` 斑点下划线。
- 带有点下划线的墨水链接；在 3px、1px 墨水边框处输入。
- 该位置位于控件、屏幕、区域带和对焦环上；从来不考虑体型。

## Motion · 运动

仅说明，`--ease-out` 上的 `--dur-short`：按钮变暗一级。屏幕永远不会移动。

## Voice · 嗓音

标签：水果、卡路里、罐头尺寸、盒子价格。直率、甜蜜、具体；从来都不是一种生活方式。

## Do-nots · 不该做的事

- 绝不使用第二种墨水；一个点打印点、按钮和字段，奶油色上的蓝色链接是另一台打印机。
- 绝不是不是点的渐变；淡入淡出是指屏幕从实心变为虚无。
- 切勿在文字或照片下方或上方打点。
- 绝不是合成的粗体 Ultra、柔和的阴影或圆形井。
- 切勿在面霜上点出小于切片头的字体；它打印效果很弱，因此小点类型占据了较深的点。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Ultra&family=Chivo:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1.08; }
.poster { font: 400 clamp(10rem, 22vw, 20rem)/0.9 var(--font-display); letter-spacing: -0.02em; color: var(--color-accent); font-variant-numeric: tabular-nums; }
.btn { padding: var(--space-md) var(--space-lg); border-radius: var(--radius-input); font: 700 var(--text-sm) var(--font-body); background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { background: none; color: var(--color-ink); padding: var(--space-md) 0 var(--space-xs); border-radius: 0; border-bottom: var(--rule-bar) solid var(--color-accent); }
.well { border: var(--rule-bar) solid var(--color-ink); background: var(--color-paper-2); }
.ruled { border-top: var(--rule-bar) solid var(--color-ink); } .ruled > * { border-bottom: var(--rule-hair) solid var(--color-rule); }
.photo { outline: var(--rule-hair) solid var(--color-ink); outline-offset: calc(-1 * var(--rule-hair)); }
.halftone { position: relative; isolation: isolate; }
.halftone::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(var(--color-dot) var(--halftone-dot), transparent calc(var(--halftone-dot) + 0.5px)) 0 0 / var(--halftone-size) var(--halftone-size);
  mask: linear-gradient(110deg, transparent 45%, var(--color-ink) 95%); }
::selection { background: color-mix(in oklab, var(--color-accent) 30%, transparent); }
```
