---
name: Brutal
slug: brutal
genre: editorial
paper: light 97.5 95
display: grotesk-heavy Libre Franklin
accent: chromatic-yellow 105
posture: committed
keywords: brutalist, raw, bold, high-contrast, statement, agency, design studio, portfolio, streetwear, drop, zine, type-forward, graphic design, poster, festival, collective, no-nonsense, uncompromising
material: near-white poster stock, near-black ink as 3px rules, boxed cells and solid fills, uppercase Libre Franklin 900 over its 400, zero radius, one acid-yellow fill
photo: duotone ink paper con=24
pictured: Marquee Hero, Poster hero
---

# 野蛮

一张原始的、工程设计的纸张：近乎白色的海报纸、近乎黑色的墨水（按照 3px 规则到达）、盒装单元和实心填充，自由富兰克林在紧密的大写字母中处于最黑状态，零半径，以及一种只能填充的酸性黄色。网格是绘制出来的，而不是暗示的：单元格共享它们的规则，方框内大的数字或单词是页面的装饰。照片用墨水打印得很硬。它不是一个黑暗的黑客页面，不是一本装饰过的杂志，也不是一张胶印阴影的贴纸。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(97.5% 0.006 95); --color-paper-2: oklch(94% 0.007 95); --color-paper-3: oklch(89.5% 0.008 95);
  --color-ink: oklch(10% 0.006 95); --color-ink-2: oklch(16% 0.006 95); --color-muted: oklch(40% 0.008 95);
  --color-rule: oklch(10% 0.006 95);
  --color-accent: oklch(90% 0.19 105); --color-accent-ink: oklch(10% 0.006 95); --color-focus: oklch(48% 0.1 110);
  --font-display: "Libre Franklin", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: var(--font-display);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 3px; --shadow-card: none;
  --tracking-display: -0.03em; --display-weight: 900;
}
```

## Type · 类型

- **显示：** Libre Franklin 900，大写，`--tracking-display`，行高 1.0（包裹大写字母的底面），每头一重。声明或首屏主视觉头像可能会跑到显示盖并经过它；将其设置为填充量程，而不是礼貌地坐在其中。大写字母属于标题、文字标记以及设置为单元格全部内容的单词或数字。
- **正文：** Libre Franklin 400，17 至 18px，行高 1.5，句子大小写，墨水；项目标题和控件位于 700，句子大小写。总共三个重量：400、700、900。
- **数字：** 索引数字、计数和日期为 900，带有 `tabular-nums`，当它们带有行时为 `--text-section` 或更大。
- **标签、说明文字、表格标题：** Libre Franklin 400 缩小一步，句子大小写，采用 `--color-muted`； mono 仅出现在代码内部。

## Surfaces · 表面

- 两个规则权重，没有其他规则：`--color-rule` 中的 `--rule-bar` 将一口井、一张桌子、一个单元格或一张照片装箱； `--rule-hair` 拆分其中的行。相邻单元共享一条 3px 规则，而不是两条。
- 一切事物的半径为零。深度是填充和边框，而不是阴影：有边框的纸张、纸质文本的墨水填充或墨水下的黄色填充；没有任何东西漂浮在纸上。
- 条带：带有纸质文本的 `--color-ink` 条带，或带有 `--rule-bar` 的顶部和底部划线的 `--color-paper-2` 条带；一页最多两页。黄色从来不作为乐队运行。
- 照片：正在使用的东西的原始记录，被那里的任何东西照亮（舞台灯、闪光灯、夜晚的街道）：里面的人群、门前的房间、舞台屏幕；从来没有摆出一副姿势。它们用墨水打印（`photo:` 双色调），在 `--rule-bar` 框架内剪裁紧密并齐平，或者在页面声音最大的地方全出血。文字只有在与框架齐平的固体墨水或纸块上才能满足照片的要求；从来没有稀松布。
- 没有纹理，没有装饰，没有渐变。

## Range · 范围

- **作为盒装表格的索引：** 3px 框内的行，之间有细线，其自己的单元格中的部分大小为 900 中的数字，标题大小为 700 中的条目，400 中的一行；悬停或当前行在其墨水下方填充黄色。
- **声明：** 一个直截了当的句子，用 900 个大写字母写在显示尺寸或更大的所有十二列中，坐在 3px 规则上，屏幕上除了其归属之外没有其他任何内容。
- **作为便当的单元格：** 事实以 900 个大写字母形式设置在盒装单元格内，这些单元格具有相同的规则，一个引导单元格是两倍大小，一个墨水单元格用于对比，一张照片齐平在一个单元格中。
- **表格作为网格：**字段作为共享其规则的盒装单元格，选择集作为两个大单词单元格，在选择时填充黄色，发送按钮是墨迹单元格。

## Controls · 控制

- 这对：一个 `--rule-bar` 带边框的纸质按钮，旁边是一个带有纸质文本的实心墨水按钮，句子大小写为 Libre Franklin 700，48 到 52px；悬停在一帧中反转任一。
- 链接为墨迹、下划线；悬停在墨水下方填充黄色。输入：零半径、`--rule-bar` 边框、纸上墨水、52px。
- 黄色是填充，从不键入，规则或环：选定的选项，运行文本中的 `mark`，悬停的行或链接。始终位于墨水下方，绝不位于照片上方，小于屏幕的 5%。焦点采用深橄榄色`--color-focus`。

## Motion · 运动

没有什么会滑行。状态在一帧中翻转：表面反转为带有纸质文本的墨水，或者在其墨水下方填充黄色。没有显示、没有反弹、没有视差。

## Voice · 嗓音

直率的、陈述性的：头部大写，其他地方都是句子大写；用业内人士的话来说，不套期保值，不炒作。把事情说平。

## Do-nots · 不该做的事

- 绝不是圆角或阴影、模糊或硬偏移；深度是边框和填充。
- 绝不是装饰品、花朵或分层的胶印堆叠；残酷是原始的，没有装饰的。
- 绝不是黑纸；这是一种黑色结构的光片。
- 绝不使用第二种颜色：照片用墨水打印，并且仅填充黄色。
- 细胞相遇的地方永远不会有两条规则；双 6px 接缝读起来是一个错误，而不是结构。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;700;900&display=swap" rel="stylesheet">
```

```css
h1, h2, .display { font-family: var(--font-display); font-weight: var(--display-weight); text-transform: uppercase; letter-spacing: var(--tracking-display); line-height: 1; }
h3 { font-family: var(--font-display); font-weight: 700; }
.btn { border: var(--rule-bar) solid var(--color-rule); border-radius: 0; padding: var(--space-xs) var(--space-lg); background: var(--color-paper); color: var(--color-ink); font-weight: 700; transition: none; }
.btn:hover, .btn--ink { background: var(--color-ink); color: var(--color-paper); } .btn--ink:hover { background: var(--color-paper); color: var(--color-ink); }
.cells { display: grid; gap: 0; border: var(--rule-bar) solid var(--color-rule); }
.cells > * { margin: calc(var(--rule-bar) * -1) 0 0 calc(var(--rule-bar) * -1); border: var(--rule-bar) solid var(--color-rule); }
.well--ink, .band--ink { background: var(--color-ink); color: var(--color-paper); }
.is-chosen, p mark, a:hover { background: var(--color-accent); color: var(--color-accent-ink); }
.photo { display: block; border: var(--rule-bar) solid var(--color-rule); border-radius: 0; }
::selection { background: var(--color-accent); color: var(--color-accent-ink); }
```
