---
name: Piste
slug: piste
genre: playful
paper: light 98.5 260
display: display-condensed Barlow Condensed
accent: cool 265
posture: committed
keywords: ski, mountain, resort, snow, winter, outdoor, sport, trail, lift, race, alpine, tickets, season pass, conditions, weather, club, active, bold
material: snow-white paper, cold near-black ink, Barlow Condensed 800 caps over Barlow, square edges on 2px ink rules, one cobalt for signal and field
photo: natural con=10 vib=15
pictured: Morning Report, Poster hero
---

# 滑雪道

山间早晨的印刷品：雪白的纸张，冷得近乎黑色的墨水，Barlow Condensed 800 每个头像和人物的大写字母，2px 墨水规则上的方形边缘，以及一个钴完成所有颜色工作，从主要控制到整个字段。照片将山峰呈现在眼前，清晰且色彩丰富，切成方形，纸张就是它们打开的雪。它读起来是粗体，因为字体很响亮，颜色是冷蓝色；它不是一个镜头耀斑的度假村手册、运动渐变或圆形应用程序。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(98.5% 0.005 260); --color-paper-2: oklch(95.5% 0.008 260); --color-paper-3: oklch(91% 0.01 260);
  --color-ink: oklch(16% 0.012 260); --color-ink-2: oklch(30% 0.014 260); --color-muted: oklch(48% 0.016 260);
  --color-rule: oklch(88% 0.01 260);
  --color-accent: oklch(52% 0.25 265); --color-accent-deep: oklch(40% 0.2 266); --color-accent-ink: oklch(98.5% 0.004 260); --color-focus: oklch(58% 0.22 28);
  --color-field: var(--color-accent);
  --font-display: "Barlow Condensed", ui-sans-serif, sans-serif; --font-body: "Barlow", ui-sans-serif, sans-serif; --font-outlier: var(--font-display);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: none;
  --tracking-display: -0.005em; --display-weight: 800;
}
```

承诺：钴为 `--color-field`，可能会填充一个波段；在控件和链接上，它是信号，`--color-accent-deep` 是悬停和按下的步骤。设计记录（`piste: snow`）中注明的三个理由：`snow`（上面的块）、`blue-run`（页面是白色墨水下的钴场；白色占据控制和焦点）和`night-piste`（白色墨水下的`oklch(14% 0.01 260)`，2px白色规则，钴为56％，焦点为红色60%）。

## Type · 类型

- **显示：** Barlow Condensed 800，大写，罗马，`--tracking-display`； line-height 1.0 在任何可以换行的头上，0.9 仅在不能换行的单行上。压缩，因此它设置比共享比例大一级：`--text-display-s` 及以上为章节头，首屏主视觉头为 8rem。
- **数字：** 800 处的显示面，表格，从 `--text-display` 到其两倍；纸上的人物需要钴，田野上的人物需要纸。下面的标签是 Barlow 500。
- **主体：** Barlow 400 和 500，17 至 19px，线高 1.5；它是在户外阅读的，所以永远不会更轻。
- **按钮：** Barlow Condensed 800 大写字母位于 18px，未跟踪的 (legal under 67 on an uppercase display)。导航链接、表格标题、说明文字：Barlow 500 缩小一步，句首字母大写。

## Surfaces · 表面

- 规则：`--rule-bar` 墨水位于列表、数字行或表头上方以及浮动条下方； `--rule-hair` 在 `--color-rule` 行之间。统治，从未装箱。
- 所有东西的半径为 0：孔、照片、输入、控件和标签都是方形的。深度是平坦的：凸起的表面是纸台阶或钴场，而不是阴影。
- 带：`--color-accent-ink`类型的钴矿，或`--color-paper-2`在表格或密表下；一页最多两页。
- 照片：日光下的山和彩色的山：从后面看山坡上的一群人，一排孩子跟在教练后面，滑雪板站在新雪中，空中的升降机；清脆而高调，绝不是黄昏等级或耀斑。剪成方形，并在 8% 处嵌入墨水发际线。墨水直立在明亮的雪上；纸仅在冷墨水稀松布上位于天空上。
- 没有纹理，没有渐变，但有稀松布，没有模糊。

## Range · 范围

- **作为升降板的数字行：** 浓缩面上的提示数字最多为 `--text-display` 的两倍，雪上钴色，在 `--rule-bar` 墨水尺下，并由细线分开，每条细线都有一条巴洛线。
- **现场声明：** 一条短线，采用显示尺寸及以上的压缩大写字母，边缘到边缘的钴纸，早间报告会喊出这句话。
- **步骤或时间表：** `<ol>`，每个数字位于 `--text-display` 的钴色浓缩面上，在 2px 墨水尺上，大写标题和一行；或用墨水书写的时间和组的规则表。
- **作为售票台的形式：** 方形 52px 输入和纸上的墨水步进器 - 2，钴原色是带子上的唯一颜色。

## Controls · 控制

- 这对：钴色填充 `--color-accent-ink` 文本，旁边是 2px 内嵌墨水轮廓，均为方形，采用压缩大写字母；在稀松布或场地上，轮廓变成了纸。悬停取`--color-accent-deep`；主动需要墨水。
- 链接采用墨水和下划线，鼠标悬停时使用钴色；输入正方形，52px，1px墨水边框；步进器是围绕表格计数的两个方形墨水边框按钮。
- 钴位于主要位置，链接悬停，现场乐队和数字；红色是对焦环，没有别的。

## Motion · 运动

仍然。将鼠标悬停在 `--ease-out` 上的 `--dur-micro` 上时，控件会步进一个阴影；没有任何东西被吸引、循环或跟随滚动。

## Voice · 嗓音

早报：时间、团体、预订的周数、跨过雪地打电话。从来没有关于自由或粉末的口号。

## Do-nots · 不该做的事

- 切勿显示小写字母或出现光凝结；巴洛在 800 时凝结。
- 绝不是圆角、药丸或软卡。
- 切勿使用第二种强调色调，切勿在运行文本上使用钴色或在雪纸上填充卡片。
- 从来没有天空梯度、日落梯度或绘制的山脉、雪花或滑雪道地图。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Barlow:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 800; text-transform: uppercase; line-height: 1; }
h2 { font-size: var(--text-display-s); }
.fig { font: 800 var(--text-display)/0.9 var(--font-display); color: var(--color-accent); font-variant-numeric: tabular-nums; }
.btn { display: inline-flex; align-items: center; min-height: 52px; padding: 0 var(--space-lg); border: 0; font: 800 var(--text-lg)/1 var(--font-display); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-deep); }
.btn--secondary { background: none; box-shadow: inset 0 0 0 var(--rule-bar) var(--color-ink); color: var(--color-ink); }
.band--field { background: var(--color-field); color: var(--color-accent-ink); }
.photo { outline: 1px solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
th { border-bottom: var(--rule-bar) solid var(--color-ink); font: 500 var(--text-sm) var(--font-body); text-align: left; }
td { border-bottom: var(--rule-hair) solid var(--color-rule); }
::selection { background: color-mix(in oklab, var(--color-accent) 30%, transparent); }
```
