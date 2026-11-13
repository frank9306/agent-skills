---
name: Newsprint
slug: newsprint
genre: editorial
paper: light 94 92
display: slab-serif Zilla Slab
accent: warm 32
posture: restrained
keywords: newspaper, broadsheet, journalism, publication, magazine, newsletter, local news, op-ed, opinion, essay, longform, column, reportage, press, gazette, review, dispatch, literary
material: pale newsprint stock, warm black ink, Zilla Slab heads over a Spectral body with Libre Franklin agate for listed figures, justified columns under hairline column rules, a double rule, one dried-brick signal
photo: mono
pictured: Broadsheet Front, Stage hero
---

# 新闻纸

浏览器中的大报：苍白的新闻纸、温暖的黑色墨水、平静的 Spectral 书衬线上的钝的 Zilla Slab 头、普通中断的细线和分栏规则、主要中断的双重规则，以及永远不会填充任何内容的干砖信号。照片是黑白的，附有说明文字，就像纸上打印的一样。它读的是报道和编辑，而不是装饰。它不是一本带有圆形卡片的杂志，不是一个无衬线博客，也不是带有赤土​​按钮的奶油色编辑模板。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(94% 0.011 92); --color-paper-2: oklch(90.5% 0.015 88); --color-paper-3: oklch(87% 0.017 86);
  --color-ink: oklch(17% 0.012 60); --color-ink-2: oklch(27% 0.012 58); --color-muted: oklch(46% 0.014 60);
  --color-rule: oklch(68% 0.016 75); --color-rule-2: oklch(34% 0.012 60);
  --color-accent: oklch(44% 0.13 32); --color-accent-ink: oklch(95% 0.012 90); --color-focus: oklch(48% 0.17 32);
  --font-display: "Zilla Slab", ui-serif, Georgia, serif; --font-body: "Spectral", ui-serif, Georgia, serif;
  --font-outlier: "Libre Franklin", ui-sans-serif, sans-serif;
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px;
  --shadow-card: none;
  --tracking-display: -0.02em; --display-weight: 700;
}
```

## Type · 类型

- **显示：** Zilla Slab 700，`--tracking-display`，行高 1.05，句子大小写，罗马，用于标题、甲板和桅顶。括号内的衬线接近干重：保持单一的粗细，让共享的比例形成层次结构。
- **主体：** 1.0625rem 处的光谱 400 和 500，线高 1.55。平静的衬线之上的钝板是声音；光谱斜体仅在运行文本时强调。
- **署名、日期、标题、表头、元：** Spectral 500 更小，句子大小写，未跟踪，`--color-muted`。
- **玛瑙，自由富兰克林 500：** 纸张的列表面，仅适用于规则列表或表格中的数字（时间、价格、计数、结果），表格且右对齐，其旁边的文本大小。绝不是标签、标题或连续文本。每页三种粗细：400、500、700。
- **列：** 超过一个段落的运行文本可以设置在两到三个对齐的列中，并带有 `hyphens: auto` 和细线列规则，每列 28 到 40ch。
- **首字下沉：**可以打开一个很长的段落，一个 Zilla Slab 首字母，大约三行高，用墨水或砖块书写，最多一页。

## Surfaces · 表面

- `--color-rule` 中的细线带有普通分隔符，列中设置的文本采用细线列规则；双规则，`--color-rule-2` 2px 中的两条 1px 线分开，是主题拥有的最重的分隔线，标志着重大突破。
- 规则，绝不是盒子：半径为 0 并且任何地方都没有阴影。井是 `--color-paper-2` 区域的顶部和底部，而不是有边框的卡。
- 表带：`--color-paper-2`，或纸型`--color-ink`表带一根；最多一页两个，从来没有一块砖块。
- 照片：黑白纪录片，在可用光线下，在工作距离或后面拍摄的地方和人物，色调从纸白到墨水；主图很宽，其余部分则根据故事进行剪裁。正方形，有1px `--color-rule`边框，没有阴影。每张图片下面都有一个单行标题，并带有署名声音，这是事实；文字永远不会出现在照片上。
- 纹理（如果有）：一个波段上最微弱的纤维颗粒 (`texture.md` § 1)，默认情况下关闭，并且永远不会在运行文本下。

## Range · 范围

- **列中的首页：** `--text-display-s` 上的一个头横跨三个合理的频谱列的完整测量，首字下沉，署名语音中的日期线；一条1px柱规之间，一条双规上面。
- **以玛瑙形式列出：** 一周、以规则行形式列出的程序或价目表、Zilla Slab 中标题大小的日期或项目、Spectral 中的线条、富兰克林玛瑙中右边缘的数字。
- **数字为方框分数：** Zilla Slab 中出版物自己的数字，显示大小介于两条双线之间，每条线位于一条光谱线上，由列线分隔。
- **墨带：** `--color-ink` 纸质通知（价格、订阅号）及其表格；砖块变成了上面的发际线，而不是填充物。

## Controls · 控制

- 对照对：一个充满墨水的矩形，上面有纸型，旁边有一个用墨水划线的顶部和底部，都是正方形，设置在 Zilla Slab 700 中，尺寸要小一些。
- 砖块链接，带有 1px 砖块下划线，悬停时会变厚；输入为正方形，`--color-paper-2` 上有 1px `--color-rule-2` 边框。
- 砖块保持在 5% 以下：链接、聚焦环、规则上的短勾；从来没有填满。

## Motion · 运动

仅状态：悬停时链接的下划线会变粗。没有显示，没有计数器，没有任何东西可以自动打字或滚动。

## Voice · 嗓音

具体且具有陈述性，具有干巴巴的编辑智慧：说出地点、日期和事实，并写下副编辑将通过的标题，以句子大小写和句号。

## Do-nots · 不该做的事

- 绝不使用无衬线体或无标签声音； Spectral 可以完成所有的小工作。
- 切勿使用冷酷或明亮的口音；干砖是家具，不是喊的。
- 切勿使用盒装卡片、阴影或圆角；规则承载着结构。
- Zilla Slab 切勿低于 700 或斜体；一个钝的罗马重量。
- 没有一张彩色、调色或染色的照片，也没有一张没有标题的照片。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&family=Spectral:ital,wght@0,400;0,500;1,400&family=Libre+Franklin:wght@500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); }
.rule--double { box-sizing: content-box; height: 2px; border: 0; border-block: var(--rule-hair) solid var(--color-rule-2); }
.cols { columns: 3 18rem; column-gap: var(--space-xl); column-rule: var(--rule-hair) solid var(--color-rule); text-align: justify; hyphens: auto; }
.agate { font: 500 1em/1 var(--font-outlier); font-variant-numeric: tabular-nums; }
.dropcap::first-letter { float: left; font: 700 3.4em/0.8 var(--font-display); padding-right: 0.06em; }
.btn { border: 0; background: none; border-radius: 0; padding: var(--space-md) var(--space-lg); font: 700 0.9375rem/1 var(--font-display); }
.btn--primary { background: var(--color-ink); color: var(--color-paper); }
.btn--secondary { border-block: var(--rule-hair) solid var(--color-ink); color: var(--color-ink); }
.well { background: var(--color-paper-2); border-block: var(--rule-hair) solid var(--color-rule); }
figure img { border: var(--rule-hair) solid var(--color-rule); }
figcaption { font: 500 var(--text-sm)/1.4 var(--font-body); color: var(--color-muted); padding-top: var(--space-xs); }
a { color: var(--color-accent); text-decoration-color: var(--color-accent); text-underline-offset: 0.16em; }
a:hover { text-decoration-thickness: 2px; }
::selection { background: color-mix(in oklab, var(--color-accent) 20%, transparent); }
```
