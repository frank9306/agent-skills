---
name: Ink
slug: ink
genre: editorial
paper: light 99.5 100
display: grotesk-sans Epilogue
accent: chromatic-teal 190
posture: restrained
keywords: library, lending, community, civic, notice board, catalogue, rota, volunteer, non-profit, neighbourhood, borrow, tools, repair, membership, events, local, competent, monochrome
material: white paper, a black with no hue, Epilogue 700 over Epilogue 400, hairline rules and state pills, one teal that means in
photo: muted
pictured: Catalogue, Settled hero
---

# 墨水

一张用纯黑色打印的通知：白纸，没有色调的黑色，尾声为头部 700，您阅读的所有内容为 400，发际线规则，以及表示打开或打开的青色。它的照片显示了货架上的东西，在白天，颜色被调暗。给人一种有能力、本地化和友善的感觉，就像一个运行良好的社区服务台一样。它不是冷酷的企业单色，也不是温暖的奶油色社论页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(99.5% 0.003 100); --color-paper-2: oklch(97% 0.004 100); --color-paper-3: oklch(94% 0.006 100);
  --color-ink: oklch(16% 0 0); --color-ink-2: oklch(28% 0 0); --color-muted: oklch(44% 0 0);
  --color-rule: oklch(89% 0.004 100); --color-rule-2: oklch(93.5% 0.003 100);
  --color-accent: oklch(50% 0.095 188); --color-accent-ink: oklch(99.5% 0.003 100); --color-accent-soft: oklch(93% 0.05 190); --color-accent-soft-ink: oklch(27% 0.045 190);
  --color-focus: oklch(50% 0.095 188);
  --font-display: "Epilogue", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: "IBM Plex Mono", ui-monospace, monospace;
  --radius-card: 12px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 20px 40px oklch(20% 0 0 / 0.16);
  --tracking-display: -0.04em; --display-weight: 700;
}
```

两种浅色配色，在设计记录中注明（`ink: paper` 或 `ink: board`）。

| 配色 | 地面色和青色 |
| --- | --- |
| `paper`（默认） | 上面的块：白色、无色黑色、青色（50%） |
| `board` | 告示牌黄色 `oklch(93% 0.10 95)`，规则为 `oklch(84% 0.10 92)`，墨水 `oklch(20% 0.02 80)`，青色加深至 `oklch(46% 0.078 190)`；孔和标签变白 |

## Type · 类型

- **显示：** 尾声 700，`--tracking-display`，首屏主视觉大小行高 1.0，以下行高 1.05，句首字母大写，罗马；数字（计数、价格、小时）采用相同的设置，比旁边的头部大一步。
- **主体：** Epilogue 400 位于 16 至 17px，线高 1.55，采用 `--color-ink-2`（白色上的柔和灰色轮胎）；连续的名称、链接和标签位于 600 处。
- **标签、标题、表头、元：** 尾声 400 更小，句子大小写，未跟踪；从来不单声道。
- **离群值：** IBM Plex Mono 仅限于代码内部以及列中比较的数字（贷款计数、卡号、轮班时间）。大数字和价格为 Epilogue 700 墨水；青色只标记里面或打开的东西。

## Surfaces · 表面

- 规则：列表或表格在 1px `--color-ink` 规则上打开，并在其行之间的 `--color-rule` 细线上继续； `--color-rule-2` 部件更安静。
- 井和照片上的半径 12px，控件和输入上的 10px，标签上的药丸。
- 平板纸：孔为`--color-paper-2`，边缘为1px `--color-rule`； `--shadow-card` 只位于浮动在页面上的某些东西（菜单、对话框）下方，而不位于静止表面下方。
- 条带：`--color-paper-2` 条带或带有纸质文本的墨水条带。一页最多两页；从来没有青色的田地。
- 照片：在光天化日之下，一臂之遥的东西和共享它们的街道：工具的钉板，靠墙的梯子，从后面看到的邻居搬着东西回家；镜头没有脸部，相机没有品牌标记。颜色被调低（`photo:` 静音），因此青色仍然是具有任何意义的颜色； 12px半径，1px `--color-rule`发际线，无阴影。事物的名称及其状态标签位于其图片下方，而不是其上方。
- 没有质感。

## Range · 范围

- **作为规则列表的架子：**墨迹规则下的每一行，其名称为 600，一行显示其内容，其状态药丸位于行末尾，一个过滤字段可在您键入时缩小行范围。
- **作为通知的步骤：** 它如何作为跨列的三个或四个编号阶段工作，Epilogue 700 中的每个数字在发际线上方显示大小，该阶段意味着携带淡青色药丸。
- **开放日时间表：** 接下来的日期为行，每个日期的小时数，下一个日期；日期来自时钟，从未输入。
- **纯黑色数字：** 在 `--color-paper-2` 井的 Epilogue 700 中设置的计数、费用和小时数，这口井以青色表示开放。

## Controls · 控制

- 这对：一个带有纸质文本的墨水填充按钮，旁边是 `--color-paper-2` 上的 1px `--color-rule` 带边框按钮，两者均位于 Epilogue 600 中的 10px 半径处。
- 标签仅携带状态：in 是浅青色 (`--color-accent-soft`) 和 `--color-accent-soft-ink`，out 是用规则颜色勾勒出的轮廓，on 是填充墨水的。
- 青色意味着打开或打开：标签、大图、链接的悬停、焦点环。链接在 600 处为墨迹、下划线、悬停时为青色。

## Motion · 运动

除了状态之外，什么都不会移动：您键入时会应用过滤器，单击时标签会更改状态，下划线会变为 `--dur-micro` 的青色。没有帐篷，没有展示，没有柜台。

## Voice · 嗓音

服务台志愿者的：里面有什么，什么时候回来，星期六谁在。简短、友善、准确，但绝不是制度化的。

## Do-nots · 不该做的事

- 切勿使用第二种颜色：青色表示进，出表示轮廓，绝不是红色。
- 从来没有暖黑色。墨水没有色调，页面上写着：`waive 22 · ink and greys at zero chroma · a notice board is printed in plain black`。
- 绝不是青色字段或青色运行文本；青色是一种状态，而不是表面。
- 绝不是静止的影子；纸张保持平整。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); line-height: 1.02; }
.btn { border: var(--rule-hair) solid var(--color-rule); border-radius: 10px; padding: var(--space-sm) var(--space-md); font-weight: 600; background: var(--color-paper-2); color: var(--color-ink); }
.btn--primary { background: var(--color-ink); border-color: var(--color-ink); color: var(--color-paper); }
.tag { display: inline-flex; padding: var(--space-2xs) var(--space-sm); border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 600; background: var(--color-paper-3); }
.tag--in { background: var(--color-accent-soft); color: var(--color-accent-soft-ink); }
.tag--out { background: transparent; box-shadow: inset 0 0 0 var(--rule-hair) var(--color-rule); color: var(--color-muted); }
.tag--on { background: var(--color-ink); color: var(--color-paper); }
.ruled { border-top: var(--rule-hair) solid var(--color-ink); } .ruled > * { border-bottom: var(--rule-hair) solid var(--color-rule); }
.well { background: var(--color-paper-2); border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-card); }
.photo { border-radius: var(--radius-card); outline: var(--rule-hair) solid var(--color-rule); outline-offset: -1px; }
a { font-weight: 600; } a:hover { text-decoration-color: var(--color-accent); }
::selection { background: var(--color-accent-soft); color: var(--color-accent-soft-ink); }
```
