---
name: Werkstatt
slug: werkstatt
genre: playful
paper: mid 84 82
display: geometric-sans Jost
accent: cool 264
posture: full-palette
keywords: school, programme, workshop, maker, course, bootcamp, academy, apply, admissions, tuition, timetable, bauhaus, craft, design education, design school, residency, cohort, prospectus
material: warm putty ground with a lighter well, near-black ink, Jost 700 capitals and numerals over Karla, square 2px and 3px ink rules that box cells, flat ultramarine, vermilion and yellow primaries
photo: mono
pictured: Catalogue, Settled hero
---

# 韦尔克施塔特

设计学校印刷的招股说明书：温暖的腻子底，近乎黑色的墨水，朴素的卡拉体上厚重的约斯特大写字母，方形的 2px 和 3px 墨水规则，以及三个平面原色，蓝色、红色和黄色，每个都有一个作业。它的照片是商店工作情况的黑白记录。它读起来既自学又自信，就像一个钉在车间墙上的程序：事实被装在规则的单元格中，日期和数字设置得像头一样大。它不是玩具盒调色板，也不是五彩纸屑形状的图案。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(84% 0.024 82); --color-paper-2: oklch(79.5% 0.028 80); --color-paper-3: oklch(89.5% 0.018 84);
  --color-ink: oklch(18% 0.008 60); --color-ink-2: oklch(27% 0.01 60); --color-muted: oklch(39% 0.014 62);
  --color-rule: oklch(58% 0.022 72);
  --color-accent: oklch(46% 0.2 264); --color-accent-2: oklch(58% 0.205 33); --color-accent-2-deep: oklch(50% 0.19 31); --color-accent-3: oklch(85% 0.165 92);
  --color-accent-ink: oklch(96% 0.012 82); --color-focus: oklch(46% 0.2 264);
  --font-display: "Jost", "Futura", sans-serif; --font-body: "Karla", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 2px; --rule-box: 3px;
  --shadow-card: none;
  --tracking-display: -0.005em; --display-weight: 700;
}
```

三种配色，每页设置一次并在设计记录 (`werkstatt: putty`) 中注明。

| 配色 | 地面、墨水、原色 |
| --- | --- |
| `putty`（默认） | 上面的块 |
| `blackboard` | 地面`oklch(17% 0.005 60)`，墨水`oklch(90% 0.015 80)`，规则`oklch(38% 0.01 60)`，原色更亮一步；油灰以井色的形式回归 |
| `blue` | 地面`oklch(50% 0.22 265)`，油墨`oklch(93% 0.02 85)`，尺`oklch(64% 0.14 265)`；黄色起到强调的作用 |

## Type · 类型

- **显示：** Jost 700，大写，`--tracking-display`，行高 1.02，位于共享步骤。首都是材料：每个头都镶嵌在其中。数字和日期在单元格内的显示尺寸和向上、表格形式上采用相同的面。
- **主体：** Karla 400，线高 1.5。
- **标签、标题、标签、表格标题：** Karla 600 更小，句子大小写，未跟踪，在 `--color-muted` 中。卡拉的小数字和价格，带有 `tabular-nums`；仅在代码内部为单声道。
- **控件：** Karla 600 大写，跟随显示 (the case gate 67 allows on an uppercase page)，未跟踪。

## Surfaces · 表面

- 规则：`--rule-box` 墨水线框并穿过网格，`--rule-bar` 墨水在导航下方和每个表格上运行，`--rule-hair` 在 `--color-rule` 行之间运行。没有一张卡片有背景；单元格是规则所包含的内容。
- 到处都是零半径和零阴影。
- 条带：一条 `--color-paper-2` 条带、一条带有 `blackboard` 颜色纸质文本的 `--color-ink` 条带，或者带有 `--color-accent-ink` 文本的一个蓝色字段；一页最多两个带。 `--color-paper-3` 是规则单元内的井，而不是条带。
- 照片：工作中的商店，纪实的和普通的，在长凳高度或从上面拍摄：一张长凳和它的工具，手放在飞机上，压机或轮子，木头，字体和粘土，距离足够近以读取纹理；白天，没有人面对镜头。黑白印刷（`photo:` 单色），因此原色仍然是唯一的颜色；正方形，位于 `--rule-bar` 墨水边框中，与周围的单元格齐平。商店的主要内容是其图片旁边或下方的扁平单元或条形，并带有标题；它永远不会给照片染色，而且打字也永远不会落在照片上。
- 没有纹理，任何地方都没有渐变。

## Range · 范围

- **盒装单元格中的数字：** Jost 700 中按显示尺寸显示的提示的实数，每个单元格位于跨十二列的自己的 `--rule-box` 单元格中，下面是 Karla 中的标签；没有原色，因为一组同类没有颜色。
- **日期作为规则的时间表：**截止日期和期限设置为与节标题一样大的大写字母行，左边的日期，右边发生的事情，第一行上方有 `--rule-bar`。
- **类别作为编码网格：**每个商店、轨道或房间都位于其主单元中，与其邻居齐平，并在填充上方有一张黑白照片或一张所覆盖内容的列表。
- **作为规则表的表单：** 单元格网格中的字段（如条目表单）、其主选项中的类别选择、在底部提交墨水块。

## Controls · 控制

- 一个透明的 `--rule-bar` 墨水边框按钮和一个填充墨水的按钮，均为方形；在墨水带上，这对反转：填充的墨水带变成油灰，而不是原色，因为原色代码类别。
- 链接带有 2px 墨水下划线，悬停时会变粗为 3px；输入是带有 `--rule-bar` 墨水边框的正方形。
- 原色是平面填充，不会打字，也不会着色。每个类别都编码一个类别，无论出现在何处（单元格、标签、带区、导航链接）都是相同的，并且一组同一种类别不采用任何颜色。蓝色和红色填充取`--color-accent-ink`，红色加深至`--color-accent-2-deep`；黄色填充需要墨水。蓝色也引起焦点。

## Motion · 运动

静态的，就像印刷的招股说明书：悬停时链接的下划线会变粗，其他任何东西都不会移动、显示或循环。

## Voice · 嗓音

朴素的学校散文：商店、星期、学费、截止日期，每一个都说一遍，简单明了。

## Do-nots · 不该做的事

- 切勿使用第四种颜色、原色、用作字体的原色或彩色照片。
- 绝不是容器、按钮或图像上的半径；韦尔克施塔特是方形的。
- 绝不混合大小写显示；这里的约斯特是首都。
- 绝不要将初选视为五彩纸屑或图案；每个填充代表一个类别。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@700&family=Karla:wght@400;600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 700; line-height: 1.02; text-transform: uppercase; }
small, th, figcaption { font-weight: 600; color: var(--color-muted); }
.btn { display: inline-flex; align-items: center; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); border: var(--rule-bar) solid currentColor; font: 600 var(--text-sm)/1 var(--font-body); text-transform: uppercase; color: inherit; background: transparent; }
.btn--primary { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-paper); }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
.band--ink .btn--primary { background: var(--color-paper); border-color: var(--color-paper); color: var(--color-ink); }
.ruled { border-block: var(--rule-box) solid var(--color-ink); }
.photo { border: var(--rule-bar) solid var(--color-ink); border-radius: 0; }
table { border-top: var(--rule-bar) solid var(--color-ink); } td { border-bottom: var(--rule-hair) solid var(--color-rule); }
a { text-decoration-thickness: 2px; } a:hover { text-decoration-thickness: 3px; }
::selection { background: var(--color-accent-3); color: var(--color-ink); }
```
