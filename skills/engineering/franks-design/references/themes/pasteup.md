---
name: Paste-up
slug: pasteup
genre: playful
paper: mid 73 70
display: display-condensed League Gothic
accent: chromatic-yellow 112
posture: committed
keywords: zine, fair, market, festival, print fair, book fair, exhibitors, punk, diy, collective, gig, poster, workshop, night market, flea, indie, community, launch, loud, photocopy, flyer
material: kraft board, a fibre wash, near-black toner, League Gothic capitals over a Newsreader galley, white copy paper on paper lifts, hard ink offsets, one sheet of fluorescent yellow
photo: mono con=45
pictured: Bento Grid, Stage hero
---

# 粘贴

一张手工制作的传单：牛皮板、近乎黑色的碳粉、新闻阅读器厨房上海报大小的哥特联盟大写字母、真实纸张阴影上的白色复印纸、硬墨水胶印控件、一张荧光黄。从复印机里拿出来的照片是黑白的，灰色被压碎了。拼贴存在于纸张、倾斜和升力中，而不是道具中。它不是垃圾纹理包、贴纸和胶带的剪贴簿，也不是干净的现代海报。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(73% 0.068 70); --color-paper-2: oklch(66% 0.072 68); --color-paper-3: oklch(97% 0.008 90);
  --color-ink: oklch(17% 0.01 60); --color-ink-2: oklch(24% 0.014 60); --color-muted: oklch(28% 0.026 62);
  --color-rule: oklch(50% 0.055 68); --color-rule-2: oklch(84% 0.012 85);
  --color-accent: oklch(93% 0.2 112); --color-accent-ink: oklch(17% 0.01 60); --color-focus: oklch(17% 0.01 60);
  --font-display: "League Gothic", Impact, sans-serif; --font-body: "Newsreader", Georgia, serif;
  --radius-card: 0; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 1px 0 oklch(18% 0.01 60 / 0.2), 0 4px 10px oklch(18% 0.01 60 / 0.12);
  --shadow-sheet: 0 14px 30px oklch(18% 0.01 60 / 0.26), 0 2px 4px oklch(18% 0.01 60 / 0.14);
  --tracking-display: 0.01em; --display-weight: 400;
}
```

荧光灯是纸，而不是墨水：它带有墨粉类型，但本身并不是类型。设计记录（`pasteup: kraft`）中注明的三块板：牛皮纸，上面的标记，纤维为 0.5 倍；黑墙，地面 `oklch(21% 0.012 60)`，墨粉 `oklch(94% 0.012 90)`，静音 `oklch(70% 0.015 80)`，0.35 屏幕光纤；糖纸，磨碎的 `oklch(84% 0.035 150)`，碳粉 `oklch(22% 0.02 160)`，静音 `oklch(42% 0.03 160)`，纤维为 0.4 倍。

## Type · 类型

- **显示：** League Gothic 400，大写，`--tracking-display`，永远不会在 28px 下，因此项目标题 (`h3`) 在新闻阅读器 500 中设置。海报面：传单头像或人物，行高0.92，占`--text-display`的两倍；剖面头比 `--text-section` 上升一级，为 1.0。
- **正文：** Newsreader 400 和 500，位于 18px，行高 1.5；斜体仅强调运行文本。在纸张上，文本位于白色副本上；在板上，它采用 `--color-ink`，而不是 `--color-muted`，位于 18px 下。
- **标签、标题、表格标题、元数据、控件：** Newsreader 500 更小，句子大小写，未跟踪。没有单声道。

## Surfaces · 表面

- 纸升降机，而不是盒子：井是 `--shadow-card` 上的一张复印纸 (`--color-paper-3`)，一张凸起的纸占据 `--shadow-sheet`。半径0；板上的 `--color-rule` 零件行中的发丝，纸张上的 `--color-rule-2` 中的发丝线。
- 倾斜是粘贴：一张纸或一张照片可以偏离正方形0.5°到2°，一个屏幕最多三个倾斜面；输入、表格和长读保持方形。
- 荧光片填满主控制器，一张荧光片填满屏幕，上面有碳粉类型；黑板上从来没有乐队、头像或单词。
- 带：`--color-paper-2`（更深的牛皮纸）或板色型碳粉；一页最多两页。
- 照片：杂志、手、复印机、订书机和展台，近距离、平光，最多是后面的一群人；通过复印机（`photo:`线），硬黑白。以 10 到 16px 的边距在复印纸上进行多次印刷并抬起，或直接印刷到纸板上，以便牛皮纸透过白色显示出来；永不着色，永不满血。标题位于床单的脚上。
- 纹理：纤维水洗（`texture.md` § 1，低频棕褐色色调）在纸板的不透明度和混合的牛皮纸带上，切勿在纸张上或在运行的文本下。

## Range · 范围

- **事实就像一堵传单墙：** 提示的日期、数量、价格和截止日期均以海报尺寸、混合跨度和高度、以海报尺寸、混合跨度和高度、以几个像素重叠、两个或三个倾斜、一个在荧光灯上显示在哥特联盟的单独一张纸上；其中没有照片。
- **打印的表格：** 时间表、价目表或地点和时间作为规则表，以稍微倾斜的方式打印在一张复印纸上，左栏采用联盟哥特式，其余栏采用新闻阅读器。
- **碳粉带：** 哥特联盟中的一条线，`--text-display` 或更大，碳粉上的板色，跨十列。
- **表格形式：**复印纸上的字段，方形，硬胶印，在其头部旁边，截止日期在黑板上设置得很大。

## Controls · 控制

- 对照对：在硬质 `4px 4px 0` 油​​墨胶印上具有碳粉类型的荧光主色，以及在相同胶印上的复印纸辅助色，两者均为 15px 的 Newsreader 500。
- 链接是带有 1px 下划线的墨粉，悬停时更粗；输入是复印纸、正方形、1px 墨水边框；对焦环是墨粉。

## Motion · 运动

仅纸质物理：悬停时按钮会将 1px 放入其偏移位置，按下 `--dur-micro` 时按钮会将 4px 放入其偏移位置。没有任何东西漂浮，没有任何东西显露出来。

## Voice · 嗓音

传单语音：日期、门口、价格、桌号。

## Do-nots · 不该做的事

- 切勿粘贴道具：不得使用胶带、贴纸、设计记录或潦草的便条。
- 头脑中从来没有一个单词被分开：没有被剪掉的单词，没有黄色的单词，没有斜体的单词。
- 切勿在控件上添加柔和的阴影；控件位于硬墨水胶印上。
- 切勿使用垃圾覆盖物、撕裂的边缘或彩色照片。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
```

