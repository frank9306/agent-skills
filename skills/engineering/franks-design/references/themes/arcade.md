---
name: Arcade
slug: arcade
genre: playful
paper: dark 14 312
display: pixel Silkscreen and Bungee
accent: chromatic-ember 40
posture: full-palette
keywords: game, indie, game studio, launch party, demo night, hackathon, festival, meetup, retro, pixel, arcade, nostalgia, synth, lo-fi, toy, zine, club night, loud
material: aubergine CRT ground, lilac-white ink, Bungee capitals split in RGB over Chivo, Silkscreen figures, hard offset shadows, ember and acid signals
photo: tint accent
pictured: Marquee Hero, Stage hero
---

# 拱廊

一个深夜的橱柜：CRT屏幕下的茄子地，Bungee大写字母在Chivo上以RGB方式分开，丝网印刷的数字，硬胶印阴影，两种大声的墨水像两个玩家一样轮流。照片透过屏幕映入眼帘，带有铅色。它通过色彩、文字、光线和压力物理而响亮，从未绘制过道具；不是霓虹灯合成波海报，不是像素艺术游戏页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(14% 0.04 312); --color-paper-2: oklch(18.5% 0.042 312); --color-paper-3: oklch(23% 0.045 312);
  --color-ink: oklch(95% 0.014 315); --color-ink-2: oklch(87% 0.018 315); --color-muted: oklch(71% 0.024 315);
  --color-rule: oklch(34% 0.05 312);
  --color-accent: oklch(66% 0.215 40); --color-accent-2: oklch(88% 0.195 115); --color-accent-ink: oklch(14% 0.04 312);
  --color-focus: oklch(88% 0.195 115);
  --color-crt-r: oklch(63% 0.24 25); --color-crt-g: oklch(80% 0.25 140); --color-crt-b: oklch(60% 0.24 265); --color-crt-c: oklch(78% 0.14 200); --color-shade: oklch(8% 0.02 315);
  --font-display: "Bungee", "Impact", sans-serif; --font-body: "Chivo", ui-sans-serif, sans-serif; --font-outlier: "Silkscreen", monospace;
  --radius-card: 4px; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 6px 6px 0 var(--color-accent-2);
  --tracking-display: 0; --display-weight: 400;
}
```

两个表盘，每个表盘均刻有标记 (`arcade: ember/grille`)。颜色，引导地面答案：`ember`（上面的块）、`sodium` (80% 0.165 72 over 60% 0.145 242 on 14% 0.030 300) 或 `oxblood` (83% 0.150 90 over 58% 0.200 25 on 16% 0.028 330)。屏幕：`grille`（低 Alpha 下的 1px 垂直 RGB 条纹）或 `mask` (a triad dot lattice on a 3px pitch)。切勿在一个页面上混合使用两个。

## Type · 类型

- **显示：** Bungee 400，大写，未跟踪，行高 1.02，对于 h1，一个语句行和文字标记，每行不超过 28 个字符。它携带 RGB 分割：1 到2px的`--color-crt-r`一种方式和`--color-crt-c`另一种是零模糊，每个屏幕一条分割线。
- **头部和身体：** Chivo；节头 900 位于 -0.02em 且行高 1，句子大小写；散文 400 为 1.6。
- **数字：** Silkscreen 700，未跟踪，表格，仅在 40px 及以上（它涂抹得更小），采用两种墨水，旁边有 Chivo 700 的单位。Silkscreen 中从来没有一个单词，而是像 PM 这样的单位。
- **标签：** Chivo 700 更小一步，句子大小写。

## Surfaces · 表面

- `--rule-bar` 位于孔和任何可按压的东西上，`--rule-hair` 位于行之间的 `--color-rule` 中； 4px 半径、方形标签和输入。
- 深度：任何可按压的东西上的零模糊酸偏移，井上的地面台阶，光标行（一行填充有 `--color-accent-ink` 类型的余烬，就像选定的菜单行）用于列表想要选择的一件事。永远不要模糊。
- 频段：屏幕下的 `--color-paper-2`，或 `--color-accent-ink` 类型且无 RGB 分割的一个 ember 区域。一页最多两页。
- 照片：房间内的夜晚：手放在棍子上，钥匙从下面照亮，玩家从后面，没有人面对镜头。有色，`--rule-bar` 边框，位于屏幕下方；大而少。
- 屏幕 (`texture.md` § 4)：表盘层和 `--color-shade` 扫描线，静态，位于条带、孔和照片上；永远不会在运行文本下，永远不会出现边框。

## Range · 范围

- **数字作为分数线：**丝网印刷中提示的实数位于 `--text-display-s` 及以上，余烬和酸交替，由 `--rule-bar` 垂直线分隔在十二列上。
- **两人比较：** 两口并排的井，一把钥匙余烬和一把酸（顶部条和图形墨水），在它们之间匹配的行适合两个观众或两个选择；墨水是玩家，没有画任何东西。
- **作为菜单的时间表或价目表：** 丝网印刷的时间或价格行与 Chivo 900 标题在发丝上，一个光标行点亮余烬。
- **声明和工作控制：** 一根蹦极线，在 ember 场上显示大小；或者将印刷机表面作为步进器，并以显示尺寸在丝网印刷中显示运行总计。

## Controls · 控制

- 印刷机表面：Ember 填充、Chivo 700、`--rule-bar` 墨水边框和酸胶印，同一表面旁边未填充。悬停远离阴影，主动猛击阴影；步进按钮是相同的表面正方形。
- 墨水链接带有 2px 酸性下划线；输入 52px，正方形，`--color-muted` 中的 `--rule-bar` 边框。
- Ember 在控件和数字方面提供线索和尖锐的答案；从来没有第三种墨水。

## Motion · 运动

按 `--dur-micro` 和 `--ease-out` 上的物理原理。 `steps(1)`上的光标行亮起，不褪色； RGB 分割可能会在连接的显示线上加宽 1px。

## Voice · 嗓音

投币式操作简单，盖过噪音说道：夜晚、时间、门价、机器。台词短，动词在前，没有怀旧之情。

## Do-nots · 不该做的事

- 从来没有洋红色和青色成对，从来没有星空；屏幕就是质感。
- 绝不是按钮上的柔和阴影、磷光或渐变。
- 绝不是绘制的精灵、操纵杆、控制器或像素角色；晚上被拍照。
- 绝不要一页背靠背地放彩色照片：一张余烬图片旁边的余烬图片就是一面橙色的墙。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=Chivo:wght@400;700;900&family=Silkscreen:wght@700&display=swap" rel="stylesheet">
```

