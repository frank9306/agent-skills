---
name: Kiln
slug: kiln
genre: atmospheric
paper: dark 13 40
display: high-contrast-serif Boska
accent: warm 45
posture: full-palette
keywords: kiln, ceramics, pottery, firing, glaze, heat, temperature, ceramics studio, craft, sensor, monitor, hardware, iot, warmth, dark, glow, schedule, workshop
material: near-black ground, cream ink, Boska over Geist, smoked wells, photographs lit by the work, a heat ramp that marks temperature, one ember signal
photo: warm sepia=50 sat=-12 con=8 exp=-6
pictured: Workbench, Stage hero
---

# 窑

一间黑暗的工作室，窑门打开了一条裂缝：近乎黑色的地面，奶油色墨水，博斯卡在朴素的精神上切割高对比度衬线，并且只在热的地方加热。照片带火；随着温度的升高，从灰烬到深红色、余烬和琥珀色，再到白热的渐变。一处温暖，其他地方寒冷。它不是带有橙色按钮的深色奢华页面，也不是发光的渐变海报。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(13% 0.012 40); --color-paper-2: oklch(17.5% 0.016 40); --color-paper-3: oklch(22% 0.018 40);
  --color-ink: oklch(94% 0.02 80); --color-ink-2: oklch(84% 0.025 70); --color-muted: oklch(72% 0.03 60);
  --color-rule: oklch(96% 0.01 80 / 0.12);
  --color-accent: oklch(70% 0.2 45); --color-accent-ink: oklch(14% 0.02 40); --color-focus: oklch(76% 0.19 56);
  --heat-0: oklch(12% 0.012 40); --heat-1: oklch(22% 0.07 22); --heat-2: oklch(40% 0.16 27); --heat-3: oklch(60% 0.21 36);
  --heat-4: oklch(76% 0.19 56); --heat-5: oklch(89% 0.14 78); --heat-6: oklch(98% 0.04 95);
  --font-display: "Boska", "Iowan Old Style", Georgia, serif; --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 28px; --radius-well: 16px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 50px 90px -30px oklch(8% 0.01 40 / 0.5);
  --tracking-display: -0.02em; --display-weight: 500;
}
```

设计记录 (`kiln: ember`) 中注明了三种配色。

| 配色 | 底色、墨色、口音 |
| --- | --- |
| `ember`（默认） | 上面的块 |
| `bisque` | 地面 `oklch(96.5% 0.014 80)`，墨水 `oklch(20% 0.02 40)`，重音 `oklch(54% 0.17 62)`，以地面作为文字；坡道起始于 `oklch(90% 0.035 75)`；井转骨 |
| `reduction` | 地面 `oklch(21% 0.06 22)`，墨水 `oklch(95% 0.02 85)`，重音 `oklch(84% 0.12 62)`；坡道从地面开始 |

## Type · 类型

- **显示：** Boska 500，`--tracking-display`，行高1.04，句首字母大写，罗马，每个头一种颜色；其中设置的语句可能会运行到行高 1.0 处的 `--text-display`。
- **数字：** 温度、烧制时间或承载故事的价格是 Boska 500，衬里和表格，位于 -0.03em，其单位（°C、h、£）位于同一面；一个孤独的人可能会跑两倍于首屏主视觉的头。
- **主体：** Geist 400 和 500，16 至 18px，线高 1.55。
- **标签、标题、轴刻度、表头：** Geist 500 更小，句子大小写，未跟踪，在 `--color-muted` 中。 Geist Mono 仅限内部代码。

## Surfaces · 表面

- 1px `--color-rule` 行之间、井边缘和图表网格上；没有比这更明智的规则了。
- 照片和内置屏幕上的半径 28px，随视口缩小； `--radius-well` 在井和输入上；对照药丸。
- 井熏：`--color-paper-2` 清晰的台阶高于地面，1px 规则边缘，无阴影，永不模糊，永不嵌套。 `--shadow-card`，深低落，仅在地面上的内置屏幕或照片下，从不带有戒指。
- 热量只标记温度，没有其他任何东西：坡度逐步对点火曲线进行着色，每个度数带都有自己的颜色，从低到峰值的紫红色热量，以及范围轨迹（三个停止）。它永远不会填满盒子、带子、插槽或地面，上面也没有文字。
- 条带：一条`--color-paper-2`条带，一页最多两条。
- 照片：作品，近距离且在弱光下：处于温度的窑炉、装载的窑炉、釉料、架子上的罐子、粘土中的手、被窑炉照亮、台灯或窗户、落入地面的阴影。 28px 框架，带有 1px 奶油色镶嵌环，浓度为 8%；打字仅位于其深色一侧，覆盖在 40% 至 65% 的稀松布纸上。

## Range · 范围

- 行的发射时间表：Boska 数字中每个部分的速率和目标，由其目标达到的斜坡步骤的短条键控。
- 作为声明设置的读数或警告：Boska 位于 `--text-display`，横跨十根柱子，地面上有奶油，Geist 中的小时和旁边的窑炉；屏幕上没有其他内容。
- 作为全宽表的日志：Geist 中的日期、点火和锥体，Boska 中的峰值（关键是其斜坡步骤），`--color-ink-2` 中每行的整个曲线的迷你图。
- 烟熏带上的价格或温度，以及旁边的动作。

## Controls · 控制

- 这对：一个灰烬药丸 (`--color-accent` with `--color-accent-ink` text, Geist 500)，50px 高，旁边是一个幽灵药丸，上面有 1px 插图 `--color-rule` 环和奶油色文字。
- 输入为 16px 半径处的熏制井；范围输入运行 2px 轨道，沿着 28px ember 拇指下方的斜坡填充。
- Ember 只是填充：主要的、拇指的、曲线上的活动点、`--color-focus` 中的聚焦环。每个字母都保持奶油色。

## Motion · 运动

缓慢且热：颜色变化在 `--ease-out` 上运行 `--dur-long`，控制响应在 `--dur-short` 上。悬停时没有任何脉冲、闪烁或发光。

## Voice · 嗓音

用陶艺家的话来说，是平静和体力：锥体、度数、时间、负载。说出射击的名称，而不是感觉。

## Do-nots · 不该做的事

- 切勿将坡道作为填充：文本后面、地面上、槽中或跨带上没有热梯度。
- 绝不是橙色型；余烬是填充物，每个字母都保持奶油色。
- 切勿使用棕色或暖光地面；它保持接近黑色，因此热量可以从某个地方升起。
- 绝不是明亮的平光照片或白色无缝花盆。
- 除了坡道之外，绝不要有第三种色调。
- 绝不是每个屏幕上都出现一张照片：火焰也存在于曲线和人物中。

## Build hint · 构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=boska@500&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1.04; }
.btn { display: inline-flex; align-items: center; min-height: 50px; padding: 0 var(--space-lg); border-radius: var(--radius-pill); font-weight: 500; transition: background-color var(--dur-short) var(--ease-out); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--ghost { background: transparent; color: var(--color-ink); box-shadow: inset 0 0 0 var(--rule-hair) var(--color-rule); }
.well { background: var(--color-paper-2); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-well); }
.figure { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: -0.03em; font-variant-numeric: lining-nums tabular-nums; }
.photo { border-radius: min(2vw, var(--radius-card)); outline: var(--rule-hair) solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
.scrim { background: linear-gradient(to top, color-mix(in oklab, var(--color-paper) 65%, transparent), transparent 55%); }
.range-track { background: linear-gradient(to right, var(--heat-2), var(--heat-4), var(--heat-6)); }
::selection { background: color-mix(in oklab, var(--color-accent) 35%, transparent); }
```
