---
name: Ribbon
slug: ribbon
genre: atmospheric
paper: light 98.5 85
display: grotesk-sans Instrument Sans
accent: chromatic-teal 190
posture: committed
keywords: sleep, sound, soundscape, audio, night, rest, calm, wellness, meditation, white noise, ambient, listen, headphones, wind down, bedtime, quiet, breathing, app, subscription
material: warm off-white or blue-black night, Instrument Sans at a quiet weight over Figtree, machined parts lit from above, the hour drawn as light on a generated canvas, one signal
photo: muted sepia=14
pictured: Night Notes, Stage hero, in the two-in-the-morning colourway
---

# 丝带

睡觉前一小时，安静地设置：Instrument Sans为400，直立且紧密设置，适合每个头部，Figtree为柔和的灰色用于阅读，发际线规则而不是方框，夜晚本身在机器后面以慢光绘制，真正设定了级别。平静来自于光型、慢光和做工精良的部件。它不是一光鲜亮丽的健康应用程序，也不是一布满星星和月亮的天空。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(98.2% 0.008 82); --color-paper-2: oklch(95.8% 0.011 82); --color-paper-3: oklch(92.3% 0.014 82);
  --color-ink: oklch(18% 0.006 80); --color-ink-2: oklch(30% 0.008 80); --color-muted: oklch(47% 0.012 80);
  --color-rule: oklch(89.5% 0.011 82); --color-rule-2: oklch(93.5% 0.009 82);
  --color-accent: oklch(44% 0.075 190); --color-accent-soft: oklch(92% 0.028 190); --color-accent-ink: oklch(98% 0.006 85); --color-focus: oklch(52% 0.09 190);
  --color-band: oklch(26% 0.045 195); --color-band-ink: oklch(94% 0.012 85);
  --color-slot: oklch(69% 0.07 80);
  --metal-hi: oklch(97% 0.006 85); --metal-lo: oklch(85% 0.01 85);
  --edge-light: inset 0 1px 0 oklch(100% 0 0 / 0.5);
  --shadow-part: 0 1px 0 oklch(20% 0.01 80 / 0.25), 0 10px 18px -6px oklch(20% 0.01 80 / 0.3);
  --shadow-panel: 0 1px 0 oklch(20% 0.01 80 / 0.2), 0 24px 48px -16px oklch(20% 0.02 80 / 0.35);
  --font-display: "Instrument Sans", ui-sans-serif, system-ui, sans-serif; --font-body: "Figtree", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 20px; --radius-part: 6px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: none;
  --tracking-display: -0.035em; --display-weight: 400;
}
```

一枚表盘、配色，在设计记录(`ribbon: two-in-the-morning`)中注明。口音是唯一亮起的东西；`--color-slot`是洗照片；`--color-accent-soft`是推子轨道或压制药丸，禁止打字。

|配色|纸|墨水|口音，金属|
| --- | --- | --- | --- |
| `dawn`（默认）| `oklch(98.2% 0.008 82)` | `oklch(18% 0.006 80)` |青色`oklch(44% 0.075 190)`；铝如上，夜色画在`--color-band`上|
| `two-in-the-morning` |蓝黑色`oklch(13.2% 0.022 258)`，纸2 16.4%，规则27% | `oklch(93.5% 0.012 85)`，静音`oklch(72% 0.02 255)` |亮起的窗口，琥珀色`oklch(82% 0.095 68)`，带有`oklch(20% 0.03 62)`文本；金属`oklch(44% 0.012 255)`至`oklch(25% 0.014 255)`，黑色阴影|
| `moss` |贤者`oklch(89% 0.034 140)` | `oklch(22% 0.03 150)` |赭色`oklch(48% 0.115 70)`；水洗深青色`oklch(46% 0.07 195)` |

## Type ·类型

- **显示：** Instrument Sans 400，直立，`--tracking-display`，行高1.04，句首字母大写，一种颜色；小标题（面板名称、文字标记）为500。大数字和水平面也占据了显示面，衬里和表格。
- **主体：** Figtree 400，位于17px，行高1.6，位于`--color-muted`；Figtree 500用于零件的名称和值。
- **标签：** Figtree 500更小一步，句子大小写，未跟踪，`--color-muted`，数值表格。

## Surfaces ·面

-首屏地面是在生成的画布上绘制为光的时间（黎明时分，在`--color-band`上）：细小的缓慢条纹表示雨，长而柔和的线条表示风，低地平线上的一排远处的点亮点，无论提示的声音是什么，在CSS天空到陆地渐变上。头后面无照片，也没有星星或月亮。
-机加工零件从上方照明：`--edge-light`和`--shadow-panel`从上到下渐变的面板；一凹进的床（插入阴影），装有带滚花帽的垂直推子（`--metal-hi`至`--metal-lo`，细条纹握把，发光的强调索引线），一凹陷的槽，其发光填充到​​水平，刻度线两侧；任何定时的可拖动曲线，带有金属手柄。
-生成纹理：160px画布噪点图块通过脚本设置为`--grain`，`soft-light`为0.35至0.55，仅在夜间和面板中。
-阅读部分中的规则，而不是框：1px `--color-rule`细线。半径：控制丸，零件`--radius-part`，面板`--radius-card`。
-照片：夜晚静止而封闭（一扇窗户、一盏灯、一列远处的火车）；光线昏暗，无人。`--radius-card`，无边框。

## Range ·范围

- **作为首屏的仪器：**该产品的控件构建为一加工面板，在单行头旁边，在漫长的夜晚确实有效。
- **行作为级别列表：**每个部分在发际线显示面上的名称，其在Figtree中的线，其级别作为显示图形；旁边应用程序框架中的同一面板已同步。
- **时间作为一条绘制的曲线：**夜间发生的变化被绘制为横跨宽度的线条，标记时刻的柱子，下面表格无花果树中的水平。
- **地平线下的价格：**显示面中的数字位于同一块土地上的8至10rem和点亮的行、一条无花果树线、点亮的药丸。

## Controls ·控制

-机加工药丸，52px：具有`--edge-light`和`--shadow-part`的从上到下渐变，1px边框；主要是强调，从内部用嵌入式高光照亮。主动按下1px。开关是一带有金属旋钮的药丸轨道，打开时会点亮口音。
-推子和曲线是真实输入（`role="slider"`，键盘步骤）。仅在按“聆听”后才播放声音，再按“停止”或“Esc”结束声音。
-重点位于主旋钮、聚焦环、推子发光、索引线和一图形上。

## Motion ·运动

缓慢而呼吸，`--dur-long`在`--ease-in-out`上。最多1个环境画布和1个CSS循环，两者都在屏幕外暂停；水平缓和，永不跳跃。减少动作，没有脚本：一安静的夜晚，每个部分都处于样本水平。

## Voice ·嗓音

平静而具体：时间、声音、声音有多大。无保证完美的睡眠。

## Do-nots ·不该做的事

-禁止用斜体或重头；显示屏在400和500处保留直立。
-无星空、月亮、海军蓝到紫罗兰色的渐变或库存睡眠。
-仪器上禁止用塑料或扁平控件；零件经过加工，从上方照明，一盏灯。
-无绘制波形或均衡器；电平存在于推子和线路上。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&family=Figtree:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: 400; font-synthesis: none; line-height: 1.04; }
.btn { min-height: 52px; padding: 0 var(--space-lg); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-pill); background: linear-gradient(var(--color-paper-2), var(--color-paper-3)); box-shadow: var(--edge-light), var(--shadow-part); color: var(--color-ink); font: 500 var(--text-md)/1 var(--font-body); }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.btn:active { transform: translateY(1px); }
.panel { border-radius: var(--radius-card); background: linear-gradient(var(--color-paper-2), var(--color-paper-3)); box-shadow: var(--edge-light), var(--shadow-panel); }
.cap { border-radius: var(--radius-part); background: linear-gradient(var(--metal-hi), var(--metal-lo)); box-shadow: var(--edge-light), var(--shadow-part); }
.grain { background-image: var(--grain); background-size: 160px; mix-blend-mode: soft-light; opacity: 0.4; }
a:hover { text-decoration-color: var(--color-accent); }
```
