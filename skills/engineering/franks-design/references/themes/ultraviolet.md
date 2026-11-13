---
name: Ultraviolet
slug: ultraviolet
genre: modern-minimal
paper: light 95 300
display: geometric-sans Outfit
accent: cool 290
posture: committed
keywords: music, audio, stems, remix, dj, producer, player, streaming, tempo, playlist, creator, app, consumer, lowercase, violet, sound, beats, recording studio
material: lavender paper or a violet-black night, Outfit set lowercase over Onest, hairline pills, one saturated violet in two strengths, photographs pulled into the violet
photo: tint accent con=10
pictured: Workbench, Stage hero, in the night colourway
---

# 紫外线

生产者的工具采用一种颜料：一张与墨水色调相同的纸，一种饱和的紫罗兰色，有两种强度，服装在每个头和控制上都设置小写，整个药丸，深度保持在发际线，照片拉成紫罗兰色。它读起来快速、准确、年轻，但没有提高声音。它不是紫色渐变的启动页面，也不是霓虹灯俱乐部传单。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(95% 0.02 300); --color-paper-2: oklch(92% 0.03 300); --color-paper-3: oklch(89% 0.035 300);
  --color-ink: oklch(18% 0.02 300); --color-ink-2: oklch(28% 0.03 300); --color-muted: oklch(46% 0.05 300);
  --color-rule: oklch(84% 0.04 300); --color-rule-2: oklch(70% 0.08 295);
  --color-accent: oklch(50% 0.25 290); --color-accent-deep: oklch(43% 0.22 290); --color-accent-soft: oklch(86% 0.08 295);
  --color-accent-ink: oklch(97% 0.01 300); --color-focus: oklch(50% 0.25 290);
  --font-display: "Outfit", ui-sans-serif, system-ui, sans-serif; --font-body: "Onest", ui-sans-serif, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 16px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(18% 0.02 300 / 0.06);
  --tracking-display: -0.03em; --display-weight: 500;
}
```

三种配色，每页设置一次并在设计记录 (`ultraviolet: lavender`) 中注明。夜间提示采用 `night`，它可能带有 `record` 颜色的一条带。

| 配色 | 纸、墨、口音 |
| --- | --- |
| `lavender`（默认） | 上面的块 |
| `record` | 地面 `oklch(50% 0.25 290)`，墨水 `oklch(95% 0.02 300)`，重音变为白色 `oklch(99% 0.005 300)`，上面有紫色文字，规则 `oklch(72% 0.14 292)` |
| `night` | 地面 `oklch(14% 0.02 290)`，纸张 2 `17.5% 0.025 290`，纸张 3 `21% 0.03 290`，墨水 `92% 0.04 300`，墨水 2 `80% 0.05 300`，静音 `68% 0.06 300`，规则 `28% 0.04 290`，规则 2 `44% 0.07 292`，重音 `55% 0.25 290`，深`48% 0.24 290`、柔光`36% 0.09 293`、聚焦`62% 0.22 290` |

## Type · 类型

- **显示：** Outfit 500，小写，`--tracking-display`，行高 1。小写是材料：头、导航链接、按钮和药丸从不带有大写字母。
- **数字：** `--text-display` 及以上的装备 300，小写单位在标签语音、表格中旁边；细长的几何数字是显示屏变亮的地方。
- **正文：** Onest 400，句子大小写，行高 1.55。散文是大写字母出现的地方。
- **标签、标题、表头：** Outfit 500 更小，小写，未跟踪，采用 `--color-muted`。 Mono 仅限内部代码。

## Surfaces · 表面

- 细纹：行间1px `--color-rule`；药丸和概述的对照品带有 1.5px 或 `--color-rule-2`。卡片无边框；一个表面是`--color-paper-2`的一个台阶。
- 半径：每个控件和标签上为 `--radius-pill`，表面、屏幕和照片上为 16px；没有什么是方形的。
- 深度：纸上没有，在凸起表面下的低语`--shadow-card`。没有模糊，没有发光，没有渐变。
- 条带：`--color-paper-2` 条带、墨水条带或 `record` 颜色中的一个紫色区域；一页最多两页。
- 该产品平放在 `--color-paper-2` 上或从其边缘溢出，绝不在边框中；波形是真正的线条作品，它在紫色中发挥作用，其余部分在`--color-accent-soft`中。
- 照片：音乐周围的夜晚（手放在调音台上，一个摊位，从后面看舞台上照亮的人群），紫色，16px半径，1px插入墨环8％；仅在墨水稀松布上打字。面孔永远不会主导。没有质感。

## Range · 范围

- **泳道如图：**产品自带的波形横跨十列或十二列，发际线下一干一排，标音上方有小节尺；演奏的部分是紫色的，其余部分是软的。它的一部分没有照片，也没有框架。
- **浅色服装中的数字：** 提示的实际数字显示尺寸为 300，由细线分隔，其中一个为紫色，旁边的每个单位小写。
- **用途表：**小写的全角表格，按标题大小使用，其茎如小药丸，一行所听到的内容；价目表采用相同的行。
- **记录字段：** 紫罗兰色中的一根带子持有工作下降区或表格，白色药丸是唯一的填充物。

## Controls · 控制

- 一颗紫罗兰填充药丸（`--color-accent` 上的 `--color-accent-ink`，悬停时的 `--color-accent-deep`）旁边有一个内嵌轮廓的药丸（`--color-ink` 的 1.5px），均为 Outfit 500 小写；在紫色区域内，填充的药丸变成白色，并带有紫色文字。
- 链接悬停时会以紫色下划线显示；输入是带有 1.5px `--color-rule-2` 插入环的药丸，可将墨水聚焦在焦点上。开关（独奏、静音）是小药丸，按下时会充满紫色。
- 紫色是一种颜料：一个填充控件、聚焦环、链接的悬停、进度填充、播放的波形、一个图形。

## Motion · 运动

快速、干燥：药丸上的 `--dur-micro` 颜色过渡在 `--ease-out` 上，当切换开关移动时，通道会变暗或亮起，最多一个在 `--dur-long` 上从已经可见的默认值开始加载。没有任何东西旋转或循环。

## Voice · 嗓音

小写、短、精确：词干、小节、分钟、曲目计数。它说话就像一个制作人，而不是一个厂牌。

## Do-nots · 不该做的事

- 绝不是头部大写、导航链接或按钮。
- 照片中也不会出现第二种彩色；紫罗兰是唯一的一种。
- 绝不是紫色到粉色的渐变、文本后面的网格或发光。
- 切勿使用方形控件或 4px 半径；紫外线是圆形的。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500&family=Onest:wght@400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 500; line-height: 1; text-transform: lowercase; letter-spacing: var(--tracking-display); }
.figure { font: 300 var(--text-display)/0.9 var(--font-display); font-variant-numeric: tabular-nums; }
.btn, .pill { display: inline-flex; align-items: center; border-radius: var(--radius-pill); font: 500 var(--text-sm)/1 var(--font-display); text-transform: lowercase; transition: background-color var(--dur-micro) var(--ease-out); }
.btn { min-height: 48px; padding: 0 var(--space-lg); } .pill { padding: var(--space-xs) var(--space-md); box-shadow: inset 0 0 0 1.5px var(--color-rule-2); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-deep); }
.btn--secondary { box-shadow: inset 0 0 0 1.5px currentColor; color: inherit; }
.well { background: var(--color-paper-2); border-radius: var(--radius-card); }
.band--violet { background: var(--color-accent); color: var(--color-accent-ink); }
.wave__rest { fill: var(--color-accent-soft); } .wave__played { fill: var(--color-accent); }
::selection { background: color-mix(in oklab, var(--color-accent) 25%, transparent); }
```
