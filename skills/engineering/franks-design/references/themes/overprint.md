---
name: Overprint
slug: overprint
genre: playful
paper: light 91.5 92
display: grotesk-heavy Anybody
accent: cool 212
posture: full-palette
keywords: venue, gigs, live music, festival, music, label, print studio, bar, club, poster, tickets, events, nightlife, two-colour, screenprint, punk, zine, loud, listings, door
material: grey newsprint stock, near-black ink, wide heavy Anybody capitals over Archivo, flat square fills, a teal pass and an orange pass that print moss where they cross, photographs pulled through one pass
photo: mono con=30
pictured: Marquee Hero, Poster hero
---

# 套印

廉价纸上的双色丝网印刷：灰色新闻纸、近乎黑色的墨水、宽厚的 Anybody 大写字母覆盖在普通的 Archivo 主体上，以及两种透明的平墨水，青色和橙色，在它们交叉的地方打印出深深的苔藓。照片一次打印就可以打印出来，就像账单打印它们一样。一切都在套准中，平面和方形：噪音是比例和两种墨水，从来没有效果。它不是复古海报拼贴画、套准错误的印刷品或霓虹灯传单。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(91.5% 0.014 92); --color-paper-2: oklch(87.5% 0.018 90); --color-paper-3: oklch(83% 0.021 88);
  --color-ink: oklch(17% 0.008 60); --color-ink-2: oklch(29% 0.01 60); --color-muted: oklch(42% 0.012 70);
  --color-rule: oklch(78% 0.02 85);
  --color-accent: oklch(65% 0.12 212); --color-accent-ink: oklch(17% 0.008 60); --color-focus: oklch(44% 0.1 220);
  --color-accent-2: oklch(71% 0.19 50); --color-accent-2-ink: oklch(17% 0.008 60);
  --color-mix: oklch(35.5% 0.121 142);
  --blend: multiply; --texture-opacity: 0.06;
  --font-display: "Anybody", ui-sans-serif, sans-serif; --font-body: "Archivo", ui-sans-serif, sans-serif;
  --font-outlier: "Archivo Narrow", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 4px;
  --shadow-card: none;
  --tracking-display: -0.01em; --display-weight: 900; --display-stretch: 140%;
}
```

两遍都是在墨水类型下填充，而不是打字，苔藓是它们交叉处的多重打印，从未绘制。设计记录（`overprint: newsprint`）中注明的两种股票：新闻纸，上面的设计令牌；或黑色股票，`oklch(95% 0.01 90)`下的`oklch(20% 0.01 280)`，混合翻转到屏幕，因此重叠变浅，传递黄色`oklch(88% 0.17 95)`和浅绿色`oklch(78% 0.13 200)`，聚焦浅绿色。

## Type · 类型

- **显示：** Anybody 900，设置宽（`--display-stretch`，130 至 150%），大写，行高 1.0 至 1.02，`--tracking-display`。数字、时间和价格均为 `tabular-nums` 的 150%。
- **正文：** Archivo 400 和 600，16 至 17px，行高 1.5，墨水。
- **小字：** Archivo Narrow 600 更小一步，句子大小写，未跟踪，适用于天、小时和表头：标签面。字幕是存档的。没有单声道。

## Surfaces · 表面

- 两次通道：所有着色的东西都是通道 1 或通道 2，在 `mix-blend-mode: var(--blend)` 处进行平坦填充，因此在两个通道交叉的地方打印 `--color-mix`；类型永远不会停留在苔藓上。
- 规则：4px 墨水 `--rule-bar` 横跨列表、表格、数字行或导航的顶部； `--rule-hair` 在 `--color-rule` 行之间。
- 半径 0，没有阴影，没有渐变，而是照片的稀松布：深度通过叠印实现，绝不提升。
- 条带：`--color-paper-2`，纸型油墨，或油墨型一通场；一页两个。
- 照片：夜晚，近距离或从后面，在灯光下演奏（一群人在洗礼下，手放在指板上，门口的酒吧）；从来没有摆过姿势，从来没有面对过镜头。灰色且坚硬，在一个通道域上倍增，因此灯光会打印出青色或橙色以及阴影墨水；方形、全出血或到柱边缘，无框架。文字坐在图片旁边，或者在墨水粗布上敲出纸张最暗的部分。
- 纹理：带、通场或照片上 `--texture-opacity` 处的纹理 (`texture.md` § 1)，切勿在运行文本下。

## Range · 范围

- **数字作为帐单：**提示自己的时间、容量或价格以海报比例设置在宽广的任何人中，每个数字在其自己的通行证字段中；两块田地中间有一列交叉，因此重叠处印有苔藓，而且里面没有字母。
- **以规则表形式列出：** 在 4px 栏下，以 Archivo Narrow 开头，以宽体大写字母表示标题大小、夜数和表格数字中的价格；正在销售的电池通行证为 1，售完的电池通行证为 2。
- **步骤如编号的钞票：** 一个过程为条形下的三个或四个单元格，每个数字又宽又重，每个单元格一次淹没一次，交替。
- **墨带：** 带有股票类型和纹理的黑色字段，以宽大写字母保存一个声明或带有 pass-1 控件的表格。

## Controls · 控制

- 控制对：在 Archivo Narrow 600 大写字母中使用 `--color-accent-ink` 类型进行第 1 次填充，未跟踪 (67 allows it under an uppercase display)，旁边是 2px 嵌入墨水轮廓（墨水上的纸张）。
- 第 1 轮采用初级和开放状态； pass 2 关闭状态（售完）。链接是带有 2px pass-1 下划线的墨迹，悬停时会变成墨迹；在 2px 插入墨水轮廓中输入正方形。

## Motion · 运动

按下时不会进行补间：悬停会将主要部分立即拉过另一通道（青色到橙色），按下时会通过墨水步骤将其变暗，并且没有任何显示、浮动或循环。

## Voice · 嗓音

墙上的账单：谁演奏、哪一晚、演出场次、价格以及是否已售完。

## Do-nots · 不该做的事

- 绝不使用第三种墨水；苔藓是通过重叠打印的，不会混合到填充、控件或字母中。
- 永远不会失准或分开：没有回声，没有偏移副本，没有重新着色的单词，没有重影的第二个头。
- 切勿使用彩色照片或通过两次打印打印的照片。
- 切勿为了展示叠印而绘制形状；通行证打印页面已有的表面。
- 切勿小写或窄显示；沉重的石怪声大喊大叫。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@100..150,900&family=Archivo:wght@400;600&family=Archivo+Narrow:wght@600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 900; font-stretch: var(--display-stretch); text-transform: uppercase; line-height: 1.02; }
.btn { border: 0; border-radius: 0; padding: var(--space-md) var(--space-lg); font: 600 var(--text-sm) var(--font-outlier); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); } .btn--primary:hover { background: var(--color-accent-2); }
.btn--secondary { box-shadow: inset 0 0 0 2px var(--color-ink); color: var(--color-ink); }
.pass-1 { background: var(--color-accent); color: var(--color-accent-ink); mix-blend-mode: var(--blend); }
.pass-2 { background: var(--color-accent-2); color: var(--color-accent-2-ink); mix-blend-mode: var(--blend); }
.pass-1 > img, .pass-2 > img { filter: grayscale(1) contrast(1.3); mix-blend-mode: var(--blend); }
.figure { font: 900 var(--text-display)/1 var(--font-display); font-stretch: 150%; font-variant-numeric: tabular-nums; }
.grain { position: relative; isolation: isolate; }
.grain::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: var(--texture-opacity); background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E") 0 0 / 200px; }
::selection { background: color-mix(in oklab, var(--color-accent-2) 40%, transparent); }
```
