---
name: Coral
slug: coral
genre: modern-minimal
paper: light 97 55
display: grotesk-sans General Sans
accent: warm 30
posture: restrained
keywords: saas, platform, billing, payments, invoicing, dashboard, b2b, startup, product, pricing, analytics, fintech, workflow, team, onboarding, trust, warm, human, calm
material: warm grey paper and a felt desk, cotton stationery lit from the left, General Sans throughout with Geist Mono figures, letterpress card controls, coral pressed into the stock for the one settled state
photo: muted sepia=8
pictured: Conversational FAQ, Desk hero
---

# 珊瑚

温暖、质朴的产品声音变得有形：毛毡桌子上的精美文具，在白天从左边俯视。记录是棉质床单、信封和带有真边的索引卡；控件是凸版印刷卡；一种珊瑚墨被压在有东西沉淀的地方。通篇都是General Sans。不是奶油色的编辑页面，不是拟物化的玩具，不是蓝色的SaaS模板。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(97% 0.006 55); --color-paper-2: oklch(94.5% 0.007 55); --color-paper-3: oklch(91.5% 0.009 55);
  --color-ink: oklch(21% 0.012 38); --color-ink-2: oklch(29% 0.013 40); --color-muted: oklch(47% 0.013 45);
  --color-rule: oklch(87% 0.009 55); --color-rule-2: oklch(81% 0.011 55);
  --color-accent: oklch(74% 0.125 30); --color-accent-ink: oklch(21% 0.012 38); --color-accent-2: oklch(54% 0.165 29); --color-focus: oklch(54% 0.17 30);
  --color-cotton: oklch(98.8% 0.0045 80); --color-desk: oklch(94.3% 0.008 64); --color-print: oklch(23% 0.012 38);
  --color-board: oklch(22% 0.011 40); --color-board-type: oklch(96.5% 0.006 70); --color-paid: oklch(55.5% 0.15 33);
  --tex-cotton: url("cotton.svg"); --tex-desk: url("felt.svg");
  --shade: 32% 0.03 50; --lit: 100% 0.005 80; --deep: 7% 0.01 40;
  --font-display: "General Sans", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 8px; --radius-input: 6px; --radius-pill: 999px; --radius-stock: 8px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(20% 0.01 35 / 0.05);
  --edge-stock: inset 0 1px 0 oklch(var(--lit) / 0.9), inset 0 -1px 0 oklch(var(--shade) / 0.07), 0 0 0 0.5px oklch(var(--shade) / 0.22), 0 1px 0 oklch(var(--shade) / 0.12);
  --cast-stock: 6px 5px 10px -6px oklch(var(--shade) / 0.3); --cast-stock-lift: 12px 10px 18px -8px oklch(var(--shade) / 0.3);
  --press-groove: inset 1px 1.5px 2px oklch(var(--shade) / 0.16), inset -1px -1px 0 oklch(var(--lit) / 0.9), 0 0 0 0.5px oklch(var(--shade) / 0.2);
  --tracking-display: -0.03em; --display-weight: 600;
}
```

## Type ·类型

- **显示：** General Sans 600、`--tracking-display`、行高1.02至1.08、句首字母大写、罗马字体。单独的价格设定为`--text-display`的两到三倍，跟踪-0.05em，行高0.85，其旁边的单位为500中的`--text-title`。
- **主体：** General Sans 400和500。有现货，`--color-print`；船上，`--color-board-type`。
- **标签：** General Sans 500缩小一步，句子大小写，`--color-muted`。
- **一栏中的数字：** Geist Mono 400（General Sans没有表格数字）。句子或头部中的价格仍保留General Sans。

## Surfaces ·面

-一盏灯，从左边开始：每个纸质物体的顶部和左侧都有一亮边，底部和右侧有一阴影边缘，和一右侧的铸件（`--edge-stock`、`--cast-stock`）。
-首屏地面是一张桌子：`--color-desk`，在来自左侧的日光辐射和生成的毛毡纹理下。产品手柄作为文具记录在其上：棉质床单上的发票、信件和报表、带有显示地址的玻璃纸的窗口信封、作为信件索引卡的答复、压入卡片的凹槽。每个都是`--color-cotton`上的CSS，尺寸以一单位为单位，因此可整体缩放。
-生成纹理，而不是图片：构建每个纸质对象上的从亮到暗的渐变下写入`cotton.svg`，这是由两个缝合的feTurbulence层(cloud 0.011, grain 0.92, warm and faint)组成的360px拼贴，具有短纤维笔划；`felt.svg`相同，为0.018。各部分保留简单。
-固定状态（已付款、已签名、已预订）被压入库存：`--color-paid`中的General Sans 600中的单词，通过SVG过滤器将阴影墙偏移到字母形式中，并让噪声遮罩使墨水不均匀，倾斜几度。
- `--color-ink`带、板1个；其上的文具由`--deep`铸成。
-照片很少见：在白天工作，保留一定距离，静音；先建文具答案。

## Range ·范围

- **这项工作就像文书工作一样：**产品的任务在桌子上自己的文档中讲述（一张纸放入信封中，一张回复卡塞在下面，将结果压入），内置在首屏中并在下面重复用。
- **作为索引记录：**将回复、预订或客户作为棉质索引卡，在整张纸上的记录旁边堆放有胶印标签。
- **标牌上的价格：**纸上巨大的数字，旁边是一份规定的价格清单；动作位于带子上的信纸上（信封盖、卡片）。
- **另一面：**接收者所看到的，建立在棉花上，凹槽控制现场重写它。

## Controls ·控制

-凸版卡片，非药丸：8px半径，48px高，带有`--edge-stock`和`--cast-stock`的棉质材料和压入的标签（下方有亮起的文字阴影）；主要是墨板，标签以相反的方式压紧。悬停将1px吊入`--cast-stock-lift`；主动按下1px。
-可选择两到四个，即在棉花(`--press-groove`, 12px radius)中压入凹槽，并在其中放置棉花卡至选定的停止位置。
-输入48px、6px半径、1px `--color-muted`边框、深珊瑚焦点。状态是墨迹轮廓；珊瑚仅用于按下固定状态，链接下划线和焦点。

## Motion ·运动

有一次，在字体加载并查看之后：作业在桌面上播放大约六秒钟，仅做变换和不透明度，在屏幕外暂停，再静止。减少了运动并且没有脚本显示完成状态。

## Voice ·嗓音

关于工作和金钱的简单、温暖的第二人称句子：谁、多少钱、何时、产品做了什么。从来不可爱。

## Do-nots ·不该做的事

-禁止冷却纸张、蓝色信号灯或第二盏灯；每个影子都落在正确的位置。
-禁止用药丸按钮或扁平方形按钮；控件是压卡的。
-绝不是纸质照片；文具是用CSS构建的。
-禁止将珊瑚用作带、文字或头部后面的填充物；它是一种固定状态的压制墨水。

## Build hint ·构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); }
.desk { background-color: var(--color-desk); background-image: radial-gradient(90% 120% at 0% 30%, var(--color-cotton), transparent 62%), var(--tex-desk); }
.stock { background-color: var(--color-cotton); background-image: linear-gradient(100deg, var(--color-cotton), transparent 45%), var(--tex-cotton); color: var(--color-print); box-shadow: var(--edge-stock), var(--cast-stock); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-stock); font-weight: 500; transition: transform var(--dur-short) var(--ease-out); }
.btn--card { background-color: var(--color-cotton); background-image: var(--tex-cotton); color: var(--color-print); text-shadow: 0.5px 0.75px 0 var(--color-cotton); box-shadow: var(--edge-stock), var(--cast-stock); }
.btn--ink { background: var(--color-board); color: var(--color-board-type); text-shadow: 0 -0.75px 0 var(--color-ink); box-shadow: var(--cast-stock); }
.btn:hover { transform: translateY(-1px); box-shadow: var(--edge-stock), var(--cast-stock-lift); } .btn:active { transform: translateY(1px); }
.fig { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; }
a:hover { text-decoration-color: var(--color-accent-2); }
```