```css
h1, h2 { font-weight: 400; text-transform: uppercase; line-height: 1; } h1 { line-height: 0.92; }
h3 { font: 500 var(--text-title)/1.2 var(--font-body); }
.btn { border: 0; border-radius: 0; padding: var(--space-sm) var(--space-md); font: 500 15px/1.2 var(--font-body); color: var(--color-ink); box-shadow: 4px 4px 0 var(--color-ink); transition: translate var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
.btn:hover { translate: 1px 1px; box-shadow: 3px 3px 0 var(--color-ink); }
.btn:active { translate: 4px 4px; box-shadow: none; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { background: var(--color-paper-3); }
.sheet { background: var(--color-paper-3); box-shadow: var(--shadow-sheet); rotate: var(--r, 0deg); }
.sheet--fluoro { background: var(--color-accent); color: var(--color-accent-ink); }
.sheet img { mix-blend-mode: multiply; filter: grayscale(1) contrast(1.3); }
.fibre { position: relative; isolation: isolate; }
.fibre::before { content: ""; position: absolute; inset: 0; z-index: -1; opacity: 0.5; mix-blend-mode: multiply; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02 0.03' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.45 0 0 0 0 0.3 0 0 0 0.28 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E"); }
::selection { background: color-mix(in oklab, var(--color-accent) 70%, transparent); color: var(--color-ink); }
```
