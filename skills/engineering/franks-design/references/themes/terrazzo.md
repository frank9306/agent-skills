---
name: Terrazzo
slug: terrazzo
genre: modern-minimal
paper: light 96 82
display: geometric-sans Syne
accent: warm 38
posture: restrained
keywords: materials, library, architects, samples, catalogue, surfaces, stone, timber, terrazzo, ceramic, tile, interiors, interiors studio, showroom, specification, swatches, supplier, drawer, photography, tactile
material: off-white paper, white card surfaces ruled in ink over a hard offset, wide Syne heads over Onest, JetBrains Mono for codes and millimetres, surfaces photographed flat-on in true colour, rust the one signal
photo: natural con=4
pictured: Sample Drawer, Ledge hero
---

# 水磨石

材料库的规范声音：米白色纸张、近乎黑色的墨水、宽的 Syne 头覆盖在朴素的 Onest 主体上、JetBrains Mono 表示代码和毫米、白色卡片表面用 2px 墨水划在硬胶印上，使表面本身平放并靠近拍摄。控件为墨水；颜色只能以聚合的形式出现，出现在照片所显示的石头、木材、水磨石和釉料中，而铁锈就是唯一的信号。它的组织方式就像一个样品抽屉，读起来就像一个规格表。这不是一个柔和的生活方式页面，也不是五彩纸屑。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(96% 0.009 82); --color-paper-2: oklch(92% 0.012 82); --color-paper-3: oklch(87.5% 0.014 80);
  --color-plate: oklch(99.5% 0.003 82);
  --color-ink: oklch(16% 0.006 60); --color-ink-2: oklch(27% 0.006 60); --color-muted: oklch(46% 0.01 60);
  --color-rule: oklch(81% 0.012 80);
  --color-accent: oklch(53% 0.15 38); --color-accent-soft: oklch(91% 0.035 45); --color-accent-ink: oklch(99.5% 0.003 82); --color-focus: oklch(50% 0.16 38);
  --font-display: "Syne", ui-sans-serif, sans-serif; --font-body: "Onest", ui-sans-serif, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 14px 14px 0 var(--color-paper-3); --shadow-card-hover: 14px 14px 0 var(--color-ink);
  --tracking-display: -0.025em; --display-weight: 700;
}
```

设计记录 (`terrazzo: off-white`) 中注明了三种配色。

| 配色 | 纸张和墨水 | 信号和控制 |
| --- | --- | --- |
| **灰白色**（默认） | 上面的设计令牌 | 锈;墨水控制 |
| **黑色的** | `oklch(14% 0.005 60)`下骨墨`oklch(96% 0.01 80)`；卡片保持白色 | 锈迹提升至`oklch(68% 0.14 40)`；带有墨迹文本的骨骼控件 |
| **石头** | 同墨下暖灰`oklch(85% 0.012 80)` | 锈;墨水控制 |

## Type · 类型

- **显示：** Syne 700、`--tracking-display`、行高 1.0、句首字母大写。脸部变宽，因此头部保持较短而不是下降一步； 800 变得笨拙并且从未被使用过。显示尺寸的数字取-0.04em。
- **正文：** Onest 400 和 500，行高 1.5。每页三种粗细：400、500、700。
- **标签、标题、表格标题：** Onest 500 更小，句子大小写，未跟踪。
- **代码和度量：** JetBrains Mono 500 的示例代码 (`ST-0412`)、尺寸以毫米为单位、表格中的计数；旁边文本的大小，而不是标签或标题。

## Surfaces · 表面

- 规则：`--rule-bar` 墨水涂在桌子顶部、沿带子边缘和卡片周围； `--rule-hair` 在 `--color-rule` 行之间。处处半径为 0。
- 卡片： `--color-plate` 位于 `--rule-bar` 墨水边框内，硬质 `--shadow-card` (paper-3, no blur) 之上，页面的一个容器；没有其他的演员。链接的卡片在悬停时将其偏移量交换为墨迹。
- 表带：带有纸质文本的 `--color-ink` 表带，或 `--color-paper-2` 表带；从来没有彩色字段，一页最多两个。
- 照片：表面本身平坦且在日光下紧密贴合，因此纹理、碎片、纹理和接缝几乎一一对应；一组四次运行作为一个真实组以一个比率运行。真实颜色，稍微锐化。每张卡片都边对边地写着标题，下面写着家庭名称和结局；文字永远不会出现在照片上。
- 纸上没有纹理，也没有绘制任何东西：照片中的表面就是图案。

## Range · 范围

- **规格表：** 库存为 `--rule-bar` 墨水规则下的全角表格：代码和尺寸为单色，表面名称为 Onest 500 标题尺寸，系列和表面处理为静音；悬停或选定的行采用 `--color-accent-soft` 和 Rust 代码。
- **墨带上的数字：** 图书馆在 Syne 中的一个大数字，两倍于 `--text-display`，纸上有墨水，其旁边有家族或术语，作为一个简短的规则列表。
- **规则步骤：** 一个真实的有序列表挂在发丝上，Syne 中的每个数字按部分大小，Onest 500 中的阶段及其旁边的一行。
- **作为请求卡的形式：** 带有硬胶印的白卡上的预订，在板颜色上输入方形，选择方形单元格边对边连接，检查单元格墨水与纸质文本。

## Controls · 控制

- 一个充满墨水的底色，旁边有 `--rule-bar` 嵌入墨水轮廓，均为方形，Onest 500。在墨带上，底色转动印有墨水文本。
- 链接是带有细线下划线的墨水，悬停时会生锈； `--color-plate` 上的输入为方形，带有 1px 墨水边框。
- Rust 到达代码、选定的行或芯片、悬停下划线和焦点环；否则颜色仅来自照片。

## Motion · 运动

仍然。链接的卡片通过 `--dur-micro` 将其偏移量从纸张 3 交换为墨水​​；过滤后的行离开时没有动画。

## Voice · 嗓音

目录的简单性：系列、表面处理、代码、尺寸一一对应。从来不卖石头的感觉。

## Do-nots · 不该做的事

- 绝不是拉扯的碎片、斑点或五彩纸屑；表面的颜色来自它的照片。
- 切勿将照片作为背景或底稿；它存在于一张卡片中。
- 切勿在灰白纸上使用彩色原色；控件是墨水。
- 卡片、控件或照片上绝不能使用圆角。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Onest:wght@400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 700; line-height: 1; }
.btn { border-radius: 0; padding: var(--space-md) var(--space-lg); font-weight: 500; color: inherit; }
.btn--primary { background: var(--color-ink); color: var(--color-paper); }
.btn--secondary { box-shadow: inset 0 0 0 var(--rule-bar) currentColor; }
.card { background: var(--color-plate); border: var(--rule-bar) solid var(--color-ink); box-shadow: var(--shadow-card); }
a.card { transition: box-shadow var(--dur-micro) var(--ease-out); }
a.card:hover { box-shadow: var(--shadow-card-hover); }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
.band--ink .btn--primary { background: var(--color-plate); color: var(--color-ink); }
.spec { border-top: var(--rule-bar) solid var(--color-ink); } .spec tr:hover { background: var(--color-accent-soft); }
.code { font-family: var(--font-outlier); font-weight: 500; font-variant-numeric: tabular-nums; }
::selection { background: color-mix(in oklab, var(--color-accent) 25%, transparent); }
```
