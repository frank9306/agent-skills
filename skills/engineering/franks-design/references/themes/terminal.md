---
name: Terminal
slug: terminal
genre: atmospheric
paper: dark 12.5 150
display: mono Martian Mono
accent: chromatic-green 142
posture: committed
keywords: cli, terminal, shell, command-line, tui, self-hosted, open-source, binary, ssh, sysadmin, devops, homelab, install script, package manager, repl, dotfiles, developer tool, phosphor
material: a near-black ground with a green cast in three lightness steps, pale phosphor ink and one bright phosphor signal with a dim wash of itself, every glyph Martian Mono with heads wide and text narrow, and pictures printed in the page's own glyphs: a photograph rendered as a grid of characters taken from the product's own text, dim cells small, bright cells full, stirred by the cursor
photo: duotone paper accent con=20
pictured: Session, Split hero
---

# 终端

页面是终端面，其图片是用字体打印的。近乎黑色的底色，绿色铸件，浅磷光墨水，一种明亮的磷光绿色，以及用于添加或选择的内容的暗色清洗，以及每个字形的火星单色：头宽，文本窄。图片被打印为产品自身文本中的字符网格。它读起来就像是生活在贝壳里的人们制造的工具。它不是 CRT 服装，也不是带有终端屏幕截图的黑色产品页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(12.5% 0.012 150); --color-paper-2: oklch(16% 0.016 150); --color-paper-3: oklch(20.5% 0.022 150);
  --color-ink: oklch(94% 0.03 140); --color-ink-2: oklch(82% 0.05 142); --color-muted: oklch(64% 0.06 145);
  --color-rule: oklch(27% 0.028 148); --color-rule-2: oklch(38% 0.045 146);
  --color-accent: oklch(87% 0.2 142); --color-accent-ink: oklch(14% 0.02 150); --color-focus: oklch(87% 0.2 142);
  --color-accent-wash: oklch(23% 0.06 145);
  --glyph-0: oklch(30% 0.06 146); --glyph-1: oklch(38% 0.08 145); --glyph-2: oklch(47% 0.11 144); --glyph-3: oklch(57% 0.14 143);
  --glyph-4: oklch(67% 0.17 142); --glyph-5: oklch(77% 0.19 142); --glyph-6: oklch(86% 0.2 141); --glyph-7: oklch(94% 0.12 138);
  --font-display: "Martian Mono", ui-monospace, monospace; --font-body: var(--font-display); --font-outlier: var(--font-display);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px; --shadow-card: none;
  --tracking-display: -0.02em; --display-weight: 500; --stretch-display: 112.5%; --stretch-body: 87.5%;
}
```

## Type · 类型

- **每个字形都是 Martian Mono，** 最多三种粗细：400、500、700。在 `--stretch-display` 处显示 500，行高 1.12，`h1` 最多在两行或三行中显示 3.75rem。主体 400 位于 `--stretch-body`，15 至 16px，线高 1.65。 `--color-muted` 中的标签和元数据小了一步，句子大小写，未跟踪。
- **数字**针对窄文本设置宽而浅：400位于`--stretch-display`，从`--text-display-s`向上，表格，单位或`--color-muted`下方的`#`注释。
- `--color-muted` 中的提示字形（`$`、`~ $`）仅标记真实命令；参考文献中的参数带有重音。
- Martian Mono 没有方框图或块字形。图表以 `+ - |` 格式键入，文字标记以字形图片形式打印，因此不会有后备面滑入一行。

## Surfaces · 表面

