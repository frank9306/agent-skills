---
name: Grid
slug: grid
genre: editorial
paper: light 97.5 90
display: grotesk-sans Radio Canada Big
accent: cool 266
posture: full-palette
keywords: identity, brand system, wayfinding, signage, design studio, type specimen, editorial grid, institution, museum, archive, index, directory, systems, modular, swiss, grotesque, manual, programme, poster, collection
material: white poster stock, blue-black ink, Radio Canada Big 700 in sentence case over Radio Canada, flat fields of ultramarine and one Swiss red mark, no strokes
pictured: Poster Sequence, Poster hero
photo: duotone ink paper-2 con=12
---

# 网格

现在所采用的瑞士国际风格：一张白色的床单，一种蓝黑色墨水，一种经过两次光学切割的新奇特图案，和两种具有不同工作的平面颜色，一种淹没田野的群青色和一种标志着所选择的事物的瑞士红。结构来自于列系统本身：从列线上悬挂的字体，在其上开始和停止的字段，在比例上跳跃三到四个步骤和故意保留白色。各个部分之间没有笔画，也没有任何内容被框起来；一页读起来就像是一系列组合的纸张。它不是怀旧的海报拼贴，不是红黑模板，也不是最小的产品页面。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(97.5% 0.005 90); --color-paper-2: oklch(94.2% 0.006 90); --color-paper-3: oklch(90.5% 0.008 90);
  --color-ink: oklch(19% 0.022 266); --color-ink-2: oklch(31% 0.02 266); --color-muted: oklch(47% 0.016 266);
  --color-rule: oklch(87.5% 0.008 90);
  --color-accent: oklch(44% 0.2 266); --color-accent-ink: oklch(97.5% 0.005 90); --color-focus: oklch(46% 0.2 266);
  --color-field: oklch(44% 0.2 266); --color-field-ink: oklch(97.5% 0.005 90);
  --color-mark: oklch(57% 0.215 29); --color-mark-ink: oklch(97.5% 0.005 90);
  --font-display: "Radio Canada Big", ui-sans-serif, system-ui, sans-serif; --font-body: "Radio Canada", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: var(--font-display);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.035em; --display-weight: 700;
}
```

三个角色和一篇论文，各一份工作。**字段**，群青色：打印一张纸的颜色，全宽或从列线到出血线。**标记**，瑞士红：选择或当前的内容（一个字母、一年、悬停的链接），每页最多一个红色字段。**墨水**：在纸上和主要控件上打字。红色永远不会坐在群青色上，两个领域永远不会接触。

## Type ·类型

- **显示：**加拿大广播电台Big 700，句子大小写（首字母大写和专有名词，没有其他），`--tracking-display`，海报尺寸行高0.9，部分尺寸行高1.0。线条从列线开始，向左齐平，向右参差不齐；从未居中。头部一种重量、一种颜色；打印头从纸张跨越到场地上，在场地边缘切换为场地墨水，就像套印一样，这是它可能携带的唯一变化。
- **海报比例：**海报头部尺寸与屏幕大小一致，`clamp(4.5rem, 10.2vw, 10rem)`，跟踪-0.045em，举行于1920年。数字和索引字母采用显示剪裁，可能比旁边的任何头部都大；语句将显示在400。
- **正文：**加拿大广播电台400，地址为17px，行高1.5。标签、字段名称、标题和导航链接均采用加拿大广播电台500缩小版、句子大小写、未跟踪、纸张上的`--color-muted`和字段上的字段墨水。标签中没有单声道，没有大写字母。
- **字标：**名称以两行形式显示，第一个字在700处显示，第二个在400处显示，行距0.92；它可悬挂在红色标记的正方形旁边，恰好有两行高。

## Surfaces ·表面

-没有笔划：按空格、纸张或字段的变化划分部分，从来没有规则。唯一的行是表行之间和输入下方的1px细线。
-半径为0并且任何地方都没有阴影；深度是尺度和颜色。一口井是`--color-paper-2`，没有边界。
-字段：一页需要两到三个字段，其中一个可能是红色的；每个都从边到边或从页面外的列线延伸，并毗邻白色。
-照片：均匀光线下的客观正面照片，印刷品及其工具（活字、印刷机、纸张、抽屉），在`--color-paper-2`（`photo:`双色调）上以蓝黑色印刷，因此框架是色调的一步，而不是线条。正方形，两边都在柱线上；切勿在图片上打字。
-质地：无。白色是材质。

## Range ·范围

- **套印页：**海报比例的头像悬挂在第1列上，穿过从后面的列线开始的一块田地，其字母在交叉处变成田野墨水，一个真实的人物在田地脚下设置得很大。
- **作为样本的索引：**字母、年代或名称的显示大小为一排参差不齐的按钮，所选按钮以红色标记并在该线旁边的全高度重复，如图所示。
- **包含控件的字段：**群青或红色上的范围、选择或一组输入，在字段墨水中按海报比例设置的值，并随着其移动而变化；字段上的输入通过细线键入`--text-3xl`。
- **声明不对称悬挂：**第3列或第4列中的一个句子处于声明大小，左侧的列为白色，其关键名词作为链接。

## Controls ·控制

-主要：带有纸质文本的方形墨水块，52px高，在纸上和任一字段上都相同。次要：带有1px下划线的文本，悬停时标记会变成红色。
-输入：正方形，无方框；纸上`--color-muted`下方的1px线，现场墨水为60%。对焦环为2px `--color-focus`，墨色为群青色，墨色为红色。
- `::selection`是带有纸质文字的红色标记。否则，红色仅标记选定的值、悬停及其一个字段。

## Motion ·运动

仅说明，`--dur-short`位于`--ease-out`上：字母或链接变为红色，海报比例的值交换到位。没有滚动显示，没有视差。

## Voice ·嗓音

准确、简单的句首字母大写：按照目录列出的顺序命名记录、字段、年份和出版社，并省略形容词。

## Do-nots ·不该做的事

-切勿将规则置于部分上方、控件周围或盒装卡片周围的黑色笔画。
-群青上永远不会有红色，永远不会有两个区域接触，永远不会有第二个蓝色。
-绝不是小写或全大写的头。
-切勿用彩色照片、现场色照片、加框照片或底色照片。
-绝不是居中的头部或居中的文本块。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Radio+Canada+Big:wght@400;700&family=Radio+Canada:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1; text-align: start; }
.btn { min-height: 52px; padding-inline: var(--space-lg); border: 0; border-radius: 0; font-weight: 500; transition: background-color var(--dur-short) var(--ease-out); }
.btn--primary { background: var(--color-ink); color: var(--color-paper); }
.btn--primary:hover { background: var(--color-ink-2); }
.btn--secondary { background: none; color: currentColor; text-decoration: underline var(--rule-hair); text-underline-offset: 0.32em; }
.btn--secondary:hover { color: var(--color-mark); }
.field { background: var(--color-field); color: var(--color-field-ink); --color-focus: var(--color-field-ink); }
.field--mark { background: var(--color-mark); color: var(--color-mark-ink); --color-focus: var(--color-ink); }
.overprint { color: var(--color-field-ink); clip-path: inset(0 0 0 calc(7 * (100% + var(--gap-columns)) / 12 - var(--gap-columns))); }
.wordmark { display: inline-grid; grid-template-columns: auto auto; column-gap: var(--space-sm); font: var(--display-weight) var(--text-md)/0.92 var(--font-display); }
.wordmark::before { content: ""; grid-row: span 2; aspect-ratio: 1; background: var(--color-mark); }
::selection { background: var(--color-mark); color: var(--color-mark-ink); }
```
