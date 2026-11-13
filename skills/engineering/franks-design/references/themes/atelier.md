---
name: Atelier
slug: atelier
genre: editorial
paper: light 94.5 76
display: roman-serif Sentient
accent: cool 248
posture: restrained
keywords: fashion, atelier, couture, fragrance, gallery, exhibition, museum, ceramics, furniture, homeware, architecture, design studio, lookbook, collection, craft, small-batch, made by hand, brand story, luxury, object, hotel, boutique hotel, hospitality, stay
material: limewash paper under a slow luminous air, deep umber ink, Sentient light over Hanken Grotesk, cotton card stock with fibre and pressed type, hairlines, matted prints in warm daylight, one cool slate signal
photo: warm con=-6 vib=-10
pictured: Gallery Hang, Diffusion hero
---

# 工作室

制造商的目录记录在静止的空气中：石灰水纸，背后有一层缓慢的、发光的薄雾，深棕色墨水，头部和陈述中的Sentient光，用于阅读的汉肯格罗泰斯克，发际线，一块石板信号几乎和墨水一样暗。房子里递给你的东西（样品条、卡片、编号印刷品）都是用棉质材料制成的，从左上方点燃，用压制的字体和纤维制成。不是带有细细奢华衬线的奶油色页面，不是带有蓝色按钮的产品页面。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(94.5% 0.010 76); --color-paper-2: oklch(91.8% 0.013 74); --color-paper-3: oklch(88% 0.015 72);
  --color-ink: oklch(19% 0.024 52); --color-ink-2: oklch(31% 0.018 54); --color-muted: oklch(47% 0.014 60);
  --color-rule: oklch(81% 0.011 70);
  --color-accent: oklch(41% 0.075 248); --color-accent-ink: oklch(96% 0.008 76); --color-focus: oklch(50% 0.095 248);
  --color-card: oklch(97.6% 0.007 82); --color-card-edge: oklch(86% 0.012 72); --color-pencil: oklch(52% 0.010 62);
  --card-lit: oklch(98.4% 0.006 84); --card-shade: oklch(96.4% 0.008 78); --lit: oklch(99.6% 0.004 85 / 0.9);
  --stain-1: oklch(70% 0.075 14); --stain-2: oklch(66% 0.055 132); --stain-3: oklch(60% 0.080 58); --stain-4: oklch(68% 0.045 206);
  --font-display: "Sentient", Georgia, serif; --font-body: "Hanken Grotesk", system-ui, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 3px; --rule-hair: 1px; --rule-head: 1px;
  --shadow-card: 0 0 0 1px oklch(30% 0.03 55 / 0.05), 0.5px 1px 1px oklch(30% 0.03 55 / 0.08), 3px 8px 14px -6px oklch(30% 0.03 55 / 0.14), 14px 36px 64px -28px oklch(30% 0.03 55 / 0.3);
  --tracking-display: -0.018em; --tracking-statement: -0.022em; --display-weight: 300; --statement-weight: 300; --serif-small: 400;
}
```

## Type ·类型

- **显示和声明：** Sentient 300每个头和`--text-display-s`或更大的句子或图形，行高1.02至1.1，句子大小写，罗马。头部有一种重量和一种颜色。
- **小衬线：** `h3`的Sentient 400、卡片上的姓名、日期、条目数字；从来没有在16px下，从来没有一个段落。
- **主体：** Hanken Grotesk 400，线高1.6，`--color-ink-2`。每页三个权重：Sentient 300和400、Hanken 400。
- **标签：**墙标签：Hanken 400小了一步，句首字母大写，未跟踪；墨水中的物体，`--color-muted`中的材料或编号。编号版本是用铅笔书​​写的：手部的空白规则，然后是运行，在`--color-pencil`中。

## Surfaces ·表面

-空气：页面后面有一个固定的WebGL场，域扭曲的噪声在奶油色和浅琥珀色的面纱中向上飘移，混合在线性光中，以一半尺寸渲染；指针的最近路径将其分开，并且选定的项目将其着色。它通过首屏主图和一两个区域来显示；纸部分覆盖它。同一场的静止帧是后备。从来不是渐变斑点，从来不是照片。
-纹理生成为feTurbulence数据URI：`--grain` (180px, 1.15)在空中乘以0.16，`--fibre` (220px, 0.85)在所有卡片纸上。
-卡片纸：`--color-card`、2px角、`--shadow-card`中的棉质，左上方嵌入发光边缘，`--color-card-edge`中嵌入内发丝框架14px；在其上键入(a 1px lit text shadow below)。
-样品条：带有尖头的细棉吸墨纸，该物品的污渍从尖端吸走，名字印得小而垂直。它们从头部旁边的铆钉上散开，作为标签挂在导轨上（选择的标签放在一根线上），或者塞在卡片后面。
-成行的发际线；将在墨水`--rule-head`规则上打开表格或列表。照片：静物和温暖日光下的房间，挂有墙上标签的方形；主图是印在薄棉垫上的，有细斜角，下面用铅笔标注了版本。

## Range ·范围

- **声明：** Sentient 300中的提示的一个句子跨越九列或十列、铅笔编辑线和在石板下沉上打开的墙壁文本段落。
- **作为条带的选择：**作为导轨上的吸墨纸的集合，每个都是真正的标签；所选择的掉落物，其图片和旁边的墙标签。
- **时间表：**天或小时作为墨水规则下的规则表，Sentient 400中的名称，关闭的行静音，从未删除。
- **作为卡片的预订：**棉质凸版印刷卡片的形式：按下公司名称，带环的日期选择器（围绕所选日期的盲印），雕刻的时间芯片，用于书写的格线，塞在后面的条带。

## Controls ·控制

- 3px处的细线轮廓控件（悬停填充墨水、纸质文本）位于带下划线的下划线链接旁边。没有颜色填充控件。
-卡片纸上的选项被压入：左上方嵌入阴影，下方发光边缘；选择的是1px墨环。卡片上的字段是格线上的标签。
-板岩保持在屏幕的4%以下：下划线、首字下沉、对焦环。

## Motion ·运动

字体后淡入；`--ease-out`上的条带在`--dur-long`上展开一次；空气飘移，零件和色彩，在屏幕外暂停。减少动作并且没有脚本：静止的空气，选择的第一个项目。

## Voice ·嗓音

手工设置，物体精确：物体、材料、制造数量、门打开的天数。没有最高级的说法，永远不要“立即购买”或“发现”。

## Do-nots ·不该做的事

-绝不是温暖的口音；信号在色度0.09下呈冷板岩状。
-切勿采用大胆或高对比度的头像；有知觉的光承载着声音。
-切勿为连续文本添加衬线。
-绝不是平坦的白卡或模糊的玻璃面板；卡片纸有纤维、发光边缘和左上角的一盏灯。
-从来没有两幅同尺寸并排的静物画。

## Build hint ·构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=sentient@300,400&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400&display=swap" rel="stylesheet">
```

