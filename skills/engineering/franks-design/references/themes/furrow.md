---
name: Furrow
slug: furrow
genre: modern-minimal
paper: light 96 85
display: grotesk-sans Red Hat Display
accent: warm 40
posture: committed
keywords: farm, agriculture, land, field, livestock, sheep, cattle, crop, records, compliance, inspection, fleet, field service, rural, contractor, hectares, yard, outdoors, seasonal, working, units
material: warm manila paper, near-black ink in rules, a generated survey map in sienna contours and slate water, Red Hat Display 600 over Red Hat Text with Red Hat Mono figures, moulded 6px keys, a waterproof notebook card, one tangerine signal and a grass green for what is in date
photo: natural con=8 sat=-6
pictured: Field Record, Map hero
---

# 畦

工作记录在土地本身上绘制的声音：温暖的马尼拉纸，近乎黑色的墨水，和工作发生的地方生成的测量地图（轮廓，树篱，墙壁，水，像产权图一样的橘子边缘的土地），记录固定在工作发生的地方。条目以防水笔记本页面的形式打开；其余的是规则列表、带有单位的数字和模制键。橘子是耳标和打包线；绿色是最新的。它不是田园生活方式页面，不是光鲜亮丽的仪表板，也不是卫星导航。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(96% 0.011 85); --color-paper-2: oklch(99.5% 0.005 85); --color-paper-3: oklch(92% 0.016 85);
  --color-ink: oklch(18% 0.006 60); --color-ink-2: oklch(28% 0.008 60); --color-muted: oklch(44% 0.012 60); --color-rule: oklch(88% 0.013 85);
  --color-accent: oklch(70% 0.19 40); --color-accent-ink: oklch(18% 0.006 60); --color-accent-soft: oklch(91% 0.05 50); --color-focus: oklch(60% 0.19 40);
  --color-green: oklch(48% 0.11 150); --color-green-soft: oklch(92% 0.04 150);
  --color-contour: oklch(62% 0.07 58); --color-water: oklch(60% 0.05 232); --color-hedge: oklch(50% 0.1 150);
  --color-grid: oklch(90% 0.014 85); --color-grid-strong: oklch(85% 0.018 85); --color-sheet: oklch(99.3% 0.004 85);
  --font-display: "Red Hat Display", "Red Hat Text", ui-sans-serif, sans-serif; --font-body: "Red Hat Text", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Red Hat Mono", ui-monospace, monospace;
  --radius-card: 10px; --radius-entry: 14px; --radius-pill: 6px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(18% 0.006 60 / 0.08), 0 14px 28px -16px oklch(18% 0.006 60 / 0.28);
  --shadow-lift: 0 1px 1px oklch(18% 0.006 60 / 0.1), 0 2px 4px -1px oklch(18% 0.006 60 / 0.1), 0 24px 44px -20px oklch(18% 0.006 60 / 0.42);
  --tracking-display: -0.035em; --display-weight: 600;
}
```

## Type ·类型

- **显示：** Red Hat Display 600，`--tracking-display`，行高1.0，句首字母大写；报价中的价格按显示尺寸设置；44px处的条目时间，表格。
- **正文：** Red Hat Text 400，行高1.55，`--color-muted`；行标题为500。
- **标签、芯片、标签：** Red Hat Text 500更小，句子大小写，未跟踪。决不单声道，决不大写。
- **数字（单色作为材料）：** Red Hat Mono 400和500，表格，比旁边的文本小一步，仅适用于复制到表格上的内容：日期、时间、标签编号、剂量、批次、公顷。在地图上以Red Hat Text 500的方式放置名称，句子大小写，像测量员一样沿其字段设置。

## Surfaces ·表面

-测量地图是在加载和调整大小时在画布上生成的，而不是图片：通过`--color-contour`中的行进方块从噪音中追踪出轮廓，每五分之一重并标记；篱笆点缀在`--color-hedge`，墙壁固墨，水在`--color-water`，建筑物孵化，巷子和验收规则；持有的边缘呈橘红色。纸张纹理、纤维和两条折痕仅绘制到地图中。其静止帧是无脚本的后备。
-地图上：三种形状的图钉（圆盘、菱形、三角形）用于记录各种类型，每个图钉旁边有一个墨水标签，标有时间；打开的变成橘子色；运动绘制为虚线路线。地图放大镜(1.9x, fine ring, reticle)放在一个地标上并滑向指针。
-笔记本卡：`--radius-entry`处的`--color-paper-2`，1px墨环和`--shadow-lift`，带有种类和时间的墨头，然后是由1px墨线分隔的8px `--color-grid`笔记本网格上的单元，和脚部的56px步进键。
-导出的记录是一张平开的信纸折叠纸：`--color-sheet`、3px角，两条折痕从上方照亮。
-规则：列表上的1px墨迹规则、行之间的`--color-rule`细线、总计上的2px墨迹规则。只有卡片和白纸浮起。
-照片：正常天气中距离拍摄；自然，绝不是黄金时段；10px半径，或墨水稀松布下的全出血。

## Range ·范围

- **地图上的日期：**条目固定在发生的位置，其中一个作为笔记本卡打开。
- **这本书作为索引：**白纸上的规则表，上面日志的分段过滤器，日期和提款的芯片。
- **一天一小时：**按小时记录为行，每个条目都有一个带有标签的图钉。
- **土地上的账单：**价格为橘子田上的格线、带有树篱的轮廓片段、门和后面的一根别针。

## Controls ·控制

- 6px、48px高的模制按键：带有墨水文字的主橘色、亮色嵌入顶部边缘和阴影嵌入底部；带有1px `--color-rule`边框和相同发光边缘的次白色。有源水槽1px。
-字段将其标签放在框内，左上角小且静音，值位于下方；白色，52px，1px `--color-muted`边框；图形字段设置为单声道。
-橘子色是填充有墨水的：主色、选定的选项卡、打开的引脚、保持边缘、区域带、聚焦环。

## Motion ·运动

一旦出现在视野中：别针按时间顺序落地，绘制路线，打开卡片，放置放大镜。变换和不透明度，`--ease-out`，在屏幕外暂停。减少动作或无脚本：固定住，打开一个条目。

## Voice ·嗓音

普通和单位轴承：3.6公顷，10毫升，28天，价格上有英镑符号。从来没有一个没有单位的数字，从来没有一个田园形容词。

## Do-nots ·不该做的事

-切勿以橘子为类型；它上面充满了墨水。
-绝不是地图图块、卫星照片或大头针图标；该土地是生成的调查。
-切勿在地图外出现纹理或折痕。
-切勿在标签、芯片或磁头上用单色。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600&family=Red+Hat+Text:wght@400;500&family=Red+Hat+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1; }
.btn { min-height: 48px; border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-pill); padding: 0 var(--space-lg); font-weight: 500; background: var(--color-paper-2); color: var(--color-ink); box-shadow: inset 0 1px 0 var(--color-sheet), 0 1px 1px var(--color-rule); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); border-color: color-mix(in oklab, var(--color-accent) 78%, var(--color-ink)); box-shadow: inset 0 1px 0 color-mix(in oklab, var(--color-sheet) 32%, transparent), inset 0 -1px 0 color-mix(in oklab, var(--color-ink) 10%, transparent); }
.btn:active { transform: translateY(1px); }
.ruled { border-top: var(--rule-hair) solid var(--color-ink); } .ruled > * { border-bottom: var(--rule-hair) solid var(--color-rule); }
.entry { border-radius: var(--radius-entry); background: var(--color-paper-2); box-shadow: 0 0 0 1px var(--color-ink), var(--shadow-lift); overflow: hidden; }
.notebook { background: linear-gradient(var(--color-grid) 1px, transparent 1px) 0 0 / 8px 8px, linear-gradient(90deg, var(--color-grid) 1px, transparent 1px) 0 0 / 8px 8px, var(--color-paper-2); }
.field label { position: absolute; left: var(--space-md); top: var(--space-xs); font-size: 0.75rem; font-weight: 500; color: var(--color-muted); }
.num { font-family: var(--font-outlier); font-variant-numeric: tabular-nums; }
```
