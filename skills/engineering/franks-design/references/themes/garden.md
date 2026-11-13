---
name: Garden
slug: garden
genre: editorial
paper: light 95.8 90
display: roman-serif Vollkorn
accent: chromatic-green 140
posture: committed
keywords: farm, apiary, honey, cidery, orchard, pick your own, apples, seed, nursery, herbalist, botanical, tea, preserves, single-origin, seasonal, harvest, small-maker, csa, provenance, grown, field, homestead
material: warm oat paper, deep green ink, Vollkorn 600 with old-style figures over Hanken Grotesk, hairlines and soft moss or clay tints, daylight photographs in true colour, one leaf-green signal
photo: natural con=6 sat=-6
pictured: Field Guide, Stage hero
---

# 花园

种植者的声音：温暖的燕麦纸，近乎黑色的绿色墨水，沃尔科恩头像和汉肯格罗泰斯克上的老式人物，发际线，柔软的苔藓和粘土色调，在白天拍摄的地方，一个叶绿信号。它给人一种诚实和季节性的感觉，因为每种中性色都偏绿色，水果保持其真实的颜色，没有任何东西是盒装的、有光泽的或灰色的。这不是一个鼠尾草和石板的健康页面，也不是一个带有赤土色的奶油色书店。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(95.8% 0.024 90); --color-paper-2: oklch(92.6% 0.030 90); --color-paper-3: oklch(89% 0.034 90);
  --color-ink: oklch(23% 0.050 152); --color-ink-2: oklch(33% 0.048 150); --color-muted: oklch(46% 0.034 142);
  --color-rule: oklch(83% 0.024 112); --color-rule-2: oklch(68% 0.042 138);
  --color-accent: oklch(46% 0.135 142); --color-accent-2: oklch(86% 0.075 128); --color-accent-ink: oklch(97% 0.015 95);
  --color-focus: oklch(46% 0.135 142); --tint-moss: oklch(46% 0.135 142 / 0.11); --tint-clay: oklch(54% 0.140 46 / 0.10);
  --font-display: "Vollkorn", ui-serif, Georgia, serif; --font-body: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "Newsreader", ui-serif, Georgia, serif;
  --radius-card: 4px; --radius-pill: 999px; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.012em; --display-weight: 600;
}
```

## Type · 类型

- **显示：** Vollkorn 600，罗马字体，句首字母大写，`--tracking-display`，行高 1.04；每个头都有一个权重，绝不是斜体。坚固，没有 700 的厚度，所以 52px 头读起来就像设定一样，而不是喊出来。它的老式数字是该主题的最佳数字：160px 及以上的 Vollkorn 的面积或计数，下降到线以下，不需要其他图片。
- **车身：** Hanken Grotesk 400 和 500，带 `oldstyle-nums`；桌子采用内衬表格数字，显示数字保留了Vollkorn的老式数字。
- **照片下的标题（异常值）：** Newsreader 400 的标签大小、句子大小写，采用 `--color-muted`，一个事实一行，就像托儿所的标签一样。沃尔科恩从不作为身体运行。
- **标签、表头、元、批号、日期：** Hanken Grotesk 500 更小一步，句子大小写，未追踪，`--color-muted`。页面上没有单声道。

## Surfaces · 表面

- 规则：1px `--color-rule` 细纹部分行和截面； `--color-rule-2` 位于表格顶部或概述控件。孔和照片上的半径 4px，对照上的药丸。
- 深度为平面纸：无阴影、无阴影框；井是 `--color-paper-2` 或色调，而不是有边框的卡片。
- 条带：全出血 `--tint-moss` 或 `--tint-clay` 水洗、`--color-paper-2` 或带有燕麦文本的绿色墨水，其中 `--color-accent-2`（浅叶）取代重音位置；从来没有一片坚实的绿叶田野。一页最多两页。
- 照片：这个季节的地方，在白天和真实的色彩下：一臂之遥的树枝上的水果，从草地上看到的一排排，工作时的手和篮子，谷仓里的板条箱；柔和的阴天或低日照下，水果的颜色永远不会褪色。 4px半径，1px `--color-rule`发际线，无阴影。头像仅位于照片上的 40% 到 60% 的墨水稀松布上。
- 每个中性色都有绿色或燕麦色 (hue 90 to 152)，而不是纯灰色。没有质感。

## Range · 范围

- **旧式数字中的数字：** 160px 及以上的 Vollkorn 600 中提示的面积、品种或罐子，三个在发际线上，每个下方有一条汉肯线。
- **季节作为一条规则的条带：**十二个月在一排细线中，开放的部分在苔藓上呈现出其中发生的事情，其余的留下如纸；在其下方，时间和地点为两列。
- **价目表或农产品清单：**纸质 2 或绿色墨水上的细线行、商品尺寸上的 Vollkorn 名称、新闻阅读器注释、右边缘衬里数字中的价格；缺失的事实仍然是带标签的占位符。
- **关于绿色墨水的声明：** 一节中的 Vollkorn 句子，上方是燕麦，下面是苍白叶子中的动作。

## Controls · 控制

- 一颗扁平的叶绿色药丸，上面有 `--color-accent-ink` 文字，旁边是 `--color-rule-2` 中的细线轮廓药丸。
- 墨水链接，带下划线，悬停时线条变成绿色； 4px 处的输入，燕麦上有 1px `--color-muted` 边界。
- 叶绿色保持在屏幕的 5% 以下：主屏幕、链接的悬停、焦点环、一个图形。 Clay 只存在于它的色调带中，而不存在于控件、导航或头部上。

## Motion · 运动

仅说明，`--ease-out` 上的 `--dur-short`：药丸变暗一步，链接下方出现下划线。没有显露、没有交错、没有视差。

## Voice · 嗓音

热情、诚实、季节性、不紧不慢。仅按照提示说出田地、品种、月份、面积、罐数；绝不是像空心徽章那样手工、策划或小批量生产。

## Do-nots · 不该做的事

- 切勿使用灰鼠尾草纸或石板纸；地面是温暖的燕麦色，色调 92。
- 绝不是冷酷的青色或公司祖母绿；绿色是叶绿素，色相140。
- 切勿使用斜体或仿粗体 Vollkorn；加载真实的 600，切勿将其与 700 混合在一页上。
- 切勿在对照物或头部上涂抹粘土，也切勿在叶绿色药丸上涂抹梯度。
- 切勿制作白色或舞台野餐风格的产品；这个地方是一个工作场所。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Vollkorn:wght@600&family=Hanken+Grotesk:wght@400;500&family=Newsreader:opsz,wght@6..72,400&display=swap" rel="stylesheet">
```

```css
body { font-variant-numeric: oldstyle-nums; color: var(--color-ink-2); }
table, .num { font-variant-numeric: lining-nums tabular-nums; }
h1, h2, h3 { font-weight: var(--display-weight); color: var(--color-ink); }
.figure { font: 600 clamp(6rem, 12vw, 11rem)/0.86 var(--font-display); font-variant-numeric: oldstyle-nums proportional-nums; color: var(--color-ink); }
.btn { border-radius: var(--radius-pill); border: var(--rule-hair) solid var(--color-rule-2); padding: var(--space-sm) var(--space-lg); font-weight: 500; color: var(--color-ink); }
.btn--primary { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-accent-ink); }
.band--moss { background: var(--tint-moss); }
.photo img { border-radius: var(--radius-card); outline: var(--rule-hair) solid var(--color-rule); outline-offset: -1px; }
.photo figcaption { font: 400 var(--text-sm)/1.4 var(--font-outlier); color: var(--color-muted); }
a:hover { text-decoration-color: var(--color-accent); }
::selection { background: color-mix(in oklab, var(--color-accent) 22%, transparent); }
```
