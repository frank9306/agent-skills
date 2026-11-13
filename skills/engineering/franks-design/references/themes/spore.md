---
name: Spore
slug: spore
genre: atmospheric
paper: dark 15 60
display: roman-serif Young Serif
accent: warm 30
posture: committed
keywords: grower, mushroom, fungi, farm, food, producer, fermentation, wine, natural wine, wine bar, bottle shop, cellar, preserves, dark, culture, night market, harvest, subscription, small batch
material: coffee-ground black with a warm grain, parchment ink, Young Serif over Instrument Sans, soft pills and grained wells, photographs lit by lamps and candles, one oyster pink
photo: warm con=6 exp=-4
pictured: Photographic, Stage hero
---

# 孢子

夜晚的地窖：黑色咖啡粉逐渐转为棕色，咖啡井上有温暖的谷物，文书 Sans 上的 Young Serif 羊皮纸，软药丸，仅在灯和蜡烛照明下的照片，还有一张牡蛎蘑菇粉红色。它感觉很亲密，是手工制作的，因为温暖存在于大地、纹理、人物和一种柔和的颜色中，而不是在光线的照射下。它不是带有发光的暗模式模板，也不是健康标签。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(15% 0.012 60); --color-paper-2: oklch(19% 0.014 58); --color-paper-3: oklch(24% 0.02 50);
  --color-ink: oklch(93% 0.022 85); --color-ink-2: oklch(84% 0.022 78); --color-muted: oklch(67% 0.02 70);
  --color-rule: oklch(31% 0.016 60);
  --color-accent: oklch(77% 0.09 30); --color-accent-2: oklch(86% 0.06 30); --color-accent-ink: oklch(15% 0.012 60); --color-focus: oklch(86% 0.06 30);
  --font-display: "Young Serif", Georgia, serif; --font-body: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 14px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 16px 40px oklch(8% 0.01 60 / 0.4);
  --tracking-display: -0.012em;
  --grain: 0.15; --display-weight: 400;
}
```

一枚表盘、配色，在设计记录 (`spore: cellar`) 中注明。

| 配色 | 地面 | 墨水 | 口音 |
| --- | --- | --- | --- |
| `cellar`（默认） | `oklch(15% 0.012 60)`，谷物筛选 15% | 羊皮纸 `oklch(93% 0.022 85)` | 粉色`oklch(77% 0.09 30)` |
| `lab` | 奶油 `oklch(94% 0.02 85)`，颗粒倍增 6% | `oklch(17% 0.015 60)` | 粉色`oklch(62% 0.13 30)` |
| `head-torch` | `oklch(12% 0.008 60)`，谷物含量为 15% | `oklch(93% 0.03 85)` | 赭色 `oklch(74% 0.13 80)` |

## Type · 类型

- **显示：** Young Serif 400，`--tracking-display`，行高 1.02，句首字母大写，罗马字体，每个头一种颜色。它的一个重量是声音：层次结构来自于大小，而不是来自粗体。
- **数字：** 价格、天数、小时数和计数均为年轻衬线、衬里，当一个数字是该部分的原因时，可能会超过 `--text-display`；价格是粉红色的一数字。
- **主体：** Instrument Sans 400 和 500，行高 1.55，采用 `--color-ink-2`。产品名称（葡萄、年份、拉丁名称）之后的第二个名称是 Instrument Sans italic，这是一个异常值，也是唯一一个斜体。
- **标签、标题、表格标题：** Instrument Sans 500 更小，句子大小写，`--color-muted`。

## Surfaces · 表面

- 1px `--color-rule` 行间；字段上有 1.5px `--color-ink-2` 边缘。其他一切都没有边界。
- Radii：对照和芯片上的药丸，孔和照片上的 `--radius-card`；输入平方。
- 深度是地面的三个台阶：纸、`--color-paper-2` 纹理井、`--color-paper-3` 带。现在正在运行的州（今晚，选定的行）迈出了一步，拿走了一颗粉红色的筹码。 `--shadow-card` 仅在与照片重叠的井下。
- 照片：天黑后的地方，近处：架子、倒水器、烛光柜台、玻璃杯；低暖光进入阴影，切勿闪光或日光。 `--radius-card`，1px 墨环为 8%；打字时，其深色面位于稀松布纸上，比例为 45% 至 65%。
- 颗粒：`texture.md` § 1 的斑点颗粒，在 `--grain` 处筛选，仅在孔和条带上；切勿在列中或照片上运行文本。

## Range · 范围

- **一个数字作为部分：** 以幼衬线字体表示的计数或价格，在粒纹井上为 `--text-display` 的两到四倍，下面是普通标签，旁边有两行或三行细线说明了数字的含义。
- **以周为时间表：** `--text-title` 的 Young Serif 中的一排日期名称，旁边的时间，休息日降至静音，今晚的排以粉红色芯片上升为纸 3；在它们旁边的第 1 至 4 列上有一个头块。
- **列表或价目表：**用小衬线体显示名称，用斜体显示第二个名称，用粉红色显示价格；设置三到五根柱子深，它看起来就像架子。
- **一条带有颗粒形状的带子：**带有斑点颗粒的纸-3，价格在方形字段和粉红色药丸旁边为粉红色大号；或者在 `--text-display` 处的 Young Serif 中的十列声明。

## Controls · 控制

- 这对：一个粉红色填充的药丸，上面有 `--color-accent-ink` 文字，悬停时会亮起 `--color-accent-2`，旁边是一个以 1.5px `--color-ink-2` 轮廓显示的药丸。薯片是药丸；所选择的填充为粉红色。
- 链接是带有下划线的羊皮纸，悬停时会变成粉红色；输入与 1.5px 边缘和 `--color-focus` 环呈方形。

## Motion · 运动

仅说明，在一帧中：一个芯片选择，一行提升，一个药丸变亮。没有任何东西显露出来，没有任何东西生长，没有任何东西循环。

## Voice · 嗓音

制造商日志：名称、日期、时间、年份、价格。没有健康，没有神秘，没有“策划”。

## Do-nots · 不该做的事

- 绝不会有第二种色调；表示“库存”的绿色构成了花园中心。
- 从来没有把光画成心情（光束、水池、头后的光芒）；光存在于照片中。
- 切勿使用中性或蓝黑色接地；每个深色步骤都会向色调 60 着色。
- 切勿使用粉红色的运行文本或粉红色的轮廓；粉色是填充、价格或焦点。
- 切勿一张接一张地拍照；两张图片之间是一个数字、一个时间表或一个Young Serif 的列表。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: 400; letter-spacing: var(--tracking-display); line-height: 1.02; }
.btn { border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-lg); font-weight: 600; transition: background-color var(--dur-micro) var(--ease-out); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-2); }
.btn--secondary { background: transparent; color: var(--color-ink); box-shadow: inset 0 0 0 1.5px var(--color-ink-2); }
.well { background: var(--color-paper-2); border-radius: var(--radius-card); }
.figure { font-family: var(--font-display); font-variant-numeric: lining-nums; line-height: 0.86; }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; z-index: var(--z-base); border-radius: inherit; pointer-events: none; opacity: var(--grain); mix-blend-mode: screen;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.55 0 0 0 0 0.45 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); }
```
