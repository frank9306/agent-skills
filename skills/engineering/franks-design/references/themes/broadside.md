---
name: Broadside
slug: broadside
genre: editorial
paper: light 92 88
display: display-condensed Six Caps
accent: warm 33
posture: committed
keywords: auction, sale, market, fair, event, one night, announcement, town, notice, poster, bill, lots, machinery, tools, festival, fete, hammer, date, venue, tickets
material: grained buff stock, near-black ink, Six Caps and Bevan wood capitals over Archivo Narrow, ink rules at one point or five, one vermilion
photo: duotone ink paper con=20
pictured: Marquee Hero, Settled hero
---

# 宽边

印刷票据：粒状浅黄色纸，近乎黑色墨水，六大写字母适合 Bevan 尺寸，Archivo 窄小字体，一针或五针，一朱红。之所以喧闹，是因为首都高大、规则沉重，而不是因为抽了什么东西；照片可以用墨水清晰地打印出来，就像销售单上的铭牌一样。不是西方模仿，也不是软奶油编辑页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(92% 0.028 88); --color-paper-2: oklch(88.5% 0.032 88); --color-paper-3: oklch(85% 0.036 86);
  --color-ink: oklch(18% 0.01 50); --color-ink-2: oklch(30% 0.012 50); --color-muted: oklch(43% 0.02 62);
  --color-rule: oklch(75% 0.028 82);
  --color-accent: oklch(53% 0.19 33); --color-accent-ink: oklch(95.5% 0.018 88); --color-focus: oklch(53% 0.19 33);
  --font-display: "Six Caps", "Impact", sans-serif; --font-display-2: "Bevan", Georgia, serif;
  --font-body: "Archivo Narrow", "Arial Narrow", ui-sans-serif, sans-serif;
  --font-outlier: var(--font-body);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --rule-bar: 5px; --rule-frame: 3px;
  --shadow-card: none;
  --tracking-display: 0.02em; --display-weight: 400;
  --grain: 0.08;
}
```

一枚表盘、配色，在设计记录 (`broadside: bill`) 中注明。

| 配色 | 库存 | 墨水 | 口音 |
| --- | --- | --- | --- |
| `bill`（默认） | 上面的块 | 墨水 | 朱红 |
| `inked` | oklch(17% 0.01 60)，谷物筛选 | buff oklch(92% 0.028 88) | 朱红色位于 oklch(63% 0.19 33)；纸带深色 |
| `red-bill` | 朱红色 | 浅黄色 oklch(95.5% 0.018 88)，5.5:1 | 浅黄色；姿势湿透 |

## Type · 类型

- **六个大写字母** 400，大写，行高 0.88，`--tracking-display`，用于 h1、大数字和拟合线。它是拟合的，而不是阶梯式的：每行都有自己的元素，从不包裹 (`white-space: nowrap`, the 55b guard)，其大小根据 `cqi` 中测量的宽度设置，因此它准确地填充其列；堆叠在一个块中的行的大小不同，就像手动设置的类型一样。
- **Bevan** 400 用于章节标题、项目标题、文字标记和简短的事实行；大写，未跟踪，行高 1。
- **Archivo Narrow** 400 和 600，行高 1.5，适合所有阅读内容；标签、表头、标题和元数据小了 500 个，句子大小写，未跟踪，`--color-muted`。数字是六大写字母，或 Archivo 窄表格连续。
- 三个系列，无一例外：一箱是木质的，哥特式的规模和平板的重量。

## Surfaces · 表面

- 规则： `--rule-bar` 位于某个部分、表格或票据的两列之间的墨水中，`--rule-hair` 位于运行头下方的墨水中，`--rule-hair` 位于行之间的 `--color-rule` 中。没有一到五之间的事。
- 到处都是方角，没有影子。框架是双规则，`--rule-frame` 墨水边框，内部有 1px 墨水键线 3px，围绕井或照片。
- 表带：`--color-paper-2`，浅色墨水色，或浅色朱红色表带一根；一页最多两页。
- 照片：在视线水平的普通日光纪录片、待售物品的整体和侧面、距离细节；没有人面对镜头。用墨水印刷在纸上（`photo:` 双色调），方形，双规框架；字体永远不会落在上面，而其下方的标题则承载着事实。
- 纹理，唯一的纹理：`--grain` 处的斑点层 (`texture.md` § 1)，在浅黄色上倍增并在油墨上、条带、孔和相框上筛选，从不在运行文本下。

## Range · 范围

- 时间表作为法案：每天一个栏目，采用五点规则，栏目名称采用六大写字母，小时采用 Bevan 格式，小字采用 1 磅规则；由五点垂直线分隔的列。
- 计数或日期符合六大写字母的完整尺寸，屏幕上有一条朱红色的线，下面有小字。
- 行的详细信息：左侧为 Bevan 标签，右侧为 Archivo Narrow 600，中间有头发规则，第一个规则为五点规则；一个尚不为人所知的事实是，它是一种柔和的填充，从未被发明过。
- 朱红色带上的一种形式：带有墨水键线的浅黄色区域，墨水块作为其动作，头部为 Bevan。

## Controls · 控制

- Archivo Narrow 600 中的一个充满墨水的块，未跟踪的大写字母（大写显示下合法），旁边是与未填充的双规则框架相同的块；正方形，48px，一个占一页。
- 墨水链接、下划线、悬停时朱红色；输入正方形、48px、1px 墨水边框。
- Vermilion 在 buff 或 `--color-paper-2` 上设置一整条显示线（它自己的元素，绝不是头部的一部分）或屏幕上的一个图形。

## Motion · 运动

打印出来，如此静止：实时图形更新到位，拟合线在字体加载时拟合一次。没有选框，没有悬停生长，没有显示。

## Voice · 嗓音

一张销售账单被大声朗读：日期、地点、批次和时间，每项都说了一次。用大写字母喊叫，用小字解释，用其销售对象的行业的话。

## Do-nots · 不该做的事

- 从来没有一条破破烂烂的大队伍；未填满其尺寸的六大写字母线被安装或切割。
- 永远不要有代码之外的第四个面：表壳是六大盖、Bevan 和狭窄的。
- 绝不是圆角；框架、控件和照片都是方形的。
- 绝不使用第二种颜色，无论是字体还是图片；照片用墨水打印。
- 从来没有画过的木槌、星星或装饰品；大写字母和照片是很响亮的东西。
- 切勿在每条折痕上贴上照片；账单的一半是类型，类型是大声的一半。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Six+Caps&family=Bevan&family=Archivo+Narrow:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
h1, .display { font-family: var(--font-display); font-weight: 400; text-transform: uppercase; line-height: 0.88; letter-spacing: var(--tracking-display); }
.fit { display: block; white-space: nowrap; }
h2, h3, .wordmark { font-family: var(--font-display-2); font-weight: 400; text-transform: uppercase; line-height: 1; letter-spacing: 0; }
.rule-bar { border-top: var(--rule-bar) solid var(--color-ink); }
.frame, .btn--frame { border: var(--rule-frame) solid var(--color-ink); box-shadow: inset 0 0 0 3px var(--color-paper), inset 0 0 0 4px var(--color-ink); }
.frame { padding: var(--space-lg); } .frame--photo { padding: var(--space-2xs); }
.btn { display: inline-flex; align-items: center; min-height: 48px; padding: 0 var(--space-xl); border: 3px solid var(--color-ink); background: var(--color-ink); color: var(--color-paper); font: 600 var(--text-sm)/1 var(--font-body); text-transform: uppercase; }
.btn--frame { background: transparent; color: var(--color-ink); }
.grained { position: relative; isolation: isolate; }
.grained::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: var(--grain); mix-blend-mode: multiply; } /* the speck SVG, texture.md § 1 */
::selection { background: color-mix(in oklab, var(--color-accent) 30%, transparent); }
```
