---
name: Lumen
slug: lumen
genre: atmospheric
paper: dark 12.5 290
display: roman-serif Instrument Serif
accent: warm 62
posture: restrained
keywords: inference, model, llm, ai tool, agent, voice, synthesis, api, gpu, serverless, runtime, tokens, latency, open models, developer, research lab, ml platform, dev tools, premium
material: violet-black ground, near-white ink, lowercase Instrument Serif heads a step large over Geist and Geist Mono, hairline wells, a faint blueprint grid, one molten brass signal and one rose verb
photo: duotone paper ink-2
pictured: Map / Diagram, Settled hero
---

# 流明

一款带有文学声音的夜间控制台：紫黑色背景，近乎白色的墨水，乐器衬线全部采用小写，比Geist大一级，发丝井和一个熔化的黄铜信号。凉爽的黑暗，温暖的灯光：温暖被分配给黄铜和一个玫瑰动词，所以页面读起来是精心设计的，同时安静地点亮。产品就是图片。它不是霓虹暗模式、黑色球体、发光物体、紫色海报或衬线杂志。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(12.5% 0.027 290); --color-paper-2: oklch(16% 0.03 290); --color-paper-3: oklch(20% 0.032 290);
  --color-ink: oklch(96% 0.01 300); --color-ink-2: oklch(85% 0.017 298); --color-muted: oklch(69% 0.026 295);
  --color-rule: oklch(27% 0.034 290); --color-rule-2: oklch(36% 0.04 292); --rule-blueprint: oklch(96% 0.01 300 / 0.05);
  --color-accent: oklch(80% 0.15 62); --color-accent-2: oklch(72% 0.15 12); --color-accent-ink: oklch(14% 0.028 290);
  --color-live: oklch(80% 0.13 155); --color-focus: oklch(80% 0.15 62);
  --font-display: "Instrument Serif", ui-serif, Georgia, serif; --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 10px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 28px 64px -30px oklch(4% 0.02 290 / 0.8);
  --tracking-display: -0.015em; --display-weight: 400;
}
```

第二滴，`day`：`oklch(18% 0.02 290)`下的骨头`oklch(97% 0.008 290)`，带有骨头文本的靛蓝`oklch(46% 0.24 268)`信号，`oklch(56% 0.16 18)`中的动词。设计记录上注明了掉落（`lumen: night`）。

## Type · 类型

- **显示：** Instrument Serif 400，罗马字体，全部小写，`--tracking-display`，行高 0.95 至 1.02。杆面又窄又轻，因此它设置得大了一步：剖面头位于 `--text-display-s`，首屏主视觉头位于帽盖及更远处。小写是头部、导航、控件和标签的寄存器；散文保留句子大小写，以便模型名称得以保留。
- **身体：** Geist 400 和 500，只要有人物出现，`tabular-nums`。
- **标签、说明文字、表格标题：** Geist 400 更小，小写，未跟踪，`--color-muted`。
- **读数和代码：** Geist Mono 400，13px，小写，未跟踪：测量值及其单位、状态、型号 ID、代码。单声道是机器说话，而不是标签声音。
- **动词：** 页面上的一个重音单词，仅在首屏主视觉头部中，始终是一个动词，采用 `--color-accent-2` 格式，并带有 1px 下划线（戳记 `waive 38iii`）。

## Surfaces · 表面

- 细线包含：孔、行和输入上的 1px `--color-rule`，对照边缘上的 `--color-rule-2`； 10px 表面半径、控件和标签上的圆球。
- 深度是从纸到纸的亮度等级-3；必须抬起的表面在地面本身的黑暗中用它的发际线换取 `--shadow-card`。绝不会出现辉光、光环或彩色阴影。
- 波段：`--color-paper-2`，一页最多两个；没有重音字段，夜间寻呼永远不会需要骨带。
- 照片：最多一张，运行工作的机器的 21:9 区域（机架过道、布线、发光的机架面），以地面紫色、10px 半径和 1px 规则打印，标题为下面的硬件命名；没有头。
- 纹理：蓝图网格，1px `--rule-blueprint` 线，间距为 48px，位于一个孔或带内，且绝不位于运行文本下方（标记 `waive 47c`）。没有玻璃，没有模糊，没有生成的物体代替产品。

## Range · 范围

- **作为图表的路径：** 用细线节点和连接器绘制的真实系统：静音单声道中的慢速路径，黄铜中的产品路径，每个节点都是请求真正采取的步骤。
- **产品本身的表面：** 一个请求和其响应一起被细线、小写标签分开，下面的状态为 Geist Mono 读数；或全尺寸的控制台屏幕，其实时状态为 `--color-live`。
- **井中的图表：**在蓝图网格上，`--color-ink-2` 中的变量处于一半强度，该产品将其固定为黄铜线，轴为单声道。
- **数字或费率卡：** 仪器衬线中的一个测量值，显示尺寸为单色，单位为单声道，或小写头下表格数字的细线行费率。

## Controls · 控制

- 对照对：一个带有 `--color-accent-ink` 文本的实心黄铜药丸，旁边是一个 `--color-rule-2` 的细线药丸，均为小写，44 到 48px。
- 链接在悬停时带有黄铜下划线；输入位于带内的 `--color-paper`、1px `--color-rule-2`、10px 半径、黄铜聚焦环上。
- 黄铜保持在屏幕的 5% 以下：主要填充、聚焦环、链接的悬停、一行或读数。玫瑰属于动词； `--color-live` 仅处于活动状态。

## Motion · 运动

一个启示：动词的下划线在 `--dur-long` 上画一次。否则仅说明：将 `--color-paper-2` 悬停在发际线药丸上，流式传输答案输入一次。没有环境循环，没有呼吸灯，没有交错。

## Voice · 嗓音

精心设计、简单、具体：型号、状态、单位、价格。小写字母读起来就像实验室书上的笔记，一点也不可爱。没有感叹号。

## Do-nots · 不该做的事

- 绝不是绘制或生成的光：头部后面或旁边没有球体、灯、环、光环或发光物体。
- 切勿让紫罗兰色攀爬：生成的外观为紫罗兰色场或紫罗兰色到蓝色的渐变。
- 切勿给名词或第二个带重音的单词涂上颜色；一个动词，在首屏主视觉中。
- 绝不是句格标题，也绝不是普通部分大小的标题；这张脸看上去很瘦弱。
- 绝不是暖色底色或第三种暖色；黄铜和玫瑰动词承载着所有的温暖。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Geist:wght@400;500&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
body { font-variant-numeric: tabular-nums; }
h1, h2, h3, nav, label, th, figcaption, .btn { text-transform: lowercase; }
h1, h2, h3 { font-weight: 400; } h2 { font-size: var(--text-display-s); line-height: 0.98; }
.verb { display: inline-block; color: var(--color-accent-2); }
.verb::after { content: ""; display: block; height: var(--rule-hair); background: currentColor; transform-origin: left; animation: draw var(--dur-long) var(--ease-out) both; }
@keyframes draw { from { transform: scaleX(0); } }
.btn { border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-lg); font-weight: 500; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { box-shadow: inset 0 0 0 var(--rule-hair) var(--color-rule-2); color: var(--color-ink); }
.btn--secondary:hover { background: var(--color-paper-2); }
.well { background: var(--color-paper-2); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-card); }
.blueprint { background-image: linear-gradient(var(--rule-blueprint) 1px, transparent 1px), linear-gradient(90deg, var(--rule-blueprint) 1px, transparent 1px); background-size: 48px 48px; }
.readout { font: 400 0.8125rem/1.5 var(--font-outlier); color: var(--color-ink-2); }
```
