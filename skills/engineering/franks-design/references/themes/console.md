---
name: Console
slug: console
genre: modern-minimal
paper: dark 17 250
display: grotesk-sans Host Grotesk
accent: chromatic-amber 80
posture: restrained
keywords: lab, laboratory, protocol, experiment, notebook, science, research, observability, monitoring, version control, audit, compliance, instruments, data, devtools, engineering, telemetry, record, operations, dark, developer
material: graphite ground in three lightness steps, pale ink, hairline panels cut from one surface, Host Grotesk 500 for reading, Atkinson Hyperlegible Mono for what was measured, amber for a person and cool blue for an instrument
photo: duotone paper-3 ink
pictured: Audit Trail, Stage hero
---

# 安慰

这是一件由细心的人保管的乐器：石墨地面分为三种亮度，从一个表面切割出细线面板，Host Grotesk 代表人阅读的内容，Atkinson Hyperlegible Mono 代表仪器测量的内容，琥珀色代表人，冷蓝色代表乐器。地面是中性的，因此两种含义在其上的重量相等，并且没有任何东西发光。它不是霓虹灯终端、玻璃仪表板或科幻小说中的控制室。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(17% 0.008 250); --color-paper-2: oklch(21% 0.009 250); --color-paper-3: oklch(13.5% 0.007 250);
  --color-ink: oklch(95% 0.005 250); --color-ink-2: oklch(83% 0.008 250); --color-muted: oklch(71% 0.01 250);
  --color-rule: oklch(31% 0.01 250); --color-rule-2: oklch(42% 0.012 250);
  --color-accent: oklch(82% 0.15 80); --color-accent-ink: oklch(18% 0.04 75); --color-accent-soft: oklch(29% 0.05 80); --color-focus: oklch(82% 0.15 80);
  --color-cool: oklch(77% 0.12 245); --color-cool-soft: oklch(29% 0.05 245);
  --color-ok: oklch(76% 0.15 150); --color-ok-soft: oklch(24.5% 0.03 150); --color-bad: oklch(70% 0.17 25); --color-bad-soft: oklch(24.5% 0.035 25);
  --font-display: "Host Grotesk", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: "Atkinson Hyperlegible Mono", ui-monospace, monospace;
  --radius-card: 10px; --radius-pill: 6px; --rule-hair: 1px;
  --shadow-card: none;
  --tracking-display: -0.03em; --display-weight: 500;
}
```

一枚表盘，颜色设计，在设计记录（`console: graphite`）中注明：`graphite`，上面的标记； `paper`、磨色oklch(98% 0.006 85)下墨色oklch(19% 0.010 60)、琥珀色oklch(54% 0.14 70)和冷色oklch(52% 0.14 250)，纸带转向灯； `amber-room`，在墨水 oklch(95% 0.012 85) 下磨碎 oklch(15% 0.022 70)，琥珀色 oklch(82% 0.15 82)，冷却后变成冰 oklch(82% 0.08 200)。在每种颜色中，琥珀色代表一个人，而冷色代表一种乐器。

## Type · 类型

- **显示：** 主机 Grotesk 500，`--tracking-display`，行高 1.02 至 1.05，句首字母大写，罗马；尺寸平静，绝不是700。
- **主体：** 主机 Grotesk 400 位于 17px 的 16 处，行高 1.55，位于 `--color-muted` 中； `--color-ink-2` 中的 lede。
- **标签、标题、表头、芯片：** 主机 Grotesk 500 更小，句子大小写，在 `--color-muted` 中。
- **测量：** Atkinson Hyperlegible Mono 400 和 500 在 14 至 15px 上测量仪器或系统写入的内容：带有单位的读数、ID、差异、时间戳、每个数字表格。它的斜线零和尾部一是重点；在显示尺寸下，它是主题中最响亮的东西。绝不是标签、头部或控件。

## Surfaces · 表面

- 发丝板：表面为1px `--color-rule`，内部为`--color-paper-2`，半径为10px (6px on controls)。坐在一起的面板是按 1px 规则划分的一个表面； `--color-rule-2` 标记选定的行或路径的主干。
- 三级台阶，没有灯：地面，向上一级的面板，最深的台阶用于代码、日志、更改的行和照片。没有阴影、辉光、光晕或聚光灯。
- 戒环：`--color-paper-3` 或 `--color-paper-2` 戒环，绝不是琥珀色区域；一页最多两页。
- 照片：一张或两张长凳的照片，没有一张脸（戴着手套的手拿着移液器，一排试管），黑暗而封闭，从最深处到墨水的黑白，半径 10px，1px 尺边缘，下面有标题。
- 表面上没有纹理，没有渐变。

## Range · 范围

- **差异：**在一个面板中设置为两个版本的比较，好的和坏的加号和减号的页边距，柔和色调上更改的行，旁边的人的话中的原因。
- **读数：** 被测面显示尺寸的单个值，其上方的敲击值，以及下方的琥珀色、冷色和墨水色的人物、时间和原因；对记录作出的声明。
- **线索：** 1px `--color-rule-2` 书脊上的行作为审计线索，每个条目一个版本，一个琥珀中的人，一个凉爽的时间，一个墨水中的原因；时间表或变更日志的读取方式相同。
- **面板：** 一张便当或从一个表面切割而成的带有 1px 接缝的比较，一个面板作为引线，每个面板都以完全保真度保存产品而不是它的图片。

## Controls · 控制

- 这对：`--color-accent-ink` 的琥珀色填充，`--color-paper-2` 上的 1px `--color-rule-2` 轮廓旁边，两者都位于 6px，主机 Grotesk 500。
- 芯片仅携带状态：4px半径处的1px规则内的标签面，根据含义着色`--color-accent-soft`或`--color-cool-soft`。版本选择器是一排这样的芯片，所选的一对是冷色调的。输入位于 6px 的 1px 规则内的 `--color-paper-3` 上； `--color-rule-2` 中的链接带有下划线，悬停时变为琥珀色。
- 两层含义：琥珀色是一个人（一个操作员、一个偏差、当前步骤、一个主要控制者）； Cool 是一种工具（读数、跟踪、版本）。好的和坏的仅存在于差异和状态。

## Motion · 运动

当其源发生变化时，值会发生变化，通过 `--ease-out` 上的 `--dur-short`；图表可以绘制一次。无显示、视差或悬停升降。

## Voice · 嗓音

一个细心的人保存的实验室笔记本：数值、单位、时间、签名者。没有单位或时间的数字什么也不是。

## Do-nots · 不该做的事

- 切勿互换含义；琥珀色的读数或冷静的偏差是主题所在。
- 绝不是下面有阴影的浮动卡。
- 切勿使用第三个信号或彩色照片。
- 切勿在标签、头部或按钮上使用单色；单声道是乐器所写的。
- 绝不是只有一页小面板；一页中的一个值或一条记录设置得较大。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400;500&family=Atkinson+Hyperlegible+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: 500; letter-spacing: var(--tracking-display); line-height: 1.04; }
.panels { display: grid; gap: var(--rule-hair); background: var(--color-rule); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-card); overflow: hidden; }
.panels > * { background: var(--color-paper-2); }
.measured { font-family: var(--font-outlier); font-size: var(--text-sm); font-variant-numeric: tabular-nums slashed-zero; }
.reading { font-family: var(--font-outlier); font-size: var(--text-display); font-weight: 400; letter-spacing: -0.04em; line-height: 1; color: var(--color-ink); }
.row--minus { background: var(--color-bad-soft); } .row--plus { background: var(--color-ok-soft); }
.btn { border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-md); background: var(--color-paper-2); color: var(--color-ink); font-weight: 500; transition: background-color var(--dur-short) var(--ease-out); }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
::selection { background: color-mix(in oklab, var(--color-accent) 25%, transparent); }
```
