---
name: Editorial
slug: editorial
genre: editorial
paper: light 97 86
display: display-condensed Bricolage Grotesque
accent: chromatic-green 152
posture: restrained
keywords: magazine, editorial, feature, culture, fashion, design annual, interview, longform, publication, issue, contemporary, art direction, profile, lookbook, brand story, journal, considered, travel, city guide, guide
material: warm white uncoated stock, printed black ink with a cool tilt, Bricolage Grotesque condensed at 800 over Source Serif 4, square corners, a heavy ink rule over 1px hairlines, one printer's green
photo: natural sat=-10 con=4
pictured: Marquee Hero, Stage hero
---

# 社论

现代杂志的声音：暖白色无涂层纸，带有微冷倾斜的黑色印刷，也贯穿阅读文本，800 的 Bricolage Grotesque 被挤压到每个头的宽度 75，用于阅读的 Source Serif 4 和立面，方角，1px 细线上的重墨统治，一台打印机的绿色。简洁的头部、衬线放在首位，并由规则承载，而不是装饰。它不是一本衬线文学杂志，不是带有赤土​​的奶油色，也不是一个带标题的照片画廊。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(97% 0.007 86); --color-paper-2: oklch(94% 0.010 86); --color-paper-3: oklch(91% 0.012 84);
  --color-ink: oklch(16% 0.012 280); --color-ink-2: oklch(29% 0.011 280); --color-muted: oklch(48% 0.010 75);
  --color-rule: oklch(85% 0.009 85); --color-rule-2: oklch(64% 0.010 80);
  --color-accent: oklch(49% 0.130 152); --color-accent-ink: oklch(98% 0.005 88); --color-focus: oklch(52% 0.135 152);
  --font-display: "Bricolage Grotesque", ui-sans-serif, sans-serif; --font-body: "Source Serif 4", ui-serif, Georgia, serif;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-heavy: 4px; --shadow-card: none;
  --tracking-display: -0.012em; --display-weight: 800;
}
```

## Type · 类型

- **显示：** Bricolage Grotesque 800，带 `"wdth" 75, "opsz" 96`、`--tracking-display`、句首字母大写、罗马字体。首屏主视觉尺寸的行高为 0.92，头部的行高为 1.0。浓缩后，需要上升一步：一个章节头可能会运行在 `--text-display-s` 处，一个单独的首屏主视觉词会运行在 `--text-display` 的两倍处。每个头一种重量和一种颜色。
- **正文：** Source Serif 4 400 及其斜体位于 18px，光学尺寸自动，行高 1.55，运行文本中的旧式数字，采用 `--color-ink-2`。第一行（标题下的线，或声明）是 `--text-lead` 到 `--text-display-s` 的同一个面，墨水，大端线高 1.2。引文采用斜体；斜体永远不会进入头部。
- **标签、说明文字、导航链接、控件、表格标题、署名：** Bricolage Grotesque 500，位于 `"opsz" 12`，全宽，小一步，句子大小写，未跟踪； `--color-muted` 中的字幕。显示面上设置的数字采用衬里表格数字。页面上没有单声道。

## Surfaces · 表面

- 两个尺子重量： `--rule-heavy` 墨水尺打开一个部分或一个表格，头齐平在其下方； 1px `--color-rule` 细线部分行、列和数字，`--color-rule-2` 在表头下方。没有什么是被装箱的，没有什么会投射阴影。
- 所有东西的半径都是 0：控件、标签、输入、孔和照片都是尖锐的矩形。
- 深度是纸上的一步：井是 `--color-rule-2` 发际线下方的 `--color-paper-2`，而不是凸起的卡片。
- 条带：`--color-paper-2`井1条，`--color-paper`型`--color-ink`条带1条，一页最多两条；从来没有绿色带。
- 照片：近距离观察：工作中的双手、长凳上的物体、日光下的房间、打印的页面。窗外光线柔和，人从后面看，从来没有脸对着镜头；比生活安静一点，方形，8% 的嵌入墨水轮廓，全出血或剪切到列边缘。头像在一张照片上划过，只是作为封面线，一次是一页，是在墨水粗布上。第一屏下方两到三张大图；材料承载着其余的部分。
- 没有纹理，没有颗粒，没有网格。

## Range · 范围

- **行内容：**在粗线下，三到六行细线，左侧约40px处的压缩标题中的标题，右侧衬线中的第一行，最边缘显示面中的页面或日期。
- **第一个作为声明：** `--text-display-s` 的源衬线中的一两个句子，在粗线下跨十列；衬线的大小与头部一样都是这个主题。
- **数字反转：**在墨带上，三到四个提示数字位于 `--text-display` 的压缩头中，被细线分开，下面有标签。
- **作为规格表的订单：** 纸上的表格 - 2 井，其事实位于字段旁边的规则表中，显示面上的总数随着数量的变化而更新。

## Controls · 控制

- 一个充满墨水的方形块（`--color-ink` 上的 `--color-paper`）位于 1px 墨水轮廓块旁边，两者都在标签面上，48px 高；标签可以是一个填充的绿色矩形。
- 链接带有细线下划线，悬停时会变成绿色；输入和选择是方形的，52px 高，带有 1px `--color-rule-2` 边框，可在焦点上转动墨水。
- 绿色保持在屏幕的 5% 以下：悬停、一个标签、对焦环。

## Motion · 运动

仅状态：在 `--ease-out` 上的 `--dur-short` 上的链接下出现绿色下划线，块变暗一步，完全发生变化。没有透露，卷轴上什么也没有。

## Voice · 嗓音

现代的、轻度文学的、精确的。命名问题、页数、日期；头部读起来就像封面线，第一名一口气说出了论点。

## Do-nots · 不该做的事

- 绝不是衬线头； Source Serif 4 设置阅读文本、立场和引文，而不是 `h1` 到 `h3`。
- 切勿以默认宽度拼贴；没有`"wdth" 75`，头部就会失去弹匣比例。
- 绝不是圆角、药丸、阴影或绿色的尺子。
- 切勿将两个图片部分连续；每个后面都有行、第一行或数字。
- 切勿全大写喊叫；句子大小写，紧凑，杂志现代。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;1,8..60,400&display=swap" rel="stylesheet">
```

