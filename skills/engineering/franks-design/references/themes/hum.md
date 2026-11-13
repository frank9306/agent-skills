---
name: Hum
slug: hum
genre: playful
paper: light 97 95
display: rounded-sans Chillax
accent: chromatic-yellow 95
posture: full-palette
keywords: daily, habit, streak, practice, learning, reading, curiosity, mood, energy, friendship, community, kids, family, parents, school, game, puzzle, creative, playful, alive
material: grained cream paper pulled toward pear-yellow, torn paper edges with a pale fibre core, card-stock controls that press down, blue-black ink, Chillax throughout, three accents that never blend and a mint for growth
photo: natural vib=12 exp=4
pictured: Workbench, Settled hero
---

# 哼

手工剪纸，既欢快又不幼稚：带有明显纹理和纤维的奶油色纸，沿着边缘撕开的纸张，露出苍白的核心，可以按压的卡片纸，所有这些都从左上角点亮。 Chillax 从标题到标签（它的单层 a 和 g 读起来就像早期读者的页面）都用蓝黑色墨水书写。三种口音永远不会混合：梨色代表动作，蓝色代表链接，珊瑚色代表响亮的时刻；薄荷是成长。不是柔和的苗圃模板，不是彩虹页，不是剪贴画。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(97% 0.012 95); --color-paper-2: oklch(94.5% 0.018 95); --color-paper-3: oklch(91% 0.022 95);
  --color-ink: oklch(20% 0.014 255); --color-ink-2: oklch(29% 0.014 255); --color-muted: oklch(47% 0.014 255);
  --color-rule: oklch(87% 0.016 95);
  --color-accent: oklch(87% 0.175 96); --color-accent-deep: oklch(72% 0.16 92); --color-accent-ink: oklch(20% 0.014 255);
  --color-accent-2: oklch(50% 0.17 250); --color-accent-3: oklch(70% 0.2 22);
  --color-mint: oklch(82% 0.15 152); --color-mint-deep: oklch(48% 0.12 155); --color-focus: oklch(50% 0.17 250);
  --color-card: oklch(98.8% 0.007 95); --color-edge: oklch(83% 0.04 88); --color-fringe: oklch(99.2% 0.006 95);
  --color-kraft: oklch(63% 0.085 62); --color-sand: oklch(77% 0.1 76); --color-sugar: oklch(89% 0.035 236);
  --color-hill-1: oklch(94.5% 0.03 118); --color-hill-2: oklch(91.5% 0.045 135); --color-leaf: oklch(64% 0.15 150);
  --font-display: "Chillax", ui-rounded, ui-sans-serif, sans-serif; --font-body: var(--font-display);
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 24px; --radius-stock: 16px; --radius-input: 14px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(20% 0.014 255 / 0.06), 0 12px 28px -14px oklch(20% 0.014 255 / 0.22);
  --shadow-paper: drop-shadow(0 0 0.6px oklch(20% 0.014 255 / 0.32)) drop-shadow(1.5px 2.5px 1.5px oklch(20% 0.014 255 / 0.1)) drop-shadow(6px 14px 16px oklch(20% 0.014 255 / 0.13));
  --tracking-display: -0.03em; --display-weight: 600;
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); --ease-snap: cubic-bezier(0.22, 1, 0.36, 1);
}
```

## Type · 类型

- **显示：** Chillax 600，`--tracking-display`，行高 1.02 至 1.05，句首字母大写。数字为 `--text-display` 或更大，其单位为 `--text-title`。
- **主体：** Chillax 500，17 至 19px，行高 1.5；重点是单词后面的梨形荧光笔带，而不是在头部内。两个重量，500 和 600。
- **标签、说明文字、单位：** Chillax 500 缩小一步，句子大小写，`--color-muted`。 Geist Mono 仅限内部代码。

## Surfaces · 表面

- 生成纸张，而不是图片：两个 `feTurbulence` 数据 URI、细分形颗粒 (`--grain`) 和长湍流纤维 (`--fibre`)，位于每张纸张、卡片和强调填充下方。
- 撕裂的边缘：条带、导航栏、照片或纸张由于种子值噪声而以 `clip-path` 多边形结束，其纤维孪生 (`--color-fringe`) 矗立在下面一个像素。地面可以分层：`--color-hill-*` 中的远山、`--color-leaf` 中的土壤、牛皮纸条、蓝色糖纸垫。
- 光线来自左上角：堆叠的 `--shadow-paper` 阴影落在每张裁切纸上；一张卡片可能会抬起卷页中的一个角。
- 到处都是圆形：24px 表面 (28 to 32px for children)、16px 卡片纸，无方角。
- 条带：纸 2、一张带有纸质文本的撕碎的墨纸或一片梨田。一页最多两页。
- 照片：明亮的日光下，在孩子的身高下，从不面对镜头；一侧撕破，一页或两页。

## Range · 范围

- **作为卡片纸的产品：**应用程序自己的时刻在撕破的牛皮纸条上构建了大的文字作为卡片纸瓷砖，每个按钮都会弹出一个口音。
- **生长设置类型：** 一张由 Chillax 字形（l 的茎、括号叶、字母头）制成的植物床，位于撕裂的土壤上，按照提示数字所示进行填充，以一排药丸开关的状态显示。
- **梨田上的数字：** 一张梨纸上以墨水显示大小显示的提示数字中的三到四个，每个单位在 500 以内。
- **作为卡片药丸的选择：** 对提示事实的有效控制，结果是一个句子，其关键值在梨荧光笔带中。

## Controls · 控制

- 卡纸：54px 控制在 `--radius-stock`，填充上有颗粒和纤维，顶部有嵌入高光，下方有实心 5px 边缘（梨主卡上的 `--color-accent-deep`，辅助卡上的 `--color-edge`）；悬停将边缘提升至 7px，主动将其按下至 1px。弹簧仅在初级上运行。
- 每种口音都有一份工作：梨主、梨田；蓝色链接和对焦环；珊瑚一大声填；薄荷生长。所选择的药丸是纸型墨水。一张模切贴纸即可提供优惠。
- 输入：14px 半径、52px 高度、1px `--color-muted` 边框、蓝色对焦环。

## Motion · 运动

弹簧姿势声明 (gate 12)：`--ease-spring` 仅在主控制上； `--ease-snap` 上的所有其他内容，绝不是 `scale()`。一个词在它的口音中流行起来，它的植物就会生长；计时器可能会在运行时撕下一张纸片，并在屏幕外暂停。减少动作或无脚本：最终状态。

## Voice · 嗓音

温暖、潇洒、随意、直接，写给孩子身边的大人。句子大小写、动词高于名词、仅诚实数字。

## Do-nots · 不该做的事

- 从来没有衬线，从来没有纯白纸，从来没有方角。
- 切纸上切勿出现干净的矢量边缘，也不得出现向上或向左掉落的阴影。
- 绝不是两种口音之间的渐变，也绝不是彩虹底色。
- 切勿使用表情符号、库存图标或绘制的字符；类型、纸张和产品都带有它。

## Build hint · 构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=chillax@500,600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); }
.btn { --edge: 5px; border: 0; border-radius: var(--radius-stock); min-height: 54px; padding: 0 var(--space-lg); font-weight: 600; background: var(--grain), var(--fibre), var(--color-card); box-shadow: inset 0 0 0 1px var(--color-rule), 0 var(--edge) 0 0 var(--color-edge); transition: translate var(--dur-micro) var(--ease-snap), box-shadow var(--dur-micro) var(--ease-snap); }
.btn--primary { background: var(--grain), var(--fibre), var(--color-accent); color: var(--color-accent-ink); box-shadow: 0 var(--edge) 0 0 var(--color-accent-deep), 2px calc(var(--edge) + 4px) 10px -3px color-mix(in oklab, var(--color-ink) 32%, transparent); transition-timing-function: var(--ease-spring); }
.btn:hover { --edge: 7px; translate: 0 -2px; } .btn:active { --edge: 1px; translate: 0 4px; }
.sheet { position: absolute; filter: var(--shadow-paper); } .sheet > i { position: absolute; inset: 0; background: var(--grain), var(--fibre), var(--sheet-c, var(--color-paper-3)); }
mark { background: color-mix(in oklab, var(--color-accent) 55%, transparent); color: inherit; box-decoration-break: clone; }
a { color: var(--color-accent-2); }
```
