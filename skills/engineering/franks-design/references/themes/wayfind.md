---
name: Wayfind
slug: wayfind
genre: modern-minimal
paper: light 95.5 250
display: mono Chivo Mono
accent: cool 264
posture: committed
keywords: transit, metro, rail, station, wayfinding, departures, timetable, live, map, commute, city, platform, signage, logistics, status, operations, schedule, mobility, travel, trip, journey, itinerary, booking, flights, airport
material: cool grey paper, blue-black ink, Chivo Mono throughout, square 2px ink borders, ink plates, cobalt for what is live, amber for figures on ink
photo: natural sat=-12 con=10
pictured: Station Sequence, Stage hero
---

# 寻路

公共标牌设置为一页：冷灰色纸张、蓝黑色墨水、Chivo Mono 中的每个字形（一种朴素的 grotesk 切割到出发板的固定单元）、方形 2px 墨水边框、带有标志的墨水板、钴色代表生命，琥珀色代表人物。单声道是电路板的表面，边框标志着方向。在白天，它在三米处一目了然；它不是一个开发者工具，不是一个黑暗的终端，也不是一个复古的出发模仿。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(95.5% 0.006 250); --color-paper-2: oklch(91% 0.009 250); --color-paper-3: oklch(99.5% 0.005 250);
  --color-ink: oklch(16% 0.014 262); --color-ink-2: oklch(29% 0.014 262); --color-muted: oklch(47% 0.016 260);
  --color-rule: oklch(80% 0.011 250); --color-ink-rule: oklch(34% 0.014 262);
  --color-accent: oklch(51% 0.22 264); --color-accent-2: oklch(81% 0.16 82); --color-accent-ink: oklch(99.5% 0.003 250); --color-focus: oklch(51% 0.22 264);
  --font-display: "Chivo Mono", ui-monospace, monospace; --font-body: var(--font-display); --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 0 24px 40px -24px oklch(8% 0.01 260 / 0.6);
  --tracking-display: -0.03em; --display-weight: 800;
}
```

三种配色，每页设置一次并在设计记录 (`wayfind: platform`) 中注明。

| 配色 | 纸、墨、尺 |
| --- | --- |
| `platform`（默认） | 上面的块 |
| `night` | 纸张 `oklch(15% 0.012 262)`，墨水 `oklch(96% 0.005 250)`，尺子 `oklch(31% 0.014 262)`，钴提升至 `oklch(62% 0.2 264)` |
| `signal` | 纸 `oklch(51% 0.22 264)` 钴，墨白，尺 `oklch(75% 0.12 264)`；钴按钮变成墨水按钮 |

## Type · 类型

- **显示：** Chivo Mono 800，`--tracking-display`，行高 0.98，句子大小写。单声道线路很宽，因此 `h1` 的上限为 4.75rem，并且头部保持足够短，以便一眼阅读。
- **主体：** Chivo Mono 400，线高 1.55，所有部件均采用 `tabular-nums`。 Mono 是此处的材质 (waive 64)：板面设置整个页面。三种重量：400、500 和 800。
- **数字：** 分钟、站台和出口 800，`--text-display-s` 或更大（当数字是该部分的原因时）；琥珀色水墨，水墨纸本。
- **标签、表头、药丸、按钮：** Chivo Mono 500 更小 (buttons 800)，句子大小写，未跟踪；标牌可以穿透单声道和边界，但不能穿透大写字母。

## Surfaces · 表面

- 规则：`--rule-bar` 墨水边框出现在每个表面（孔、板、按钮、导航的底面、表格头部规则）； `--color-rule` 中的行分隔线 `--rule-hair`，或墨水上的 `--color-ink-rule`。
- 除药丸外，所有地方的半径均为 0。深度就是边界； `--shadow-card` 仅在浮在另一个表面上的表面下。
- 铭牌：2px 边框内的方形墨水区域（或墨水文本下的琥珀色），包含一条指令及其图形，就像标牌上包含站台编号一样。
- 戒环：`--color-paper-2`，`--color-ink` 戒环，其中数字变为琥珀色，或 `signal` 颜色中的一个钴区域；一页最多两个带。
- 照片：视线水平的网络：站台、瓷砖墙、进站的火车、通向日光的楼梯；人们只能从后面移动。方形，2px墨水边框内侧；字体从不位于图片上，而仅位于框架内的板上。标题显示车站或线路的名称。由该产品构建的手机屏幕边框采用 9:19.5 的边框，而不是绘制的边框。
- 没有纹理，没有渐变。

## Range · 范围

- **出发板作为墨带上的表格**：目的地为 500，线路为网络自己颜色的小方块，分钟为标题大小或更大的 800 琥珀色，最后一行为墨迹文本下方的琥珀色填充，2px 纸头规则。
- **作为步骤的路线：** 出路为连续的三块或四块板，每个板都有一个 2px 带边框的正方形，上面有一条指令（马车、楼梯、出口）及其图形，并由一条 2px 墨水尺连接起来，就像走廊标志一样。
- **状态为行：** 每行或服务一个全角行，其样本，其名称以 800 为单位，其结尾以 400 为单位，其状态位于右边缘；刚刚发生变化的行上有一个钴活点。
- **作为符号的数字：** 800 中的一个数字，显示尺寸位于边框板内，其单位位于其旁边，以及一个边对边连接的方形单元格站选择器，可更改它。

## Controls · 控制

- 一个钴填充按钮旁边是一个带有 `--rule-bar` 墨水边框的透明按钮，均为方形，Chivo Mono 800，句子大小写，48 至 52px。
- 选择集是共享 2px 边框的方形单元格；所选单元格将用纸质文本填充墨水。链接为墨水、下划线、悬停时钴色；输入为方形，2px 墨水边框位于 `--color-paper-3` 上。
- Cobalt 代表实时情况（当前停止、时钟、主要操作）；琥珀色仅在墨水上显示或作为墨水文本下的填充。

## Motion · 运动

出发板僵硬：`--dur-micro` 颜色在 `steps(1)` 中发生变化，行更新到位，滚动上没有显示。当一行更新时，一个活点会闪烁一次；它永远不会循环。

## Voice · 嗓音

标识：站台、出口、分钟、车厢。命令式且简短；一眼就能看懂。

## Do-nots · 不该做的事

- 任何地方都没有比例的脸，即使是散文也是如此。
- 切勿将琥珀色作为纸张上的文字颜色；它属于墨迹文本或墨迹文本下。
- 从来没有第三种明亮的颜色，除了网络自己的线路颜色作为其名称旁边的小方块。
- 切勿使用圆形卡片或卡片上的柔和阴影；寻路是有边界的。
- 从来没有一个绘制的站台、火车或车厢来代替这个地方；拍摄车站，搭建屏幕。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@400;500;800&display=swap" rel="stylesheet">
```

```css
body { font-variant-numeric: tabular-nums; }
h1, h2, h3 { font-weight: 800; line-height: 0.98; }
h1 { font-size: min(var(--text-display), 4.75rem); }
small, th, figcaption { font-weight: 500; color: var(--color-muted); }
.btn { display: inline-flex; align-items: center; gap: var(--space-xs); padding: var(--space-md) var(--space-lg); border: var(--rule-bar) solid currentColor; font: 800 var(--text-sm)/1 var(--font-body); color: inherit; transition: background-color var(--dur-micro) steps(1); }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.plate { border: var(--rule-bar) solid var(--color-ink); background: var(--color-ink); color: var(--color-paper); }
.plate .figure { font-weight: 800; color: var(--color-accent-2); }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
th { border-bottom: var(--rule-bar) solid currentColor; } td { border-bottom: var(--rule-hair) solid var(--color-rule); }
::selection { background: var(--color-accent-2); color: var(--color-ink); }
```
