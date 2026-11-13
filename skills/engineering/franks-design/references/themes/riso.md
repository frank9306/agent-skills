---
name: Riso
slug: riso
genre: editorial
paper: light 97 90
display: grotesk-heavy Cabinet Grotesk
accent: chromatic-pink 356
posture: committed
keywords: risograph, riso, print studio, print fair, zine, small press, poster, art book, spot colour, two colour, indie press, diy, handmade, prints, open studio
material: bright uncoated stock and no black, a medium blue drum for every word, a fluorescent pink drum for the fills, purple where they cross, Cabinet Grotesk 800 over Literata, grain, one word a hair out of register
photo: duotone ink paper-2 con=14
pictured: Job Sheet, Stage hero
---

# 里索

一个小型印刷机由两个鼓组成，没有其他任何东西：明亮的无涂层纸，一个中等蓝色的鼓，用于设置每个单词，一个荧光粉红色的鼓用于填充，交叉在一个紫色的无人混合的鼓中。内阁 Grotesk 800 头掠过文学体，墨水跳跃的纹理，一个字一根毫毛不对齐。它看起来是手工制作的，因为缺陷在于墨水，而不是胶带和涂鸦。它不是干净的矢量平面，不是霓虹灯杂志，也不是黑色。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(97% 0.011 90); --color-paper-2: oklch(93.5% 0.034 356); --color-paper-3: oklch(84% 0.11 356);
  --color-ink: oklch(40% 0.165 265); --color-ink-2: oklch(45% 0.15 265); --color-muted: oklch(50% 0.115 265);
  --color-rule: oklch(85% 0.045 265);
  --color-accent: oklch(68% 0.235 356); --color-accent-ink: oklch(27% 0.13 265); --color-focus: oklch(44% 0.2 265);
  --font-display: "Cabinet Grotesk", ui-sans-serif, sans-serif; --font-body: "Literata", ui-serif, Georgia, serif;
  --radius-card: 2px; --radius-pill: 2px; --rule-hair: 1px;
  --shadow-card: none; --texture-opacity: 0.08;
  --tracking-display: -0.025em; --display-weight: 800;
}
```

## Type · 类型

- **显示：** 机柜 Grotesk 800，`--tracking-display`，句子大小写，蓝色； `h1` 领先 0.92，`h2` 0.98。头部只有一种重量和一种颜色。其中提供的数字是表格形式的。
- **错误注册的单词**（设计记录`waive 38iii`）：两个鼓中首屏主视觉头像中的一个焦点单词，蓝色后面的粉红色副本向下和向右轻推2到3px，因此只有其边缘显示(`texture.md` § 3)。一页一次。
- **主体和 LED：** Literata 400，opsz 以下尺寸，蓝色。
- **标签、标题、表格标题、导航：** Literata 500 缩小一步，句子大小写，`--color-muted` 或蓝色。无单声道：数字采用 Literata 的表格数字。

## Surfaces · 表面

- 没有黑色：每个单词、规则和图标都印在蓝色鼓中，每个填充物都用粉红色；粉色叠印蓝色（`mix-blend-mode: multiply`），紫色显示，但没有人画它。
- 粉红色鼓的屏幕是纸张：任何文本下的`--color-paper-2`（浅色屏幕），仅显示类型下的`--color-paper-3`（半强度），带有`--color-accent-ink`的纯粉红色。蓝色鼓可能会打印实心，并且字体已被敲除到纸上。每页两个带。
- `--color-rule`、1.5px 蓝色的细线，其中规则框出图形，2px 半径，无阴影；深度是套印。
- 照片：均匀光线下的作品和房间，裁剪紧密，具有真实的色调范围。每张都在两个鼓上打印，蓝色阴影进入浅粉色屏幕（`photo:` 双色调），2px 半径，其上有颗粒，下方有文字说明。
- 颗粒，声明：纸张斑点，其中墨水在 `--texture-opacity` 的填充、条带和照片上跳过 (`texture.md` § 1, light specks)，但绝不在运行文本下；颗粒和套印不正是鼓的家族。

## Range · 范围

- **数字**设置为两种墨水叠印：显示尺寸的蓝色 Cabinet 800 中的数字，实心粉红色形状在其部分上相乘，因此紫色仅打印在鼓交叉的位置。价格或日期以这种方式显示在屏幕上。
- **步骤**作为分色：相同的艺术品显示为单独的蓝色层，单独的粉色层，然后是带有两者的纸张，三个板在细线框架中的库存上；过程就是图片。
- **浅粉色屏幕上的行和表格**：价目表或订单以 Literata 表格数字中的蓝色细线行形式显示，显示面上显示实时总计，半屏上选择的行。
- **乐队**装在一个鼓中，全力以赴：纯蓝色，带有在枪托上敲出的声明，其上有粉红色基色，或纯粉红色带有深蓝色类型；显示尺寸的声明是这种材料发出的最响亮的声音。

## Controls · 控制

- 这对：一个粉红色填充的矩形，带有 `--color-accent-ink` 类型，旁边是一个蓝色轮廓的 1.5px，两者都在位于 15px 的 Cabinet Grotesk 800 中的 2px 半径处；按下按钮后，控制器会将 1px 向下向右放下，就像一张纸落地的方式一样。
- 链接以粉红色下划线显示，悬停时更粗；输入 48px 高，位于 2px 半径处，库存上有 1.5px 蓝色边框，即柜子 800 中的值。
- 粉色位于主屏幕上，链接带有下划线，其中一个占据了整个屏幕；对焦环是蓝色的。

## Motion · 运动

一项揭示：一旦在 `--ease-out` 上的 `--dur-long` 上加载，粉色鼓就会进入其偏移状态，并且永远不会循环。控件通过 `--dur-short` 改变颜色；没有其他东西在动。

## Voice · 嗓音

具体和手工设置：命名墨水、纸张、滚筒和价格；动词高于形容词。故意不完美。

## Do-nots · 不该做的事

- 切勿使用黑色墨水或灰色墨水；唯一的第三种颜色是鼓发出的紫色。
- 绝不是注册的、无纹理的平坦渐变；那是矢量，而不是里索。
- 切勿像库存上的字体那样呈粉红色；粉红色的鼓充满，蓝色的鼓书写。
- 决不会在第二个头上出现套准错误；一句话，然后休息。
- 切勿将一页双色调照片背靠背；鼓在拉动之间需要有自己的一页。

## Build hint · 构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); } h1 { line-height: 0.92; } h2 { line-height: 0.98; }
.misreg { position: relative; display: inline-block; isolation: isolate; }
.misreg::after { content: attr(data-text); position: absolute; inset: 0; z-index: -1; white-space: nowrap; pointer-events: none; color: var(--color-accent); transform: translate(2px, 3px); }
.overprint { background: var(--color-accent); mix-blend-mode: multiply; }
a { text-decoration-color: var(--color-accent); text-decoration-thickness: 2px; } a:hover { text-decoration-thickness: 4px; }
.btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 var(--space-lg); border: 1.5px solid transparent; border-radius: var(--radius-card); font: var(--display-weight) 0.9375rem/1 var(--font-display); transition: background-color var(--dur-short) var(--ease-out), transform var(--dur-micro) var(--ease-out); }
.btn:active { transform: translate(1px, 1px); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { border-color: var(--color-ink); color: var(--color-ink); }
.band--solid { background: var(--color-ink); color: var(--color-paper); }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: var(--texture-opacity); background-size: 200px 200px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E"); }
```
