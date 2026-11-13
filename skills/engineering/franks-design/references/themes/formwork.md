---
name: Formwork
slug: formwork
genre: editorial
paper: mid 74 80
display: display-condensed Oswald
accent: warm 38
posture: restrained
keywords: construction, concrete, skatepark, contractor, civil, landscape, foundry, industrial, fabrication, workshop, engineering, cast, welded, builders, hardware, tools, site, heavy
material: warm grey concrete paper with a speck grain, near-black ink, Oswald capitals over Archivo, square cast edges and hard shadows, hard black-and-white photographs of poured concrete, one safety orange signal
photo: natural sat=-100 con=35 exp=8
pictured: Site Board, Poster hero
---

# 模板

现场办公室的声音：纸张采用暖灰色混凝土，近乎黑色的墨水，Archivo 上的 Oswald 700 大写字母，方形铸造边缘，硬阴影和一个安全橙色。它感觉沉重而精确，因为表面是浇筑的，每个边缘都是直的，照片以黑白显示混凝土本身，所以橙色是页面上唯一的颜色。它不是黑黄相间的危险页面，也不是光鲜亮丽的架构组合。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(74% 0.008 80); --color-paper-2: oklch(69% 0.009 80); --color-paper-3: oklch(64% 0.01 80);
  --color-plate: oklch(82% 0.007 80); --color-plate-ink: oklch(95% 0.006 80);
  --color-ink: oklch(18% 0.005 270); --color-ink-2: oklch(28% 0.006 80); --color-muted: oklch(31.5% 0.008 80);
  --color-rule: oklch(64% 0.01 80);
  --color-accent: oklch(66% 0.21 38); --color-accent-ink: oklch(18% 0.005 270); --color-focus: oklch(42% 0.15 38);
  --color-accent-deep: oklch(48% 0.17 38);
  --texture-opacity: 0.05;
  --font-display: "Oswald", ui-sans-serif, sans-serif; --font-body: "Archivo", ui-sans-serif, sans-serif;
  --font-outlier: "Archivo Narrow", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 3px;
  --shadow-card: 6px 6px 0 var(--color-ink);
  --tracking-display: -0.005em; --display-weight: 700;
}
```

三次浇注，在设计记录 (`formwork: cast`) 中注明。静音仅位于纸上和纸上 2；在任何较暗的东西上，文字都是墨水。

| 倒 | 墙与墨 | 橙子 |
| --- | --- | --- |
| **演员表**（默认） | 近乎黑色的混凝土 `oklch(74% 0.008 80)`，纹理在其上倍增 | `oklch(66% 0.21 38)` |
| **夜间倾倒** | `oklch(27% 0.006 270)` 下的 `oklch(95% 0.006 80)`，谷物筛选 | `oklch(70% 0.21 40)` |
| **绘画** | 描图纸 `oklch(95% 0.012 85)` 蓝黑色墨水 `oklch(22% 0.02 260)`，无颗粒 | 红色`oklch(58% 0.21 30)` |

## Type · 类型

- **显示：** Oswald 700，大写，`--tracking-display`，罗马； line-height 1.0 到 1.05 (55a)，仅在无法换行的行上为 0.9。每个头一种颜色。浓缩后，一个科长向上一级（`--text-display-s`及以上），一个孤独的人物可能会跑到20rem。
- **主体：** Archivo 400 和 500，16 至 17px，行高 1.5，采用 `--color-ink-2`。
- **数字（异常值）：** Archivo Narrow 500，表格，句子大小写，用于测量和计数：以毫米为单位的半径、深度、一周、公园的数量。
- **标签、标题、表格标题、元：** Archivo 500 更小，句子大小写，未跟踪。页面上没有单声道。

## Surfaces · 表面

- 规则：`--rule-bar` 以墨水形式横跨部分或表格的顶部，`--rule-hair` 以 `--color-paper-3` 形式在行之间。
- 所有物体的半径为 0；混凝土是在直板上浇筑的。
- 深度是铸成的，绝不柔软：版材是`--color-plate`，带有`--rule-bar`墨水边框和硬`--shadow-card`墨水，一页或两页；没有什么是模糊的。
- 条带：`--color-paper-2`（颜色较深）或带有 `--color-paper` 文字的 `--color-ink` 条带；从来没有橙色的田地。一页最多两页。
- 照片：在强光下近距离工作的混凝土：碗从甲板上的过渡、带有木板标记的墙壁、顶盖和边缘、浇注和漂浮、后面或远处的滑冰者。坚硬的黑白，白色干净，黑色深沉（`photo:` 系列），因此图片从灰纸上脱颖而出，橙色仍然是唯一的颜色。 2px 墨框呈正方形，无阴影；标签样式下方的标题；仅在照片边缘的墨水粗布上打字。
- 纹理、纹路：`texture.md`§1横跨整张纸在`--texture-opacity` (0.05, so it may sit under running text)处，相乘，过筛上夜倒；这就是这篇论文读起来像是演员的原因。

## Range · 范围

- **作为盘子铸造的人物：**提示是 Oswald 中的一个真实计数，位于盘子上的 14 到 20rem，旁边有硬阴影、其单位以及 Archivo 中的计数。
- **作为浇注顺序的步骤：** `--rule-bar` 下十二列中的三或四个阶段，每个阶段在 `--text-display-s` 处有一个奥斯瓦尔德数字，一个单字阶段和一条普通线，垂直于 `--color-paper-3` 之间。
- **作为两个盘子进行比较：** 两个观众或两个并排的工作，每个盘子的行都在发际线上；橙色仅针对一个动作。
- **关于墨带的说明：** `--color-ink` 上显示尺寸为 `--color-plate-ink` 的一行 Oswald 大写字母，经过颗粒筛选。

## Controls · 控制

- 这对：橙色主色在 `--color-accent-deep` 中的硬 `0 3px 0` 阴影上凸起，将 3px 压在 `:active` 上，旁边是压入的辅助 (`inset 0 2px 3px`, a 2px ink border)。均位于奥斯瓦尔德 700 个首都，未追踪，遵循显示；单选标签是标签，Archivo 句子大小写。
- 链接为墨迹、下划线、悬停时为橙色；输入像次级一样被压入。
- 橙色保持在屏幕的 5% 以下：主要的、一个图形、对焦环。

## Motion · 运动

混凝土不动。一个控件压入 `--dur-micro` 上的 `--ease-out` 上；立即国有土地。卷轴上没有任何内容，周围也没有任何内容。

## Voice · 嗓音

工头的简单谈话：倒了什么、在哪里、为谁以及何时打开。短线，每个数字都有其单位。

## Do-nots · 不该做的事

- 绝不是圆角、模糊的阴影或第二重音；硬阴影和橙色是材质。
- 切勿拉扯混凝土（板缝、系孔、裂缝、危险条纹）；给它拍照。
- 橙色旁边不要有彩色照片；图片以黑白打印。
- 切勿使用小写或较轻的 Oswald；是700个首都。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Archivo:wght@400;500&family=Archivo+Narrow:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 700; text-transform: uppercase; }
.btn { border-radius: 0; padding: var(--space-sm) var(--space-xl); font: 700 var(--text-sm)/1.6 var(--font-display); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); box-shadow: 0 3px 0 var(--color-accent-deep);
  transition: translate var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
.btn--primary:active { translate: 0 3px; box-shadow: 0 0 0 var(--color-accent-deep); }
.btn--secondary { background: var(--color-paper-2); color: var(--color-ink); border: 2px solid var(--color-ink); box-shadow: inset 0 2px 3px color-mix(in oklab, var(--color-ink) 30%, transparent); }
.card { background: var(--color-plate); border: var(--rule-bar) solid var(--color-ink); box-shadow: var(--shadow-card); }
.photo img { outline: 2px solid var(--color-ink); outline-offset: -2px; }
.band--cast { position: relative; isolation: isolate; background: var(--color-paper-2); }
::selection { background: color-mix(in oklab, var(--color-accent) 35%, transparent); }
```
