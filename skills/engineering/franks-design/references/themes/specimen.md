---
name: Specimen
slug: specimen
genre: editorial
paper: light 96.5 82
display: high-contrast-serif Bodoni Moda
accent: cool 262
posture: restrained
keywords: typography, type specimen, foundry, letterform, portfolio, editorial, magazine, essay, type studio, agency, brand story, print, publication, craft, considered, literary
material: warm oat paper, warm near-black ink, razor-hairline Bodoni Moda over Geist, square 1px rules, one ink-blue signal that also draws the metric guides
photo: duotone ink paper con=8
pictured: Specimen Book, Poster hero
---

# 标本

铸造厂的材料：温暖的燕麦纸、温暖的近乎黑色的墨水、Bodoni Moda 400 固定在其最高光学尺寸，因此发丝在茎上细如剃刀，其下方是 Geist 主体、方形 1px 规则和一个墨蓝色信号。它读起来像手工设置的、精确的，因为所有的对比都存在于字母内部，没有颜色或深度的对比。它不是带有赤土​​色的奶油色奢侈品页面，也不是大胆的 Didone 时尚报头。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(96.5% 0.016 82); --color-paper-2: oklch(93.5% 0.02 80); --color-paper-3: oklch(89% 0.024 78);
  --color-ink: oklch(17% 0.012 60); --color-ink-2: oklch(28% 0.014 60); --color-muted: oklch(49% 0.014 65);
  --color-rule: oklch(80% 0.018 75); --color-rule-2: oklch(66% 0.02 72);
  --color-accent: oklch(45% 0.18 262); --color-accent-ink: oklch(97% 0.012 82); --color-focus: oklch(50% 0.18 262);
  --color-guide: oklch(55% 0.16 262 / 0.5);
  --font-display: "Bodoni Moda", ui-serif, Georgia, serif; --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px;
  --shadow-card: none;
  --tracking-display: -0.02em; --display-weight: 400; --display-optical: 96;
}
```

`--color-guide` 是蓝色的第二个优势：在单词下方绘制用于公制参考线（大写高度、x 高度、基线）的半透明细线，而不是填充。 `--color-rule-2` 是控件轨道或表头部的深色细线。

## Type · 类型

- **显示：** Bodoni Moda 400，`--tracking-display`，行高 1.02，句首字母大写，罗马字体。 `h1`和`h2`采用`"opsz" 96`，其中发际线几乎消失在茎上，这种对比就是图形； `h3` 让轴跟随其尺寸，因为剃刀发际线在 25px 处断裂。设置为海报的单词可能会运行到20vw。
- **主体：** Geist 400，17px，线高 1.55； Didone 下的 plain sans 就是张力。 Bodoni Moda 斜体保留在运行文本或样本中，而不是头部。
- **标签、说明文字、表格标题：** Geist 500 小了一步，句子大小写，`--color-muted`。 Geist Mono 仅适用于比较（尺寸、重量、代码点）、表格的数字。

## Surfaces · 表面

- 1px `--color-rule` 分区、表格行和单元格之间的细线； 3px `double` 规则将一个重要的表作为一页的标题。
- 没有深度：没有任何东西升起，没有任何东西投下阴影，没有任何东西是圆形的。井是发际线内的纸台阶（`--color-paper-2`）。
- 表带：`--color-paper-2` 表带，或燕麦型 `--color-ink` 表带，其中 Didone 读数最清晰；一页最多两页，绝不是蓝色的。
- 照片：最多一张，面孔的世界：阅览室，桌上打开的一本书，箱子里的金属分​​类；它用墨水在燕麦（双色调）上打印成盘子、正方形、发际线内、八列或整个容器。它的标题命名了它下面的设置；类型永远不会坐在上面。
- 没有纹理，没有网格，没有字体背后的渐变：燕麦是一种颜色，而不是纸张扫描。

## Range · 范围

- **带有指南的声明：** 海报尺寸的一个单词或一行，其真实大写高度、x 高度和基线处有 `--color-guide` 发际线，每个单词或行均以标签样式命名。
- **行如瀑布：** 一条线穿过尺寸，每行在左侧的 Geist Mono 中都有其尺寸，中间有细线，每条线都会被剪切以适合其行。
- **网格作为字符集：**跨越十二列的细线单元，一个四宽的前导单元保持显示尺寸的字形；当前单元格充满墨水。
- **比较和价格表：** 墨带上斜体旁边有罗马字体，阅读尺寸各一篇；许可证作为双重规则下的规则表，Didone 的价格为 `--text-display-s`。

## Controls · 控制

- 一对：一个带有燕麦文本的充满墨水的矩形，旁边是一个 1px 墨水轮廓的矩形，均为正方形，Geist 500，48px 高。
- 范围是带有方形墨水拇指的 1px `--color-rule-2` 轨道；切换开关是一条墨水细线内的两个方形单元，按​​下一张纸，下面有一条 2px 墨水尺，因此墨水填充保持原始状态。输入与 `--color-focus` 环呈方形。
- 链接在 0.18em 处带有 1px 墨蓝色下划线，悬停时会变粗。蓝色保持在屏幕的 5% 以下：链接、对焦环、参考线、一个图形。

## Motion · 运动

除了状态之外，没有任何东西在移动：下划线变粗，单元格被填充，样本获得给定的尺寸和重量。没有透露，没有循环，到达时什么也没有。

## Voice · 嗓音

社论，手工制作，略带文学色彩。动词高于形容词；说出面孔、大小、数量。

## Do-nots · 不该做的事

- 切勿使用沉重的显示头；大胆地将 Didone 变成了时尚标头。较重的重量仅作为一个系列的样本出现。
- `h1` 或 `h2` 上的光学尺寸不得低于 72；发际线过长是这个主题最常见的失败。
- 从来没有温暖的口音，从来没有冷纸：信号是墨蓝色的，温暖来自燕麦。
- 绝不是用绘制的书、页面或设备来显示文本；将文本本身设置为其大小。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400&family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); line-height: 1.02; }
h1, h2 { font-variation-settings: "opsz" var(--display-optical); }
h3 { font-optical-sizing: auto; line-height: 1.15; }
.btn { min-height: 48px; border: var(--rule-hair) solid var(--color-ink); border-radius: var(--radius-card); padding: 0 var(--space-lg); font-weight: 500; }
.btn--primary { background: var(--color-ink); color: var(--color-paper); }
.btn--secondary { background: transparent; color: var(--color-ink); }
.guide { border-top: var(--rule-hair) solid var(--color-guide); }
.rule--double { border: 0; border-top: 3px double var(--color-rule-2); }
input[type="range"] { appearance: none; height: 1px; background: var(--color-rule-2); }
input[type="range"]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; background: var(--color-ink); border-radius: 0; }
.photo > img { outline: var(--rule-hair) solid var(--color-rule); outline-offset: -1px; }
a { text-decoration-color: var(--color-accent); text-underline-offset: 0.18em; }
a:hover { text-decoration-thickness: 2px; }
```
