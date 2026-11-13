---
name: Darkroom
slug: darkroom
genre: atmospheric
paper: dark 12.5 55
display: display-condensed Sofia Sans Extra Condensed
accent: chromatic-amber 58
posture: restrained
keywords: photographer, photography, film, analogue, darkroom, prints, portfolio, exhibition, gallery, edition, commission, cinematographer, negative, archive, monochrome, lab, moody, black and white, night, print shop, travel, places, landscape, portrait, photo studio
material: warm print-black ground, a fine light grain, fibre-white ink, hairline Sofia Sans Extra Condensed capitals over Barlow, zero radius, black-and-white photographs printed deeper than the ground, one amber safelight
photo: mono high=-20 shad=-12
pictured: Photographic, Poster hero
---

# 暗室

关着灯的印刷室：温暖的黑色底色比印刷品本身的黑色浅一步，因此一张照片作为一个物体放在上面；纤维白墨水；巴洛上方的细线超浓缩大写字母；一个琥珀色安全灯。照片是黑白的，印得又深又大，剩下的就靠字体了。它不是电影胶片服装、喜怒无常的渐变、平面黑色屏幕或白色无光泽的画廊。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(12.5% 0.008 55); --color-paper-2: oklch(16% 0.009 55); --color-paper-3: oklch(20.5% 0.01 55);
  --color-ink: oklch(92% 0.012 78); --color-ink-2: oklch(80% 0.012 75); --color-muted: oklch(64% 0.012 65);
  --color-rule: oklch(29% 0.01 55);
  --color-accent: oklch(73% 0.15 58); --color-accent-deep: oklch(50% 0.11 52); --color-accent-ink: oklch(12.5% 0.008 55); --color-focus: oklch(73% 0.15 58);
  --font-display: "Sofia Sans Extra Condensed", ui-sans-serif, sans-serif; --font-body: "Barlow", ui-sans-serif, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.005em; --display-weight: 200; --grain: 0.07;
}
```

设计记录 (`darkroom: amber`) 中注明了三种配色。

| 配色 | 地线、墨水、信号 |
| --- | --- |
| **琥珀色**（默认） | 上面的设计令牌 |
| **红色的** | 信号`oklch(62% 0.19 32)`，深`oklch(44% 0.16 32)` |
| **纤维纸** | 接地 `oklch(95% 0.01 80)`，墨水 `oklch(14% 0.006 40)`，静音 `oklch(46% 0.01 50)`，信号 `oklch(50% 0.2 30)`，规则 `oklch(80% 0.014 70)`； 0.12 处的黑点 |

## Type · 类型

- **显示：** Sofia Sans Extra 压缩大写字母，首屏主视觉、章节标题和人物为 200，项目标题和控件为 400，行高 1.0，`--tracking-display`，罗马字体。比例上的细线就是外观：由于额外压缩，每个显示步骤都可以在共享比例之上设置一个步骤，并且首屏主视觉头像跨八列延伸到海报尺寸。
- **正文：** Barlow 400 用于 17px 和 1.6 的散文，因此阅读文本在黑暗中保持不变； Barlow 300 仅适用于引线尺寸及以上。
- **标签、说明文字、表格标题：** Barlow 400 更小一步，句子大小写，未跟踪，在 `--color-muted` 中；车牌号和月份就是这个声音。数字是表格形式的。没有单声道。

## Surfaces · 表面

- 深度是轻，而不是轻：地面 12.5，井 16，表面 20.5。没有晕影，没有绽放，没有阴影；印刷品的黑色位于地面以下，这使得它看起来像印刷品。
- 规则：1px `--color-rule`，在纸张行之间运行全宽，并在图形之间作为垂直细线；半径处处为 0。
- 条带：`--color-paper-2` 良好，颗粒状，适用于没有图片的部分；一页最多两页，从来没有琥珀色字段。
- 照片：作品。黑白，印深（开放高光、全黑、胶片颗粒）；远处有周围空间的拍摄对象，或者近距离且平坦的拍摄对象。半径0，无框架，无垫子；全出血或固定在列上，绝不是缩略图大小，下方有标题和车牌号。字体仅穿过照片最暗的三分之一，即地面的 40% 至 70%。
- 纹理： `texture.md` § 1 的斑点颗粒位于 `--grain`，在井上；从来没有过一张照片。

## Range · 范围

- **数字作为一个版本：**提示的真实数字（印版、每个印刷品、运行）在 12rem 的 200 发丝线上，在颗粒状井上，它们之间有垂直的发丝线，每条线下面都有一条柔和的巴洛线；大小为戏，色彩为墨。
- **收藏页：** 全角细线下的行，左侧为柔和的巴洛字体的标签，右侧为标题大小的显示大写字母的值：系列、主题、负片、纸张、版本、尺寸。
- **作为接触条的过程：** 跨过十二列，每个阶段在一条短线上（曝光、冲洗、印刷、编辑）上有一个截面大小的细线数字，由垂直线分开；什么也没画。
- **设置为数字的选择：** 1px 规则单元格中的板或尺寸的工作选择器，每个显示标题尺寸的数字，所选的一个由安全灯点亮，旁边是地面上的普通表格。

## Controls · 控制

- 这对：1px 墨水轮廓的次要旁边是 `--color-accent-ink` 中琥珀色填充的主要，两者都显示大写字母 400，未跟踪，半径 0，48px 高。
- 链接为墨迹，并在 `--color-rule` 中加下划线；悬停时下划线会变成琥珀色。输入：半径 0、地面上的 1px `--color-muted` 边界、焦点上的稳定轮廓。
- 安全灯很少：一个填充的控件、一个选定的板、悬停时的标题； `--color-accent-deep` 是更安静的墨迹文本填充。

## Motion · 运动

仍如印刷品。照片可能会从 `--dur-long` 上方的地面上升一次，如托盘中所示，从可见的默认值开始；将鼠标悬停在链接的板上会将其数字变成琥珀色。其他什么也没有动。

## Voice · 嗓音

实验室笔记和收藏表：系列、板、地点、月份、版本、纸张。精确的数字，简短的台词，没有关于光或灵魂的形容词。

## Do-nots · 不该做的事

- 切勿采用琥珀色洗涤、琥珀色带、琥珀色或琥珀色头；安全灯点亮一个控件或一个数字，而不是一个部分。
- 切勿使用链轮孔、胶片条、油笔环或拉制框架。
- Sofia Sans Extra Condensed 的头从来没有超过 400，除了 200 之外也从来没有出现过任何数字。
- 切勿在图片上使用棕褐色、双色调或色调，并且切勿在打印件下使用纯平屏幕黑色。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:wght@200;400&family=Barlow:wght@300;400&display=swap" rel="stylesheet">
```

```css
h1, h2, .figure { font-family: var(--font-display); font-weight: 200; text-transform: uppercase; line-height: 1; letter-spacing: var(--tracking-display); }
h3 { font-family: var(--font-display); font-weight: 400; text-transform: uppercase; line-height: 1; }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: var(--rule-hair) solid var(--color-ink); border-radius: 0; background: transparent; color: var(--color-ink); font: 400 var(--text-lg)/1 var(--font-display); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.well { background: var(--color-paper-2); }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: var(--grain); background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E") 0 0 / 200px 200px; }
::selection { background: color-mix(in oklab, var(--color-accent) 35%, transparent); }
```