- 一种色调，亮度渐变：地面，`--color-paper-2` 用于会话或安装井，`--color-paper-3` 用于悬停和选择。凸起表面采用 1px `--color-rule` 边框，方形，无阴影； `--color-rule-2` 是表头或 diff 的文件头下方较坚固的线。
- 规则：部分、行和选项卡之间 1px `--color-rule`。
- **作为字形的图片：** 一张具有强烈黑色轮廓的图片，缩小为亮度级别 (about 130 columns, cells 1.85 times as tall as wide) 的网格并绘制在画布上，每个亮起的单元格是 `--glyph-0` 到 `--glyph-7` 中产品文本的一个字符，暗淡的单元格大小为 62%；静态 `<pre>` 无需脚本即可代替。一两页，很大。
- 当无法制作字形网格时，一张照片会出现在 `photo:` 双色调中，带有 1px `--color-rule` 边框：机器本身，而不是显示界面的屏幕。
- 没有扫描线、发光、边框、标题栏或交通灯。

## Range · 范围

- **作为差异的比较：**跨十或十二列的统一差异，`--color-rule-2`行上的`--- a/`和`+++ b/`标题，删除`-`后面的`--color-muted`中的行，在绿色`+`后面的`--color-accent-wash`上添加墨迹行，行号的装订线`--color-rule-2`。
- **作为工具输出的数字：** 三个或四个显示尺寸的提示数字，宽而浅，由垂直线分隔，每个数字在下面用 `# comment` 标记，因为 `wc` 或 `du` 会打印它们。
- **会话大小：** `--color-paper-2` 中的会话跨越八列或更多列，键入一次，其输出会点亮旁边的 `+ - |` 图。
- **作为行的引用：** `--text-title` 处每行一个命令，宽，其参数在重音中，其行在右侧，就像手册页的概要；或主机、标志或退出代码表。

## Controls · 控制

- 主要：带有 `--color-accent-ink` 文本的重音块，方形。辅助：1px `--color-ink-2` 边框。 `steps(1)` 中的悬停和状态开关。
- 安装线：一个 `--color-paper-2` 井，其中带有下划线的选项卡（brew、cargo、curl）、`--text-lg` 处的命令，以及右侧的 16px 复制图标，该图标会在 1.4 秒内变成一个勾号。
- `--color-ink-2` 中的链接，下划线点状，悬停时强调；选定的行或选项卡采用 `--color-accent-wash`。

## Motion · 运动

步进到它所在的状态，活到它是图片的地方：字形图片在大约 1.5 秒内从噪音中逐行解析，一次，在光标下，其单元格向重音倾斜，然后稳定下来。会话在进入视图时会自动键入一次。插入符号闪烁五次并保持不变。简化的运动显示了每个最终状态。

## Voice · 嗓音

命令、标志、路径和退出代码。声明式且简短：命名命令，而不是形容词。

## Do-nots · 不该做的事

- 绝不是比例字体，也绝不是后备字体的方框图字形。
- 切勿使用第二种色调：对于已删除的线条，不得使用琥珀色、青色、红色。
- 绝不是圆角、药丸或软卡，也绝不是光截面。
- 不得超过一张照片，并且仅限于无法制作字形的地方。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wdth,wght@75..112.5,400..700&display=swap" rel="stylesheet">
```

```css
body { font-stretch: var(--stretch-body); font-variant-numeric: tabular-nums; }
h1, h2, h3 { font-weight: var(--display-weight); font-stretch: var(--stretch-display); letter-spacing: var(--tracking-display); line-height: 1.12; }
.figure { font-weight: 400; font-stretch: var(--stretch-display); font-size: var(--text-display); line-height: 1; }
.art { position: relative; } .art canvas { position: absolute; inset: 0; }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); border-radius: 0; transition: background-color var(--dur-micro) steps(1); }
.well { background: var(--color-paper-2); border: var(--rule-hair) solid var(--color-rule); }
.diff .add { background: var(--color-accent-wash); color: var(--color-ink); } .diff .add::before { content: "+"; color: var(--color-accent); }
.diff .del { color: var(--color-muted); } .diff .del::before { content: "-"; }
```

要制作字形图片：裁剪主题，自动对比度，通过 `round(cols * h / w / 1.85)` 将大小调整为 `cols`，将亮度量化为 0 到 8 (0 is blank) 级别，并将行作为字符串发送；画布按顺序设置产品文本中每个点亮单元的字形，并设置 `--glyph-(level - 1)` 的颜色。
