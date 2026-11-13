---
name: Studio
slug: studio
genre: editorial
paper: light 97.2 215
display: roman-serif Hedvig Letters Serif
accent: warm 52
posture: restrained
keywords: design studio, creative studio, branding, brand identity, art direction, agency, portfolio, case study, selected work, editorial design, typography, creative direction, graphic design, considered, curatorial
material: cool studio-white proof paper with an ink dot grid and grain, blue-black ink, Hedvig Letters Serif heads over Geist, crop marks on every printed piece, orange construction guides, the work photographed in true colour, one cadmium-orange signal
photo: natural
pictured: Portfolio Index, Ledge hero
---

# 工作室

设计工作室的样张，在制作过程中捕获：酷炫的工作室白纸，带有墨点网格和细纹、蓝黑色墨水，头部使用海德维格字母衬线（连接处带有书法手的当代衬线），干净的Geist主体，每个印刷件的角落处都有裁剪标记，以及一个既填充动作又绘制结构的镉橙色：公制参考线，空白框，红线。它读作已考虑，因为该类型显示为正在测量。它不是带有赤土​​色的温暖奶油色组合，也不是灰色的简约模板。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(97.2% 0.006 215); --color-paper-2: oklch(94% 0.009 215); --color-paper-3: oklch(90.5% 0.011 215); --color-paper-hi: oklch(99% 0.004 215);
  --color-ink: oklch(16% 0.032 250); --color-ink-2: oklch(34% 0.022 245); --color-muted: oklch(49% 0.018 240);
  --color-rule: oklch(84% 0.010 225);
  --color-accent: oklch(68% 0.172 50); --color-accent-ink: oklch(16% 0.032 250); --color-focus: oklch(52% 0.15 48);
  --color-dot: color-mix(in oklab, var(--color-ink) 20%, transparent); --color-mark: color-mix(in oklab, var(--color-ink) 72%, transparent);
  --font-display: "Hedvig Letters Serif", ui-serif, Georgia, serif; --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Sofia Sans Extra Condensed", "Arial Narrow", ui-sans-serif, sans-serif;
  --radius-card: 3px; --radius-pill: 3px; --rule-hair: 1px;
  --shadow-card: none;
  --shadow-sheet: 1px 2px 0 color-mix(in oklab, var(--color-ink) 7%, transparent), 10px 18px 36px -14px color-mix(in oklab, var(--color-ink) 32%, transparent);
  --tracking-display: -0.022em; --display-weight: 400;
}
```

## Type · 类型

- **显示：** Hedvig Letters Serif 400，其一种粗细，`--tracking-display`，行高 0.98 至 1.04，句子大小写，`font-optical-sizing: auto`。手握着从 200px 文字标记到 25px 项目标题 (tracking -0.005em there)。仅头部、图形和文字标记。
- **正文：** Geist 400 和 500，行高 1.55，运行文本的 ink-2。
- **标签、说明文字、指南读数：** Geist 500 缩小一步、句子大小写、`--color-muted`、任何测量的表格数字。没有单声道。
- **样本面：** Sofia Sans Extra Condensed 500，仅在显示替代系统的样本内；绝不是页面本身的标题或标签。

## Surfaces · 表面

- 地面是生成的证明，而不是图片：`--color-dot` 中的 24px 径向渐变点网格位于 `feTurbulence` 颗粒 (`--grain`) 下，在首屏主视觉、导航和页脚上，在下一部分之前隐藏以淡出；该页的其余部分是干净的纸。
- 每张印刷品（一张纸、一张照片、一张卡片、一个控件、一个聚焦字段）上的裁剪标记：在 `::before` 上用背景渐变绘制八个 1px `--color-mark` 刻度，通过一个小间隙（在一张纸上较大的间隙）将角衬托出来。配准目标可以位于纸张的两侧。
- 橙色绘制结构：1px `--color-accent` 引导字体的实际上升部分、大写字母高度、x 高度、基线和下降部分及其在标签语音中的读数、x 单位的空白框、带有尺寸的红线。仅规则，绝不橙色类型。
- 两条规则：行间1px `--color-rule`； 1px `--color-ink` 开盘一套。半径 3px。
- 一个阴影，仅适用于纸质物体（一张卡片、一张纸），从左上角点亮：`--shadow-sheet`。其他一切都平淡无奇。
- 条带：2条纸，或1条纸型墨带；从来没有橙色的田地。
- 照片：使用它的作品，水平，日光，垂直，真实色彩，裁剪标记，旁边有比例红线；从来没有一个模型。

## Range · 范围

- **正在建设中的文字标记：** 这个名称在 Hedvig 中设置巨大，具有公制参考线、空白框和点网格上的读数；指针以字体单位测量字母的前进。
- **作为样本卡的系统：** 作为裁剪标记卡（面线、`Aa Gg Rr 0123456789`、六角色板）的两种或三种替代方案，可按类型、颜色或网格切换一组板。
- **打开的索引：** 在墨水尺下行，海德维格按物品尺寸，每个开口都放入一个盒子中，并以规定的比例保存照片。
- **尺寸测试：** 一条线尺寸下降（横幅、海报、门票），每条线都有自己的橙色指南，旁边有实际尺寸。

## Controls · 控制

- 打印控件： 2px 半径处的 1px 墨水边框，第二条规则嵌入其中 2px，在悬停时略微打开的角处的裁剪标记；主屏幕用墨水文字填充橙色。盖斯特 500，48px。
- 字段：3px、1px `--color-muted` 边框，裁剪标记出现在焦点上。链接在悬停时带有橙色下划线。
- 橙色填充停留在一个动作上；橙色线是构造线，可能很多但很细。

## Motion · 运动

引导件沿着其长度拉入一次。一组系统可能会在视野中每隔几秒钟转动一次，并在任何选择时停止。 `--ease-out` 上的 `--dur-short` 的状态发生变化。减少动态效果：完整的建筑，静止。

## Voice · 嗓音

简洁而准确，有点文学性。动词高于形容词；命名作品、机构、其存在的表面、测量。绝不是“创造性的解决方案”或“赋予品牌生命”。

## Do-nots · 不该做的事

- 永远不要在连续文本中使用海德维格，也不要将样本面朝样本外。
- 切勿使用橙色泛光、橙色类型或第二种暖色。
- 切勿热纸；地面凉爽，色调215。
- 绝不会有不符合字体规格的指南或不真实的尺寸。
- 切勿将点网格放在整个页面或运行文本后面。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&family=Geist:wght@400;500&family=Sofia+Sans+Extra+Condensed:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); color: var(--color-ink); font-optical-sizing: auto; line-height: 1.0; }
.proof { background-image: var(--grain), radial-gradient(circle at 1px 1px, var(--color-dot) 1px, transparent 1.4px); background-size: 160px 160px, 24px 24px; }
.crop { position: relative; --l: 8px; --o: 12px; }
.crop::before { content: ""; position: absolute; inset: calc(-1 * var(--o)); pointer-events: none; background: linear-gradient(var(--color-mark), var(--color-mark)) 0 var(--o) / var(--l) 1px no-repeat, linear-gradient(var(--color-mark), var(--color-mark)) var(--o) 0 / 1px var(--l) no-repeat; }
.btn { border: var(--rule-hair) solid var(--color-ink); border-radius: 2px; min-height: 48px; padding: 0 var(--space-lg); font-weight: 500; color: var(--color-ink); }
.btn::after { content: ""; position: absolute; inset: 2px; border: var(--rule-hair) solid var(--color-mark); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.guide { height: var(--rule-hair); background: var(--color-accent); }
.set { border-top: var(--rule-hair) solid var(--color-ink); } .set > * { border-bottom: var(--rule-hair) solid var(--color-rule); }
```
