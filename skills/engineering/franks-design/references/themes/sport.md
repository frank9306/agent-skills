---
name: Sport
slug: sport
genre: editorial
paper: light 98 250
display: display-condensed Saira Condensed
accent: chromatic-volt 120
posture: restrained
keywords: running, marathon, race, training, fitness, gym, team, league, fixtures, standings, scoreboard, athletics, performance, splits, sportswear, club, match, tournament
material: cool concrete paper, blue-black ink, uppercase Saira Condensed over Albert Sans, condensed figures and mono times, two-weight rules, one volt fill
photo: duotone ink paper con=20
pictured: Stat-Led, Poster hero
---

# 运动

结果表材料：凉爽的混凝土纸、蓝黑色墨水、Albert Sans 主体上大写的 Saira Condensed 800、大压缩数字和 JetBrains Mono 时间、发际线和一个较重的条形规则，以及伏特作为唯一的颜色。 Volt 是一种填充物：墨水位于其上，但它永远不会在纸上留下字母。照片用墨水打印，就像比赛节目一样。它读起来很快，因为大写字母、数字和动作都是浓缩的，没有倾斜或梯度；这不是运动服广告，也不是霓虹灯游戏页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(98% 0.005 250); --color-paper-2: oklch(95% 0.006 250); --color-paper-3: oklch(91.5% 0.007 250);
  --color-ink: oklch(16% 0.080 260); --color-ink-2: oklch(22% 0.060 258); --color-muted: oklch(50% 0.020 250);
  --color-rule: oklch(78% 0.008 250); --color-rule-2: oklch(36% 0.060 255);
  --color-accent: oklch(88% 0.200 120); --color-accent-ink: oklch(16% 0.080 260); --color-accent-deep: oklch(58% 0.145 125);
  --color-focus: oklch(58% 0.145 125); --color-slot: oklch(76% 0.07 258);
  --font-display: "Saira Condensed", sans-serif; --font-body: "Albert Sans", ui-sans-serif, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 4px; --radius-pill: 4px; --rule-hair: 1px; --rule-bar: 2px;
  --shadow-card: none;
  --tracking-display: -0.015em; --display-weight: 800;
}
```

## Type · 类型

- **显示：** Saira Condensed 800，大写，`--tracking-display`，行高 1.02，直立，罗马。真正的压缩设计，即使在照片上按海报比例，帽子堆叠起来也不会拥挤；速度在大写字母内，绝不倾斜。
- **正文：** Albert Sans 400 和 500，句子大小写。
- **数字：** 声明尺寸（距离、字段尺寸、价格、日期） Saira Condensed 800 带有 `tabular-nums`，从 `--text-display-s` 向上，下面是 Albert Sans 的标签。在列和实时数据（时间、分割、围脖）中，JetBrains Mono 500 比其标签大一步或更多。 Mono 是一个秒表，而不是一个标签或一个头。
- **标签、说明文字、表格标题、单位：** Albert Sans 500 小一步，句子大小写，未跟踪，`--color-muted`；在伏特填充上，每个字都是墨水。

## Surfaces · 表面

- 两个规则权重，从不盒装卡片：`--color-rule` 中的 `--rule-hair` 规则行和网格； `--color-rule-2` 中的 `--rule-bar` 打开和关闭表格并中断一个部分。
- Radius 4px 控制、输入和照片；没有药片。
- 规则和纸阶的深度，永不阴影：一口井是条形规则下的 `--color-paper-2`。
- 绑带：`--color-paper-2` 绑带一根，或纸型 `--color-ink` 绑带一根；一页最多两个，从来没有一个伏带。
- 照片：在跑步者眼睛或下方拍摄的比赛照片：一个背包在大步前进，柏油路上的腿和鞋子，一条攀登山谷一侧的道路，一个数字被钉在上面；日光强烈，动作犀利，剪裁紧身，没有人摆姿势。用油墨印刷在纸张上（`photo:` 双色调），4px 半径，嵌入油墨发丝线位于 8% 处。照片上的文字是从其边缘覆盖在墨水稀松布上的纸张；伏特数字可以用事实（英里、时间）来支撑框架的一角。
- 没有纹理，没有渐变，只有照片的稀松布，没有硬偏移阴影。

## Range · 范围

- **数字中的竞赛：** 三到四个提示数字以压缩大写字母显示，显示尺寸在小节规则下，由细线分开，最多一个位于伏特填充上。
- **对比赛事实的有效控制：**墨带上的配速或时间规划器、显示尺寸的单色所选时间、在适当位置变化的规则网格中的每英里、以伏特为单位的终点单元。
- **结果以表格形式：** 小节规则打开和关闭单声道号码布和时间表，后面的跑步者的行举起了纸步及其最新的伏特分叉。
- **课程作为阶段：**开始到结束为一栏规则上的编号阶段，压缩大写标题和每行一行，现场阶段为伏特。

## Controls · 控制

- 控制对：一个带有墨水文本的伏特填充块，旁边是一个带有墨水边框的 2px，两者都是 4px，设置在显示面的大写字母中，没有添加跟踪；在照片上，第二个拿纸。
- 链接悬停在 (3:1 on paper) 上时会出现 `--color-accent-deep` 下划线；输入是 4px，带有 1px、`--color-rule` 边框和 `--color-focus` 环。
- 伏特始终是墨水下方和屏幕 5% 以下的填充：主要控件、活动行、一个突出显示的数字。

## Motion · 运动

除了状态和实时数据之外，没有任何东西在移动：悬停时链接下会出现一条深伏下划线，一行会抬起一个纸步，实时分割会在适当的位置发生变化，从不计数。没有透露，没有视差。

## Voice · 嗓音

比赛简报简单明了：距离、时间、地点，正如一位元帅所说的那样。祈使句首字母大写，句首大写在下，数字在单词之上，动词在形容词之上。

## Do-nots · 不该做的事

- 切勿使显示屏倾斜或倾斜；直立的浓缩帽是速度。
- 切勿将显示跟踪松开到零以上，或将其收紧直至两个大写字母接触。
- 切勿热纸；地面为冷混凝土，色调 250。
- 切勿使用伏特类型、纸上的伏特细线或第二重音；照片是用墨水打印的，而不是它们自己的颜色。
- 切勿绘制或拍摄奖牌、奖杯、领奖台或球衣的纹理；比赛就是道路和跑步者。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@800&family=Albert+Sans:wght@400;500&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); text-transform: uppercase; line-height: 1.02; }
.figure { font: var(--display-weight) var(--text-display)/0.9 var(--font-display); font-variant-numeric: tabular-nums; }
.time { font: 500 var(--text-2xl)/1 var(--font-outlier); font-variant-numeric: tabular-nums; }
.btn { border: var(--rule-bar) solid transparent; border-radius: var(--radius-card); padding: var(--space-sm) var(--space-lg); font: var(--display-weight) var(--text-md)/1.25 var(--font-display); text-transform: uppercase; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { border-color: var(--color-ink); color: var(--color-ink); }
.well { background: var(--color-paper-2); border-top: var(--rule-bar) solid var(--color-rule-2); }
.rule { border-top: var(--rule-bar) solid var(--color-rule-2); }
th, td { border-top: var(--rule-hair) solid var(--color-rule); }
.photo { border-radius: var(--radius-card); outline: 1px solid color-mix(in oklab, var(--color-ink) 8%, transparent); outline-offset: -1px; }
.scrim { background: linear-gradient(to top, color-mix(in oklab, var(--color-ink) 70%, transparent), transparent 60%); color: var(--color-paper); }
a:hover { text-decoration-color: var(--color-accent-deep); }
::selection { background: var(--color-accent); color: var(--color-ink); }
```
