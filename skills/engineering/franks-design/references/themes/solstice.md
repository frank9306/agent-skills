---
name: Solstice
slug: solstice
genre: editorial
paper: light 94 80
display: high-contrast-serif Yeseva One
accent: warm 24
posture: restrained
keywords: farm, orchard, cider, perry, winery, harvest, seasonal, food, almanac, produce, vineyard, calendar, market, craft drink, label, bottle, rural, slow, sun, midsummer
material: cream paper, warm brown ink, Yeseva One over Archivo and Archivo Narrow, gold hairlines and hard paper shadows, photographs in low warm light, one vermilion signal
photo: warm high=-12
pictured: Midsummer, Stage hero
---

# 至日

年鉴的温暖：奶油色纸，温暖的棕色墨水，Yeseva One 抬头，Archivo 用于阅读，Archivo Narrow 用于小字体，金色发际线做统治，硬纸阴影上的方形表面，在低光下拍摄的照片，以及一个朱红色信号。它通过墨水、金色、粗衬线和图片中的光线来解读季节性和乡村气息，而不是通过农产品的图画。它不是农舍脚本页面，也不是奶油色赤土模板。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(94% 0.03 80); --color-paper-2: oklch(97% 0.02 85); --color-paper-3: oklch(89% 0.05 80);
  --color-ink: oklch(27% 0.05 50); --color-ink-2: oklch(36% 0.05 50); --color-muted: oklch(48% 0.06 55);
  --color-rule: oklch(84% 0.06 78);
  --color-accent: oklch(54% 0.20 24); --color-accent-ink: oklch(97% 0.02 85); --color-focus: oklch(54% 0.20 24);
  --color-gold: oklch(74% 0.14 75); --color-gold-2: oklch(84% 0.11 80); --color-slot: var(--color-gold);
  --font-display: "Yeseva One", ui-serif, Georgia, serif; --font-body: "Archivo", ui-sans-serif, sans-serif;
  --font-outlier: "Archivo Narrow", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-pill: 999px; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: 10px 10px 0 var(--color-paper-3);
  --tracking-display: -0.005em; --display-weight: 400;
}
```

信号是色调为 24 的朱红色，一种带有温暖感的红色，与金色和棕色搭配，而不是粘土色；黄金法则永远不会被填满。设计记录上注明的三盏灯 (`solstice: long-light`)。

| 光 | 纸张和墨水 | 信号和黄金 |
| --- | --- | --- |
| `long-light`（默认） | 奶油色 `oklch(94% 0.03 80)` 下棕色 `oklch(27% 0.05 50)` | 朱红色`oklch(54% 0.20 24)`，金色`oklch(74% 0.14 75)` |
| `dusk` | 奶油色墨水下的梅子棕色 `oklch(27% 0.05 40)`；凸起的井留霜 | 朱红色保留`oklch(54% 0.20 24)`带奶油色文字，金色`oklch(78% 0.14 80)` |
| `midwinter` | 霜色`oklch(95% 0.012 230)` 冷棕色下`oklch(28% 0.03 260)` | 朱红保持其色调，金色变淡 `oklch(80% 0.06 230)` |

## Type · 类型

- **显示：** Yeseva One 400，罗马字体，行高 1.0，`--tracking-display`，每个头一种颜色；大人物也接受它。
- **主体：** Archivo 400 和 500，16 至 17px，行高 1.55，采用 `--color-ink-2`。
- **小字：** Archivo Narrow 600 at 12.5 至 13.5px，句子大小写，未跟踪，异常值，用于日期、月份、照片下的标题和轴标签。元和表头：Archivo 500 更小，句子大小写。没有单声道。

## Surfaces · 表面

- 规则：`--rule-bar`墨水横过一段上方，`--rule-hair`在`--color-rule`行之间，金色发际线下有一个头内井。
- 除对照对外，到处都是正方形：孔、照片或输入上没有半径；按钮和步进器采用`--radius-pill`。
- 深度：凸起的井采用 `--rule-bar` 墨水边框、1px 黄金规则插图 6px 和硬 `--shadow-card`，纸张 3 中的胶印，没有模糊；从来都不是柔和的阴影。
- 表带：`--color-paper-2` 表带，或带有奶油色文字的暖棕色墨水表带；一页最多两页，从来没有朱砂田。
- 照片：低光、晚光的季节：树枝上的水果、长长的草、外面桌子上的玻璃杯或瓶子、傍晚的果园；温暖，有点朦胧，影子很长。方形，1px 墨水发丝线为 10%，无阴影。小字体的框架下方有一个标题，说明一个事实（地点、月份、瓶子）；照片上的文字以 40% 到 60% 的比例位于棕色稀松布上的阴影面。
- 无质感：奶油保持干净。

## Range · 范围

- **产品在灯光下建造：** 瓶子以全高剪裁，其标签采用活体字体（Yeseva中的名字，朱红色的小字体，金色的发际线，奔跑），天空从奶油色到黄昏逐渐过渡到黑暗的领域，背后有低沉的温暖光芒。
- **标签作为规则列表：** 一张纸 - 2 条嵌入金色细线，其事实为行（风格、瓶子、运行、价格、发行），左侧有小字体标签，右侧有 Yeseva 值，它们之间有金色的点线。
- **一年在一条线上：**从开花到装瓶的季节，停在棕色带子的发际线上，金色小字印刷月份，奶油色Yeseva的阶段，当前的阶段以太阳的颜色标记。
- **重要的订单：** 一个朱红色按钮旁边有一个药丸步进器，其标签上载有运行总数，在一个声明标题下，在奶油色到黄昏的地面上以显示尺寸显示。

## Controls · 控制

- 一对：一粒朱红色填充药丸，采用 Archivo Narrow 600 包装，带有 `--color-accent-ink` 文字，旁边是一颗素色药丸，上面有 2px 墨水下划线，没有盒子。
- 链接用墨水加下划线，悬停时变成朱红色；在 `--color-paper-2` 上输入带有 1px 墨水边框的正方形。
- 内敛：朱红色位于主屏、对焦环和一个人物上，占屏幕的5%以下；金色从不给文字上色。

## Motion · 运动

安静：选项卡在悬停在 `--ease-out` 上的 `--dur-short` 上时交换其面板和行灯。没有揭示，没有计数器，没有循环。

## Voice · 嗓音

年鉴：光明时刻、紧迫的日子、果园的名字。永远不要为美好生活干杯。

## Do-nots · 不该做的事

- 绝不是第二种暖色；第二个橙子可以做成水果摊。
- 切勿使用中性墨水；灰黑色破坏了奶油色。
- 绝不是圆形卡片或柔和的阴影；凸起的井是方形的，有直纹且有硬阴影。
- 切勿使用冷光或平光照明的照片：蓝色的正午天空或闪光灯会使奶油色变得病态。
- 切勿用粘土或赤土代替朱砂；过去的色调 28 主题变成了每个生成器制作的奶油色、衬线和粘土页面。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Yeseva+One&family=Archivo:wght@400;500&family=Archivo+Narrow:wght@600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 400; line-height: 1; }
.small, figcaption { font: 600 12.5px var(--font-outlier); color: var(--color-muted); }
.btn { display: inline-flex; padding: var(--space-md) var(--space-xl); border: 0; font: 600 var(--text-sm)/1 var(--font-outlier); background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { background: none; color: var(--color-ink); padding: var(--space-lg) 0 var(--space-xs); border-bottom: var(--rule-bar) solid var(--color-ink); }
.well { background: var(--color-paper-2); border: var(--rule-bar) solid var(--color-ink); outline: var(--rule-hair) solid var(--color-gold); outline-offset: -7px; box-shadow: var(--shadow-card); }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
.photo img { outline: var(--rule-hair) solid color-mix(in oklab, var(--color-ink) 10%, transparent); outline-offset: -1px; }
a:hover { text-decoration-color: var(--color-accent); }
::selection { background: color-mix(in oklab, var(--color-gold) 40%, transparent); }
```