```css
body { color: var(--color-ink-2); font-optical-sizing: auto; font-variant-numeric: oldstyle-nums; }
h1, h2, h3 { font-weight: var(--display-weight); font-variation-settings: "wdth" 75, "opsz" 96; color: var(--color-ink); font-variant-numeric: lining-nums tabular-nums; }
small, figcaption, th, nav, label, .btn, .tag { font-family: var(--font-display); font-weight: 500; font-variation-settings: "opsz" 12; }
.standfirst { font: 400 var(--text-display-s)/1.2 var(--font-body); color: var(--color-ink); }
.opens { border-top: var(--rule-heavy) solid var(--color-ink); padding-top: var(--space-lg); }
.btn { border: var(--rule-hair) solid var(--color-ink); border-radius: 0; min-height: 48px; padding: 0 var(--space-lg); }
.btn--primary { background: var(--color-ink); color: var(--color-paper); }
.btn--secondary { background: none; color: var(--color-ink); }
.tag { background: var(--color-accent); color: var(--color-accent-ink); padding: var(--space-3xs) var(--space-xs); }
.well { background: var(--color-paper-2); border-top: var(--rule-hair) solid var(--color-rule-2); }
.photo > img { outline: 1px solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
a { text-decoration-color: var(--color-rule-2); text-underline-offset: 0.2em; } a:hover { text-decoration-color: var(--color-accent); }
::selection { background: color-mix(in oklab, var(--color-accent) 22%, transparent); }
```
