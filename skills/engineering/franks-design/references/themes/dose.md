---
name: Dose
slug: dose
genre: modern-minimal
paper: light 97.6 88
display: grotesk-sans Schibsted Grotesk
accent: chromatic-green 160
posture: committed
keywords: health, medication, pharmacy, care, carer, family, reminders, schedule, app, mobile, medicine, patients, clinic, prescription, tracking, calm, trust, routine, elderly, parents
material: warm morning paper with a fibre grain and window light, translucent tinted plastic, green-black ink, Schibsted Grotesk over Instrument Sans with DM Mono pharmacy labels, moulded controls, one pharmacy green
photo: natural sat=-15 con=-6
pictured: Care Register, Organiser hero
---

# 剂量

半透明塑料和日光：带有细纤维颗粒的温暖晨报，窗光照射在上面，像药盒一样的柔软有色塑料带，绿黑色墨水，Schibsted Grotesk头位于Instrument Sans上，DM Mono上显示时间和剂量，就像药房标签一样设置。一个药房绿色就可发出所有信号。它之所以值得信赖，是因为它准确、从容，而且它生活在厨房里，而不是诊所里。它不是临床蓝色门户，不是健康粉彩，也不是警报。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(97.6% 0.011 88); --color-paper-2: oklch(96.5% 0.02 160); --color-paper-3: oklch(93% 0.036 160);
  --color-ink: oklch(21% 0.025 170); --color-ink-2: oklch(31% 0.02 170); --color-muted: oklch(49% 0.024 165);
  --color-rule: oklch(86.5% 0.022 140);
  --color-accent: oklch(50% 0.13 160); --color-accent-deep: oklch(42% 0.11 162); --color-accent-soft: oklch(88% 0.08 160); --color-accent-ink: oklch(99% 0.006 160);
  --color-focus: oklch(45% 0.14 160);
  --p-mon: oklch(85% 0.052 22); --p-tue: oklch(87.5% 0.058 64); --p-wed: oklch(91.5% 0.064 98); --p-thu: oklch(86.5% 0.075 160);
  --p-fri: oklch(87% 0.048 210); --p-sat: oklch(84% 0.045 270); --p-sun: oklch(84% 0.048 322);
  --light: oklch(99.4% 0.016 84); --glint: oklch(100% 0 0);
  --font-display: "Schibsted Grotesk", ui-sans-serif, sans-serif; --font-body: "Instrument Sans", ui-sans-serif, sans-serif;
  --font-outlier: "DM Mono", ui-monospace, monospace;
  --radius-card: 14px; --radius-input: 10px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(30% 0.03 165 / 0.08), 0 24px 48px -24px oklch(40% 0.08 165 / 0.35);
  --shadow-lift: 0 1px 1px oklch(30% 0.03 165 / 0.10), 8px 18px 28px -14px oklch(36% 0.06 165 / 0.32), 18px 40px 60px -30px oklch(40% 0.08 165 / 0.30);
  --tracking-display: -0.03em; --display-weight: 700;
}
```

承诺：纸张是温暖的，绿色色调和塑料带有颜色，薄荷色（`--color-accent-soft`）标记了检查的内容，重点放在控件、焦点、设计记录和一个图形上。设计记录(`dose: white`)中注明的地面：**白色**（默认，上面的标记）、**绿色**（在白色墨水下浸湿`oklch(46% 0.12 160)`，内部表面白色，地面薄荷色），**夜间**（`oklch(96% 0.01 160)`下的`oklch(13% 0.01 170)`，40%光度的塑料，深色墨水薄荷色）。

## Type ·类型

- **显示：** Schibsted Grotesk 700，`--tracking-display`，行高1.02，句子大小写，衬里表格数字。
- **主体：** Instrument Sans 400和500，16至18px，行高1.5。
- **标签、标题、表格标题：** Instrument Sans 500更小，句子大小写。
- **时间、剂量、药房标签：** DM Mono 400和500 (`08:00`、`500 mg`)，采用句子内的文本大小，采用标题大小（其中时间表的第一列是时间），和药房标签的整体语音；绝不是选项卡、表头或显示图形。每页三种粗细：400、500、700。

## Surfaces ·表面

-生成了地面，而不是图片：纸张采用了分形噪声纤维颗粒（纸张颜色下的`feTurbulence`数据URI），首屏主图采用了窗户光，四个模糊的`--light`窗格在纸张上倾斜，漂移了90秒。
-塑料是表面：α值约为62%的色调（`--p-*`，从来不是一种状态），沿着顶部边缘的`--glint`线，底部更深的内部阴影，和它让穿过的彩色光在下面的纸上汇集和模糊。它生产带子、托盘和隔层；CSS 3D可能会将其中一组在纸上变成四分之三。
-标签是塑料纸质的：粒状白色，10px半径，虚线尺上有可撕下的存根，DM Mono通体，双环绿色设计记录旋转2度作为确认，注明时间和人物；错过或到期是相同的灰色。
- Radii读取为应用程序：10px控件、14px表面、标签上的999、大约28px的手机屏幕。`--shadow-lift`上的白色表面浮起；一条绿黑色墨水带可能带有一条声明。
-照片：注射剂量的家、柔和日光下的手和房间，绝不是面对镜头或诊所的脸；14px半径，下方有标题。

## Range ·范围

- **作为塑料带的序列：**每个阶段都有自己色调的全宽带，Schibsted中显示尺寸的数字，产品的两个电话屏幕，每个发生在DM Mono中的生产线旁边的那一刻。
- **作为标签的记录：**两个药房标签旁边的照片，一个以绿色标记，一个以灰色标记，每个标签都注明剂量、时间和人员。
- **墨带上的说明：** Schibsted 700中`--text-display`中的一句简单句子，其下方一行完好无损。
- **托盘中的第一步：**下沉式塑料托盘上的表格，选择塑料钥匙，旁边的产品屏幕实时应答。

## Controls ·控制

-模制塑料：10px处的52px控件，带有1px边缘，下方为3px边缘，顶部为`--glint`斜角，并带有柔和的投射阴影；按压时3px会下沉。初级是绿色塑料，次级是透明的。
-选择是塑料钥匙，检查后完好无损。悬停时链接会以绿色下划线显示。输入：52px位于10px，带有1px `--color-muted`边框。

## Motion ·运动

光线漂移超过90秒，然后在屏幕外暂停。一旦进入视野：盖子升起，标签升起，设计记录落地，滴答声向其他看到其人激起涟漪。减少动态效果或无脚本：最终状态，光线静止。

## Voice ·嗓音

药剂师的朴实，由一家人说出：姓名、剂量、时间、谁给的，用儿子或女儿（妈妈，你的兄弟）的话。从来没有一次旅程，从来没有红色警告。

## Do-nots ·不该做的事

-错过或迟到的状态绝不会呈红色或琥珀色；它是灰色的。
-切勿将塑料色调作为信号或第二品牌颜色；绿色代表所有信号。
-绝不是临床库存：溢出的药丸、特写的泡罩包装、白大褂。
-切勿用有光泽的玩具塑料：色调保持苍白，光线为日光，除了闪光和阴影之外没有渐变。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@700&family=Instrument+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: 700; letter-spacing: var(--tracking-display); line-height: 1.02; }
.btn { height: 52px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-input); font: 500 var(--text-md) var(--font-body); box-shadow: inset 0 1px 0 var(--glint), 0 0 0 1px var(--color-rule), 0 3px 0 var(--color-rule); transition: transform var(--dur-micro) var(--ease-out); }
.btn--primary { background: linear-gradient(var(--color-accent), var(--color-accent-deep)); color: var(--color-accent-ink); box-shadow: 0 0 0 1px var(--color-accent-deep), 0 3px 0 var(--color-accent-deep); }
.btn:active { transform: translateY(3px); }
.plastic { --t: var(--p-thu); position: relative; border-radius: var(--radius-card); background: linear-gradient(color-mix(in oklab, var(--glint) 32%, transparent), transparent 18%), color-mix(in oklab, var(--t) 62%, transparent); box-shadow: inset 0 1.5px 0 var(--glint), inset 0 -24px 36px -28px color-mix(in oklab, var(--t) 45%, var(--color-ink)); }
.dose, .label { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; }
.band--ink { background: var(--color-ink); color: var(--color-paper); }
```