```css
body { color: var(--color-ink-2); line-height: 1.6; }
h1, h2 { font-weight: var(--display-weight); color: var(--color-ink); } h3 { font-weight: var(--serif-small); }
.ruled { border-top: var(--rule-head) solid var(--color-ink); } .ruled > * + * { border-top: var(--rule-hair) solid var(--color-rule); }
.dropcap::first-letter { float: left; font: var(--serif-small) 3.3em/0.8 var(--font-display); padding: 0.1em 0.1em 0 0; color: var(--color-accent); }
.btn { min-height: 52px; border: var(--rule-hair) solid var(--color-ink); border-radius: var(--radius-pill); padding: 0 var(--space-lg); color: var(--color-ink); background: transparent; transition: background-color var(--dur-short) var(--ease-out), color var(--dur-short) var(--ease-out); }
.btn:hover { background: var(--color-ink); color: var(--color-paper); }
.stock { border-radius: 2px; background: var(--fibre) 0 0 / 220px, linear-gradient(160deg, var(--card-lit), var(--color-card) 55%, var(--card-shade)); box-shadow: var(--shadow-card), inset 1px 1px 0 var(--lit); text-shadow: 0 1px 0 var(--lit); }
.stock::before { content: ""; position: absolute; inset: 0.875rem; border: var(--rule-hair) solid var(--color-card-edge); }
.air::after { content: ""; position: absolute; inset: 0; background-image: var(--grain); background-size: 180px; opacity: 0.16; mix-blend-mode: multiply; }
```
