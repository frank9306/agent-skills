---
name: Rim
slug: rim
genre: modern-minimal
paper: dark 9 75
display: grotesk-sans Switzer
accent: warm 45
posture: committed
keywords: space, satellite, earth observation, orbit, imagery, ground station, telemetry, hardware, schedule, utc, infrastructure, mission, sensor, monitoring, instrument, night, dark, measured
material: warm black paper, warm off-white ink, Switzer 500 with Geist Mono for every measurement, square hairline surfaces, the earth photographed straight down, an orange signal and a sky-blue second
photo: natural sat=-20 con=10
pictured: Map / Diagram, Ledge hero
---

# 轮缘

夜晚的仪器：温暖的黑纸，温暖的灰白色墨水，Switzer 的每个头都为中等重量，Geist Mono 适合每个测量某物的数字，被细线分开的方形表面，橙色信号和天蓝色秒针，地球以仪器从正上方看到的方式显示。它读起来很精确，因为每条边都很硬，每次都有它的区域。它不是充满星光和光环的发光科幻页面，也不是霓虹灯仪表板。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(9% 0.008 75); --color-paper-2: oklch(12.5% 0.009 75); --color-paper-3: oklch(6.5% 0.007 75);
  --color-ink: oklch(94% 0.010 80); --color-ink-2: oklch(84% 0.011 80); --color-muted: oklch(68% 0.012 80); --color-muted-2: oklch(50% 0.010 80);
  --color-rule: oklch(25% 0.010 78); --color-rule-2: oklch(16% 0.009 78);
  --color-accent: oklch(72% 0.17 45); --color-accent-ink: oklch(10% 0.02 45); --color-accent-2: oklch(74% 0.12 250); --color-focus: oklch(78% 0.15 45);
  --font-display: "Switzer", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.04em; --display-weight: 500;
}
```

设计记录上注明了两种深色配色：`rim: night`（上面的块）或 `rim: station`（海军蓝 `oklch(19% 0.055 262)`，规则 `oklch(32% 0.060 262)`，信号交换为冰色 `oklch(84% 0.10 200)` 和琥珀色 `oklch(76% 0.14 55)`）。

## Type · 类型

- **显示：** Switzer 500，首屏主视觉头上有 `--tracking-display`，节头上有 -0.03em，行高 1.02，句首字母大写，罗马字体。中等，从不粗体；每个头一种颜色。
- **主体：** Switzer 400，位于 16 至 17px，行高 1.55，位于 `--color-ink-2`； `--color-muted` 中的标签、标题和表格标题小了 500 步，句子大小写，未跟踪，从不单声道。
- **测量（单声道作为材料）：** Geist Mono 400，表格，每个时间、坐标、面积、价格和持续时间。时间总是带有它的时区，默认为 UTC。测量值是 `--text-display-s` 到 `--text-display` 处的点集 -0.03em，其单位或区域为 `--color-muted` 中大小的一半。 Mono 从不设置标题、标签或段落。

## Surfaces · 表面

- 细线进行划分：1px `--color-rule` 每个切片头上方、孔周围和表头下方； `--color-rule-2` 上的行。
- 所有物体的半径为零；页面上没有任何东西是圆形的。仅以轻求深：`--color-paper-2` 提升一口井，`--color-paper-3` 沉一口。没有阴影、玻璃、模糊或光晕。
- 一口井或一张照片的边框可能会下降两个 12px 角刻度，1px L 形状在 `--color-muted` 的对角处，设置在框架之外。
- 表带：`--color-paper-2` 或 `--color-paper-3`，边缘有细纹；一页最多两个，从来没有光带。
- 照片：按照捕捉到的比例直视地球：田野、海岸线、屋顶、河口，边缘到边缘清晰，没有地平线，没有天空，也没有行星。正方形，1px 插入墨水环，浓度为 8%。它的测量（地点、通行证、交付）沿着 `--color-paper` 的一条带子，78% 沿着它的脚，在 Geist Mono 与该区域。

## Range · 范围

- **以数字表示的测量：** Geist Mono 中的两到四个实际数量，以十二列的显示尺寸显示，由垂直细线分隔，单位半尺寸处于静音状态：范围、窗口、价格。
- **实时图：** 带有刻度线的水平 UTC 轴，窗口为 10px 天蓝色带，每个事件在其信号中都有一个 1px 引脚，旁边为单声道时间；系统的图表，绝不是装饰。
- **构建的产品：** `--color-paper-2` 上的订单或队列，带有角刻度，单声道字段，`--color-paper-3` 上的选定行带有橙色方块。
- **规则行和形式优先关闭：**细线行，左侧有瑞士标题，右侧有线条； paper-2 上的表格，其值以单声道形式输入。

## Controls · 控制

- 这对：一个方形橙色填充主色，带有 `--color-accent-ink` 文字，旁边是一个方形副色，轮廓为 1px `--color-rule`，均为 Switzer 500。
- 链接为墨迹，悬停时带有下划线；在 `--color-paper` 上输入带有 1px `--color-muted` 边框的正方形，该值测量在 Geist Mono 中键入的值。
- 橙色标记动作和当前状态，天蓝色标记第二个状态或窗口；没有其他东西是有颜色的。

## Motion · 运动

稳定准确：`--ease-out`上`--dur-short`状态变化；实时时间每分钟滴答一次。没有任何脉冲、循环或揭示。

## Voice · 嗓音

测量且准确：地点、通行证、UTC 时间、平方公里面积。难怪，无国界。

## Do-nots · 不该做的事

- 没有任何圆形的东西：没有药丸，没有头像圆圈，没有圆形按钮或框架。
- 从来没有闲暇时间； `09:30`无区是主题说谎。
- 绝不大胆展示； Switzer 500 是天花板，黑色起到重量作用。
- 从来没有来自太空、星空、光芒或环绕地球的轨道的行星。

## Build hint · 构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1.02; }
h2 { letter-spacing: -0.03em; }
.measure { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; }
.btn { border-radius: 0; padding: var(--space-sm) var(--space-md); border: var(--rule-hair) solid var(--color-rule); background: none; color: var(--color-ink); font-weight: 500; }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.well { position: relative; background: var(--color-paper-2); }
.photo { outline: var(--rule-hair) solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
.ticks::before, .ticks::after { content: ""; position: absolute; width: 12px; height: 12px; border: 0 solid var(--color-muted); pointer-events: none; z-index: var(--z-raised); }
.ticks::before { top: calc(-1 * var(--space-xs)); left: calc(-1 * var(--space-xs)); border-width: 1px 0 0 1px; }
.ticks::after { right: calc(-1 * var(--space-xs)); bottom: calc(-1 * var(--space-xs)); border-width: 0 1px 1px 0; }
::selection { background: color-mix(in oklab, var(--color-accent) 35%, transparent); color: var(--color-ink); }
```