```css
h1, .display { font-family: var(--font-display); font-weight: 400; line-height: 1.02; text-transform: uppercase; text-shadow: -1.5px 0 0 var(--color-crt-r), 1.5px 0 0 var(--color-crt-c); }
h2, h3 { font-family: var(--font-body); font-weight: 900; letter-spacing: -0.02em; line-height: 1; }
.figure { font-family: var(--font-outlier); font-weight: 700; color: var(--color-accent-2); font-variant-numeric: tabular-nums; }
.btn { background: var(--color-accent); color: var(--color-accent-ink); border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-card); padding: var(--space-sm) var(--space-lg); font-weight: 700;
  box-shadow: var(--shadow-card); transition: translate var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
.btn:active { translate: 3px 3px; box-shadow: 2px 2px 0 var(--color-accent-2); }
.btn--secondary { background: transparent; color: var(--color-ink); }
.row:hover, .row[aria-current] { background: var(--color-accent); color: var(--color-accent-ink); transition: background-color var(--dur-micro) steps(1); }
.well { background: var(--color-paper-2); border: var(--rule-bar) solid var(--color-rule); border-radius: var(--radius-card); }
.crt { position: relative; isolation: isolate; }
.crt::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image:
    repeating-linear-gradient(to right, color-mix(in oklab, var(--color-crt-r) 5%, transparent) 0 1px, color-mix(in oklab, var(--color-crt-g) 5%, transparent) 1px 2px, color-mix(in oklab, var(--color-crt-b) 5%, transparent) 2px 3px),
    repeating-linear-gradient(to bottom, transparent 0 2px, color-mix(in oklab, var(--color-shade) 16%, transparent) 2px 3px); }
```
