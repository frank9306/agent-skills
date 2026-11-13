---
name: Dusk
slug: dusk
genre: modern-minimal
paper: dark 17.5 268
display: grotesk-sans Wix Madefor Display
accent: cool 274
posture: committed
keywords: treasury, banking, fintech, payments, reconciliation, ledger, accounting, close, month end, audit, balance, cash management, payouts, settlement, compliance, controller, bookkeeping, finance team, invoicing, payroll, overnight, automation
material: a real landscape at the turn of the light behind the hero, slate below it, the product in smoked glass with a lit top edge, Wix Madefor Display at a quiet weight over Wix Madefor Text, bone wells for light surfaces, one periwinkle signal and one apricot
photo: natural con=4 vib=6
pictured: Narrative Workflow, Stage hero
---

# Dusk

金融软件的黄昏。首屏用实拍黄昏风景作背景，在照片最浅处放深色标题，旁边用烟色玻璃展示产品。下方转为石板色，浅色区采用骨白凹面。精致从容，避开霓虹交易屏和拼贴式仪表盘。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(17.5% 0.014 268); --color-paper-2: oklch(21% 0.016 268); --color-paper-3: oklch(25% 0.017 268);
  --color-ink: oklch(96% 0.006 75); --color-ink-2: oklch(85% 0.010 262); --color-muted: oklch(70% 0.016 262);
  --color-rule: oklch(30% 0.016 266); --color-light: oklch(100% 0 0); --color-shade: oklch(10% 0.022 268);
  --color-accent: oklch(77% 0.10 274); --color-accent-ink: oklch(19% 0.035 274); --color-accent-hi: oklch(84% 0.085 274);
  --color-accent-deep: oklch(44% 0.13 274); --color-accent-soft: oklch(91% 0.038 274); --color-focus: oklch(80% 0.10 274);
  --color-accent-2: oklch(83% 0.095 62); --color-dusk: oklch(70% 0.12 330);
  --color-day-ink: oklch(22% 0.022 268); --color-day-muted: oklch(38% 0.022 266); --color-fog: oklch(94% 0.012 70);
  --color-well: oklch(95.5% 0.008 75); --color-well-2: oklch(92% 0.010 75); --color-well-ink: oklch(21% 0.016 268); --color-well-muted: oklch(47% 0.016 265); --color-well-rule: oklch(87.5% 0.009 75); --color-card: oklch(99.5% 0.003 75);
  --glass: oklch(22% 0.018 268 / 0.58); --glass-blur: 22px;
  --glass-hi: inset 0 1px 0 oklch(100% 0 0 / 0.10), inset 0 0 0 1px oklch(100% 0 0 / 0.06);
  --shadow-card: 0 1px 0 oklch(100% 0 0 / 0.06) inset, 0 40px 80px -32px oklch(8% 0.02 268 / 0.7);
  --font-display: "Wix Madefor Display", ui-sans-serif, system-ui, sans-serif; --font-body: "Wix Madefor Text", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 18px; --radius-inner: 10px; --radius-pill: 999px; --rule-hair: 1px;
  --tracking-display: -0.022em; --display-weight: 500;
}
```

三个表盘，每个表盘均带有设计记录(`dusk: fog/periwinkle-apricot/glass`)；一次运行中的两个Dusk页面有两处不同。

|拨号|选项|
| --- | --- |
| **小时**（首屏照片）| `fog`（默认）：杏色天空下的雾谷。`shore`：黄昏时的水、船只或码头。`ridge`：黎明时雾霾中的山脊|
| **信号**（匹配，再打开）| `periwinkle-apricot`（默认）。`sage-apricot`：`oklch(80% 0.07 160)`作为第一信号|
| **产品面** | `glass`（默认）：石板上的烟色玻璃。`well`：骨井也携带首屏产品，玻璃仅覆盖照片|

## Type ·类型

- **显示器：** Wix Madefor Display 500，`--tracking-display`，行高1.02至1.1，句首字母大写。头脑保留谦虚；照片和产品是最重要处。
- **正文：** Wix Madefor Text 400和500，17px，行高1.55；`--color-ink-2`或`--color-muted`中的引线。
- **人物：**相同的面孔，`tabular-nums`；`--color-muted`中的美分尺寸相同，从未凸起。设置为报表的数字将在34处显示到44px的Display 500，其分值在0.6em。
- **标签、列标题、状态：**文本缩小500步，句子大小写，`--color-muted`。不单声道，不追踪大写字母。

## Surfaces ·面

- **时刻：**一张图书馆在光线转向时的土地照片充满了首屏，头部在`--color-day-ink`中最苍白处覆盖着雾稀松布（`--color-fog`在40到78%，径向，仅在文字后面），玻璃产品在其较暗的一侧，脚褪色为`--color-paper`。同一时间的第二张照片可能会关闭表格后面的页面；最多两个。
- **玻璃：**产品面，`--glass`模糊，`--glass-hi`为照亮边缘，`--shadow-card`。`--color-light`上的行内部分裂为7%；内部零件以`--radius-inner`的4至6%位于其上。
- **井：**光面是5:4的骨井，持有一白色的`--color-card`；标题位于其下方，包括一标题和一行静音线。
- **石板：**首屏下面的每个乐队都是`--color-paper`；一旦离开照片，导航就会变成石板玻璃。

## Range ·范围

- **作为帐户列表运行：**带有圆形首字母的帐户，静音的行数，带有图标的状态字，余额与静音的美分右对齐；打开的项目通过其操作将列表关闭为杏条。
- **作为一窗格旁边的列表的游览：**规则列表中的四个工作，选中一用长春花点标记并打开到一行，旁边的一玻璃窗格随之变化。
- **一月如一条长夜：**每天一根长春花色的细长圆形条，其高度表示已完成的工作，条形上方有一杏点标记的标记日，杏色的开放日，未来的日子即将孵化；其下有四位数字的规则计数。
- **井中交接：**产品发送的注释或消息，设置为真实的骨卡。

## Controls ·控制

-一颗长春花丸（`--color-accent-ink`下的`--color-accent`，顶部边缘有浅色插图）；悬停升降机至`--color-accent-hi`，带有柔软的长春花环。`--color-light`旁边有一颗鬼丸，浓度为4%。
-电子邮件字段及其按钮共享一药丸：照片上的磨砂雾，石板上的烟色玻璃。
-选项卡是带有点的规则列表，而不是盒装段。开关打开时呈浅紫色。
-两个信号，两项工作：长春花已完成、匹配、开启并聚焦；杏子开放，等待或欠下。两者都不是一大填充。

## Motion ·运动

首屏照片在48秒内漂移了6%；产品的行一次升起，交错；空心点会呼吸；窗格交叉淡入淡出；当人们看到时，它们的脚上就会长出杠铃。减少动态效果：一切静止。

## Voice ·嗓音

冷静而准确：跑了什么、什么时候跑、还剩下什么。

## Do-nots ·不该做的事

-永远不要绘制或生成天空，也不要在照片的繁忙部分上添加文字。
-禁止用渐变按钮、第三种信号颜色或红色借方。
-绝不是统计图块的网格；数字以行、列表和一规则的计数形式存在。
-绝不是玻璃上的玻璃，绝不是玻璃后面的发光，绝不是没有边缘发光的玻璃。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Display:wght@400;500;600&family=Wix+Madefor+Text:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); }
.num { font-variant-numeric: tabular-nums; } .num .c { color: var(--color-muted); }
.glass { background: var(--glass); border-radius: var(--radius-card); -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.35); backdrop-filter: blur(var(--glass-blur)) saturate(1.35); box-shadow: var(--glass-hi), var(--shadow-card); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); font: 600 0.9375rem/1 var(--font-body); box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-light) 35%, transparent); }
.btn:hover { background: var(--color-accent-hi); }
.hero__photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__scrim { position: absolute; inset: 0; background: radial-gradient(ellipse 50% 58% at 20% 56%, color-mix(in oklab, var(--color-fog) 78%, transparent), transparent 78%), linear-gradient(to bottom, transparent 72%, var(--color-paper)); }
```
