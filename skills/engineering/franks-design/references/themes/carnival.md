---
name: Carnival
slug: carnival
genre: editorial
paper: light 92 50
display: display-heavy Big Shoulders Display
accent: chromatic-yellow 95
posture: full-palette
keywords: record label, podcast, comedy, indie, zine, poster, illustrator, games, hot sauce, merch, streetwear, cassette, vinyl, live show, festival, loud, maximalist, scrappy
material: tinted paper, deep warm ink, Big Shoulders Display 800 capitals set poster-large over Golos Text, 2px rules, a hard 4px ink shadow, two accents that compete as whole fields
photo: natural vib=20 con=10
pictured: Label and Ledger, Stage hero
---

# 狂欢

响亮的丝网印刷寄存器：有色纸、深暖墨水、Golos 文本上的 Big Shoulders Display 大写字母、硬墨水阴影和两种相互竞争的口音。每个表面都是平坦的填充物，带有硬边，就像钉在墙上的印刷品一样，照片也很接近，很热，以同样的方式取景。页面上最响亮的内容是海报大小的事实，而不是图片。它不是一个柔和的游乐场、一个柔和的阴影应用程序或一个复古的服装。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(92% 0.045 50); --color-paper-2: oklch(88% 0.050 45); --color-paper-3: oklch(82% 0.060 40);
  --color-ink: oklch(18% 0.080 20); --color-ink-2: oklch(28% 0.060 25); --color-muted: oklch(42% 0.050 30);
  --color-rule: oklch(40% 0.21 25); --color-accent: oklch(86% 0.18 95); --color-accent-2: oklch(40% 0.21 25);
  --color-accent-ink: oklch(18% 0.080 20); --color-focus: oklch(40% 0.21 25);
  --font-display: "Big Shoulders Display", Impact, sans-serif; --font-body: "Golos Text", system-ui, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 2px; --radius-pill: 2px; --rule-hair: 1px; --rule-bar: 2px; --shadow-card: 4px 4px 0 var(--color-ink);
  --tracking-display: 0.015em; --display-weight: 800;
}
```

一枚表盘，水滴，印有设计记录（`carnival: diner-sign`）；它的第二个重点也是规则和焦点颜色。 `paper-2` 和 `paper-3` 步骤 4 和 10 点使纸张的色调变暗，`ink-2` 和 `muted` 使墨水变浅，并且墨水位于每个第一个重音上。

| 降低 | 挑选 | 纸 | 墨水 | 口音 | 口音2 |
| --- | --- | --- | --- | --- | --- |
| 冷快照（默认） | 音乐，冬天，磁带，黑胶唱片 | 92% 0.045 50 | 18% 0.080 20 | 芥末 86% 0.18 95 | 紫红色 40% 0.21 25 |
| 柑橘暴乱 | 杂志，滑冰，夏季滴 | 94% 0.040 85 | 20% 0.07 145 | 石灰 82% 0.20 130 | 品红色 28% 0.28 350 |
| 餐厅标志 | 食品和饮料、招待、路边 | 95% 0.035 90 | 16% 0.04 30 | 樱桃 60% 0.22 25 | 海军蓝 30% 0.16 250 |
| 工作室之夜 | 广播、播客、蓝色小时 | 88% 0.05 25 | 20% 0.05 270 | 青色 78% 0.18 220 | 李子 24% 0.18 320 |
| 水上公园 | 夏天、游泳池、冲浪、汽车旅馆 | 94% 0.040 180 | 20% 0.06 200 | 绿松石 72% 0.16 195 | 珊瑚 36% 0.24 35 |
| 新闻发布室 | 新闻、时事通讯、观点 | 89% 0.025 65 | 16% 0.02 60 | 琥珀色 78% 0.18 75 | 板岩 34% 0.10 240 |

## Type · 类型

- **显示：** Big Shoulders Display 800，大写字母，`--tracking-display`，行高1.0，头部可以换行；一个 nowrap 行上的一个单独的单词可以在 -0.005em 和 0.9 处运行。脸很窄，所以它在刻度上设置了一个台阶：首屏主视觉头部大约在 1440 处达到 160px，章节头部在 `--text-display-s`，项目标题在 `--text-2xl`。
- **正文：** Golos Text 400 和 500，句首字母大写，全墨迹。
- **标签、标题、表格标题：** Golos Text 500 更小，句首字母大写。从来没有单声道。
- **数字：** 销售事实（价格、数量、数量）以首屏主视觉的大小、表格形式设置在显示面上，其旁边的单位以相同的大写字母显示；小数字是带有 `tabular-nums` 的 Golos 文本。

## Surfaces · 表面

- 两种相互竞争的口音：一种填充一个表面，另一种填充下一个表面，它们之间从来没有渐变。
- 孔、对照和照片上的硬偏移阴影（`--shadow-card`，零模糊），永远不会被溢出剪切；没有什么比这更能体现深度了。
- 规则：`--rule-bar` 在 `--color-accent-2` 之间，部分和行之间，用墨水围绕阴影表面；半径最大为 2px。
- Bands：重音字段（纸质文本下的第二个）或 `--color-paper-2`；一页最多两页。
- 照片：物体本身，近距离，在强光或闪光灯下，颜色被推挤，一个主题填满画面：手中的瓶子，切开的水果，袖子。硬阴影上的 `--rule-bar` 墨水边框，就像钉在上面的印刷品一样，可以自由倾斜一两度；类型永远不会位于其中，尽管带有事实的平面重音块可能会与角重叠。
- 纹理：半色调网屏 (`texture.md` § 2) 为墨色，位于井状或条带上，切勿位于运行文本下方或照片上方。

## Range · 范围

- 整个重音区域上的**数字**：海报大小的显示大写字母中的三到四个事实，每一个都在 Golos 的线条上，由 2px 墨条分隔，半色调位于该区域的一个角落，并且永远不会在数字下方。
- **行** 以第二重音 `--rule-bar` 规则：左侧项目标题大小的大写字母问题或名称，右侧铅字大小的 Golos 答案；选定的行会反转为纸张类型的墨水。
- **声明**在纸张类型下的第二个重音上，海报大小的线条横跨十列，旁边有一个动作。
- **形成**以及硬阴影：选项作为规则行，选择时会反转，大写字母中的实时总数。

## Controls · 控制

- 这对：在同一块旁边用墨水在纸上勾画出第一重音填充，在硬阴影和显示面的大写字母上都没有跟踪。
- 链接为墨迹，并在 `--color-accent-2` 中加下划线；输入在纸张上采用 `--rule-bar` 墨水边框，并且没有阴影。
- 第一个重音填充主要控制、乐队或井；第二个包含规则、焦点、链接和另一个填充。

## Motion · 运动

大部分还是静止的。悬停会交换颜色，仅此而已；主动将偏移压到1px；没有东西升起。页面可能运行的一个循环是一个滚动的文字，每循环 8 秒或更慢。

## Voice · 嗓音

响亮、简短、准确，有趣：计数、价格、日期，一个屏幕上的笑话。首字母大写，六个字或更少，以句号结尾；句子主体采用现在时态，数字置于单词之上。

## Do-nots · 不该做的事

- 绝不是柔和的阴影；硬偏移或无偏移。
- 切勿在一个表面内同时使用两种重音；混合会杀死双音阅读。
- 永远不要句子首尾相连，也永远不要松懈跟踪。
- 切勿使用灰色或幽灵按钮；第二个是勾画出的墨块。
- 切勿绘制吉祥物、火焰、头骨或涂鸦；大声的事物被拍照或排版。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=Golos+Text:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: var(--tracking-display); line-height: 1; }
.btn { border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-pill); box-shadow: var(--shadow-card); padding: var(--space-sm) var(--space-lg); background: var(--color-paper); color: var(--color-ink); font: 800 var(--text-lg)/1 var(--font-display); text-transform: uppercase; }
.btn--primary, .band--a { background: var(--color-accent); color: var(--color-accent-ink); }
.btn:active { box-shadow: 1px 1px 0 var(--color-ink); }
.well, .photo { border: var(--rule-bar) solid var(--color-ink); border-radius: var(--radius-card); box-shadow: var(--shadow-card); background: var(--color-paper-2); }
.band--b { background: var(--color-accent-2); color: var(--color-paper); }
.halftone { background-image: radial-gradient(var(--color-ink) 1.5px, transparent 1.5px); background-size: 12px 12px; }
```
