---
name: Manifesto
slug: manifesto
genre: editorial
paper: dark 13 60
display: display-condensed Anton
accent: warm 28
posture: committed
keywords: manifesto, statement, declaration, principles, beliefs, mission, movement, protest, cause, campaign, petition, activism, advocacy, rights, values, take a stand, bold launch, defiant, punk, record label
material: warm near-black ground, warm off-white ink, Anton capitals at poster size leaded tight over a quiet Public Sans body, hairlines, a heavy ink bar and square edges, one fighting red
photo: duotone paper ink con=24
pictured: Manifesto, Ledge hero
---

# 宣言

一份声明打印在一张深色纸张上：温暖的近乎黑色底色、温暖的灰白色墨水、Anton 大写字母设置为宽度允许的最大尺寸且引线紧密、小而朴素的 Public Sans 体、发际线、一根粗墨条、方形边缘和一根战斗红色。力量来自于海报大小的大写字母和安静的正文之间的对比，以及很少使用的红色；照片用灰白色墨水打印，坚硬而紧密，就像粘贴的传单一样。没有任何装饰。它不是由贴纸和撕纸组成的抗议海报，也不是带有红色按钮的深色产品页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(13% 0.01 60); --color-paper-2: oklch(17% 0.011 60); --color-paper-3: oklch(22% 0.012 60);
  --color-ink: oklch(95% 0.014 85); --color-ink-2: oklch(84% 0.012 80); --color-muted: oklch(64% 0.016 65);
  --color-rule: oklch(31% 0.014 60);
  --color-accent: oklch(56% 0.228 28); --color-accent-deep: oklch(49% 0.2 28); --color-accent-text: oklch(64% 0.22 28); --color-accent-ink: oklch(98.5% 0.004 90);
  --color-focus: oklch(64% 0.22 28);
  --font-display: "Anton", "Impact", sans-serif; --font-body: "Public Sans", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 4px; --shadow-card: none;
  --tracking-display: 0.004em; --display-weight: 400; --lh-tight: 0.9; --text-display: clamp(4.5rem, 12vw, 13rem);
}
```

## Type · 类型

- **显示：** Anton 400，一种重量，仅大写，`--tracking-display`。压缩帽更上一层楼：壁架或走廊首屏主视觉头部设置在主题自己的 `--text-display` (to 13rem) 上，这是一个与其最长的线条允许跨十二列一样大的声明，其他头部比共享比例更进一步。头部的每条线条都位于自己的元素中并且从不缠绕（`white-space: nowrap`，尺寸为 `cqi`，设计记录 `waive 55b`）在 `--lh-tight` 处领先；任何可以以 1.02 (55a) 缠绕引线的头。
- **红字：**整页一个字，首屏主视觉头像内，`--color-accent-text`（戳记`waive 38iii`）。其他每个头都是一种颜色。
- **正文：** Public Sans 400 和 600，普通字体，`--color-ink-2`； 21px 处的领先声音最大。
- **标签、标题、表格标题、元数据、日期：** Public Sans 500 更小，句子大小写，未跟踪，`--color-muted`。没有单声道。

## Surfaces · 表面

- 发际线划分： `--rule-hair` 在 `--color-rule` 之间，在头下，就像一张大报一样；一个 `--rule-bar` 位于导航下方或记录上方；红色规则一页最多一次。
- 半径为 0 并且任何地方都没有阴影：没有盒装卡片，没有升降机。井是发际线以下的 `--color-paper-2` 油​​田。
- 条带：`--color-paper-2`，或页面的一个红色反面，红色区域为`--color-accent-ink`类型；一页最多两页。
- 照片：近距离、强光、页面所主张的东西（一块木板、一个工具、修理的手）、锐利、没有面孔、剪裁得很紧，所以边缘变暗。它们采用灰白色墨水（`photo:` 双色调）打印，方形，1px `--color-rule` 环，全出血或根本不出血。 `--color-paper` 板上的一个头像仅在其最暗的三分之一处交叉；红色从不触及图片。
- 一切都是暖色调的(hue 60 to 90)，绝不是中性灰色；没有质感，没有装饰。

## Range · 范围

- **记录：**要求、原则或条款为细线下的全角行，安东中的每个数字采用柔和墨水的部分大小，安东中的条款采用标题大小，其旁边有一条普通线。
- **海报行：** 在所有十二列中用安东写一个日期、人物或口号，行的大小尽可能大，下面有步骤或短行；大小是参数。
- **堆叠的信条：** 安东的三行短行锁定在 `--lh-tight`，每行都有自己的现在行，在纸张上向左齐平，旁边没有其他内容。
- **承诺：** 安东语中的一句话，其中空白的名字，在一个红色字段上，下面是电子邮件及其按钮。

## Controls · 控制

- 方形、标尺绘制的控件：`--color-ink-2` 中的细线块旁边有一个带有 `--color-accent-ink` 文本（悬停时为 `--color-accent-deep`）的扁平红色块，悬停时会反转为红色。在红色区域，主屏幕转向地面并带有墨水文本。
- 链接是带有 1px 下划线的墨水，悬停时会变成 `--color-accent-text`； `--color-paper-2` 上的输入为方形、细线边框。
- 在红色区域之外，红色保持在屏幕的 5% 以下：红色字、主要控件、聚焦环、一条红色规则。

## Motion · 运动

一个剪辑显示：首屏主视觉头部在 `--ease-out` 上的 `--dur-long` 上向上擦拭一次（`clip-path: inset()`，从不软褪色）。没有其他东西在动；没有反弹，没有视差，没有红色脉冲。

## Voice · 嗓音

命令式、简短、陈述式：用词较量、动词胜过形容词、要求读者使用自己的名词。没有对冲；陈述它并支持它。

## Do-nots · 不该做的事

- 没有第二种口音；红色是唯一的颜色。
- 永远不会有红色的洪水超出一个倒置的表面；红色是信号，而不是背景。
- 绝不是浅色地面；床单保持黑暗。
- 切勿装饰：不得使用花朵、贴纸、撕边、硬偏移阴影或彩色或红色调的照片。
- 绝不是衬线、小写或标题大写的显示，也绝不是胆怯的头：如果 Anton 坐在 1440 的 64px 下，它就不再喊叫了。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
body { color: var(--color-ink-2); }
h1, h2, h3 { font-weight: 400; text-transform: uppercase; line-height: 1.02; color: var(--color-ink); }
.display { line-height: var(--lh-tight); container-type: inline-size; }
.display > span { display: block; white-space: nowrap; }
.display .hot { color: var(--color-accent-text); }
.bar { border-bottom: var(--rule-bar) solid var(--color-ink); }
.btn { border: var(--rule-hair) solid transparent; background: none; border-radius: 0; padding: var(--space-sm) var(--space-lg); font-weight: 600; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--primary:hover { background: var(--color-accent-deep); }
.btn--secondary { border-color: var(--color-ink-2); color: var(--color-ink); }
.btn--secondary:hover { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.band--red { background: var(--color-accent); color: var(--color-accent-ink); }
.reveal { animation: wipe var(--dur-long) var(--ease-out) both; }
@keyframes wipe { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }
::selection { background: var(--color-accent); color: var(--color-accent-ink); }
```
