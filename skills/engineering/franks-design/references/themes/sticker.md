---
name: Sticker
slug: sticker
genre: playful
paper: light 95.7 82
display: display-heavy Bowlby One SC
accent: chromatic-magenta 2
posture: full-palette
keywords: stickers, print, merch, shop, maker, creator, diy, craft, vinyl, packaging, labels, small business, ecommerce, fun, loud, pink, cut, ship, order
material: warm off-white paper, warm black ink, Bowlby One SC over Sofia Sans, white die-cut borders on hard offset shadows, hot pink, lime and ink fills set with type
photo: natural vib=15 con=5
pictured: Bento Grid, Stage hero
---

# 贴纸

印刷店的材料：一张温暖的灰白色纸张，温暖的黑色墨水，Sofia Sans 上的 Bowlby One SC 大写字母，亮粉色和石灰填充，每个凸起表面都在硬胶印阴影上以厚厚的白色模切边缘。它感觉响亮且手工制作，因为深度是印刷的，颜色是填充的，从不着色。这不是一家阴影模糊的柔和粉彩店，也不是卡通玩具页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(95.7% 0.013 82); --color-paper-2: oklch(92.8% 0.021 79); --color-paper-3: oklch(99.4% 0.007 89);
  --color-ink: oklch(21% 0.011 81); --color-ink-2: oklch(30% 0.013 78); --color-muted: oklch(50% 0.017 64);
  --color-rule: oklch(89.7% 0.02 80); --color-white: oklch(99.5% 0.003 82);
  --color-accent: oklch(56% 0.225 2); --color-accent-deep: oklch(49% 0.205 2); --color-accent-2: oklch(87.6% 0.179 119); --color-slot: oklch(95% 0.021 355);
  --color-accent-ink: oklch(99.5% 0.003 82); --color-focus: oklch(56% 0.225 2);
  --font-display: "Bowlby One SC", "Arial Black", sans-serif; --font-body: "Sofia Sans", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Sofia Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 18px; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 5px 6px 0 var(--color-ink); --shadow-press: 1px 1px 0 var(--color-ink);
  --tracking-display: 0.005em; --display-weight: 400;
}
```

两种配色，在设计记录 (`sticker: sheet`) 中注明。

| 配色 | 纸张、墨水、填充物 |
| --- | --- |
| `sheet`（默认） | 上面的块 |
| `vinyl` | 地面`oklch(21% 0.011 81)`，卡片`oklch(25.5% 0.013 72)`，墨水`oklch(95.7% 0.013 82)`，尺子`oklch(33% 0.016 75)`；粉色和石灰不变，边框仍然是白色 |

## Type · 类型

- **显示：** Bowlby One SC 400，仅按设计大写，`--tracking-display`，行高 1.02。它又宽又重，因此 `h1` 盖位于 4.5rem 处，截面头位于 3.25rem 处。从来没有一个段落。
- **数字：** Bowlby 中设置的价格、计数和步数，以及填充上的单个数字可能会运行到 12rem；这是主题拥有的最响亮的东西，所以一个屏幕。
- **主体：** Sofia Sans 400 和 600，行高 1.5，`tabular-nums`。
- **标签、标记、说明文字、表格标题：** Sofia Sans 700 小了一步，句子大小写，未跟踪，`--color-muted`。没有第三张面孔：异常标记是 Sofia Sans。

## Surfaces · 表面

- 模切：凸起的表面（卡片、包含事实、标签、照片、主要控件的填充物）带有 6px、`--color-white` 边框和 `--shadow-card`，这是一种没有模糊的硬偏移。作为纸张本身的表面（表格、带）保持无边框，由虚线规则分隔。
- 凸起的表面可能会在 -6 到 6 度之间倾斜，但绝不会全部向一个方向倾斜；表格和输入保持方形。
- 半径：卡片上 `--radius-card`、照片上 22px、控件和标签上的药丸； `--rule-bar` 虚线 `--color-rule` 是分隔线和放置区的边缘。
- 条带：一条`--color-paper-2`条带、一条纸质型`--color-ink`条带、或一条墨水型石灰带；一页最多两页。
- 照片：产品在使用中或拿着镜头，近距离，色彩保持鲜艳； 22px半径内白色模切，一屏倾斜3度以内。标签可能与事实重叠一角；文字永远不会出现在图片上。
- 类型后面没有纹理、没有渐变：深度只是硬偏移。

## Range · 范围

- **模切填充物的事实：** 一个便当，其瓷砖是粉红色、石灰色、墨水和白色填充物，鲍尔比中的每个事实都有一条索菲亚线，在硬阴影上边缘为白色，并在交替方向上倾斜一到两度；铅瓦承载着孤独的身影。
- **作为固定卡片的步骤：** 三张或四张 `<ol>` 卡排成一排，石灰圆盘上的 Bowlby 数字，卡片相互倾斜并与它们所在的虚线规则重叠。
- **石灰场上的工作控件：** 步进器、Bowlby 中的运行总计以及填充到提示给出的阈值的条形，位于虚线价格阶梯旁边的白色模切卡上。
- **鲍尔比墨带上的声明**，十列宽，在其一角贴有一个粉红色或石灰标签，载有其主张的事实。

## Controls · 控制

- 对照组：一颗粉红色药丸，带有 5px 白色环和 `--shadow-card`，旁边是一颗带有 2px 墨水边框的幽灵药丸。芯片是带有 2px 嵌入尺的药丸，所选的一种填充有墨水。
- 链接为墨迹，悬停时带有粉红色下划线；输入在 `--radius-card` 处采用 2px 墨水边缘。
- 三分颜色：粉红色表示起作用的填充（主要的、价格），石灰表示填充的标记（标签、计数、突出显示），墨水表示类型。

## Motion · 运动

贴纸物理：悬停会抬起可点击的凸起表面 2px 并将其旋转一定角度；压力将它推到它的影子上。 `--dur-micro` 在 `--ease-out` 上，滚动上没有任何内容。

## Voice · 嗓音

愉快而准确：价格、数量、尺寸、发货日期。听起来像是切割机旁的人。

## Do-nots · 不该做的事

- 凸起表面下绝不会有柔和模糊的水滴；阴影是硬偏移或者没有阴影。
- 模切边框不得比 4px 更薄，也不得采用除白色以外的任何颜色。
- 纸上切勿出现粉红色文字；粉色是上面填充白色的。
- 切勿绘制贴纸、吉祥物或涂鸦；模切边缘是真实的表面、事实或照片，而不是代表设计的形状。
- 绝不是一张只站在拍摄对象附近的照片（一个瓶子、一个订书机、一个铅笔筒）；没有产品自己的图片，填充物承载页面。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One+SC&family=Sofia+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: 400; letter-spacing: var(--tracking-display); line-height: 1.02; }
h1 { font-size: min(var(--text-display), 4.5rem); } h2 { font-size: min(var(--text-section), 3.25rem); }
.diecut { border: 6px solid var(--color-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.diecut--photo { border-radius: 22px; overflow: hidden; background: var(--color-slot); }
.btn { display: inline-flex; align-items: center; height: 52px; padding: 0 var(--space-lg); border-radius: var(--radius-pill); font-weight: 700; font-size: var(--text-md); color: var(--color-ink); box-shadow: inset 0 0 0 2px var(--color-ink); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); box-shadow: 0 0 0 5px var(--color-white), 5px 6px 0 var(--color-ink); transition: translate var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
.btn--primary:hover { background: var(--color-accent-deep); }
.btn--primary:active { translate: 4px 5px; box-shadow: 0 0 0 5px var(--color-white), var(--shadow-press); }
.fill { border: 6px solid var(--color-white); border-radius: var(--radius-card); box-shadow: var(--shadow-card); background: var(--color-accent); color: var(--color-accent-ink); }
.rule { border-top: var(--rule-bar) dashed var(--color-rule); }
::selection { background: var(--color-accent-2); color: var(--color-ink); }
```
