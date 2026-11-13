---
name: Midnight
slug: midnight
genre: atmospheric
paper: dark 14 264
display: grotesk-sans Mona Sans
accent: cool 230
posture: committed
keywords: render, 3d, animation, vfx, film, video, frames, pipeline, generative, ai tool, model playground, dark mode, nocturnal, late-night, after-hours, overnight, moody, cinematic, cerebral, calm, technical, midnight
material: midnight-blue ground to every edge, cool white ink, Mona Sans expanded at 300 over its normal width, square-cut surfaces in lightness steps, photographs as moonlight, one azure signal
photo: duotone paper ink-2
pictured: Narrative Workflow, Settled hero
---

# 午夜

一种冰冷、平静的夜间乐器，其蓝色就是底色本身：深夜蓝色遍及每一个边缘，冷白墨水，Mona Sans 的头部放大了 300，就像电影中的标题一样，同一个系列的阅读宽度为正常宽度，表面以浅蓝色的阶梯切割成方形，一个蔚蓝的信号。照片在月光下到达，地面上的蓝色阴影和墨水中的高光。它不是霓虹灯黑暗模式，不是磨砂玻璃，也不是带有蓝色按钮的黑色页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(14% 0.048 264); --color-paper-2: oklch(18.5% 0.052 264); --color-paper-3: oklch(23% 0.055 264);
  --color-ink: oklch(95% 0.016 250); --color-ink-2: oklch(88% 0.05 245); --color-muted: oklch(73% 0.04 256);
  --color-rule: oklch(29% 0.058 264); --color-rule-2: oklch(40% 0.06 262);
  --color-accent: oklch(80% 0.11 230); --color-accent-2: oklch(58% 0.1 236); --color-accent-ink: oklch(16% 0.05 264); --color-focus: oklch(84% 0.12 228);
  --font-display: "Mona Sans", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display); --font-outlier: var(--font-display);
  --radius-card: 0; --radius-pill: 0; --rule-hair: 1px;
  --shadow-card: 0 24px 48px -24px oklch(6% 0.04 264 / 0.7);
  --tracking-display: -0.015em; --display-weight: 300; --display-stretch: 125%;
}
```

## Type · 类型

- **显示：** Mona Sans 300 在 `h1` 和 `h2`、`--tracking-display` 上展开宽度，行高 1.04，句首字母大写，罗马字体。宽阔的光切是声音；长头向下延伸至 `--text-display-s`，而不是闭合。项目标题的正常宽度为 500。
- **关键是数字：** 显示以 300 为表格形式，从 `--text-display` 增加到两倍，跟踪 -0.03em，其旁边的单位在 `--color-ink-2` 中正常宽度 400。
- **正文：** Mona Sans 400，正常宽度，行高 1.6。一户两宽：寒气来自于地和墨，绝非来自第二张脸。
- **标签、表头、元、状态：** 缩小 500 步，句子大小写，未跟踪，`--color-muted`。表格数字，无论数字如何比较；任何地方都没有单声道。

## Surfaces · 表面

- 深度是从paper到paper-2到paper-3的亮度阶梯，像框架一样以半径0切割正方形；升起的表面在地面本身的黑暗中拍摄了 `--shadow-card`。表面周围没有轮廓； 1px `--color-rule` 将表或列表中的行分开，仅此而已。
- 条带：`--color-paper-2`或`--color-paper-3`，一页最多两个；从来没有蔚蓝的田野，也从来没有光带。
- 照片：天黑后低调的灯光、夜晚的建筑、亮着灯的楼梯间、长长的走廊；一个拍摄对象保持静止，要么被剪得很宽，要么剪得很高。双色调从纸张延伸到 ink-2，因此白天的图片变成了苍白的纸张：选择夜晚。方形框架，1px 8% 的墨水插入轮廓，标签式标题给出小时或框架。
- 没有纹理，没有玻璃，没有模糊，没有光晕。

## Range · 范围

- **以数字作为说明：** 显示中的一个实数最多可切割两倍 `--text-display`，单独在地面上及其单位和一行；宽阔的光切让价格读起来就像标题卡一样。
- **另一个角度的产品：** 界面的细节在纸2井上（工作表、仪表、接触表）上剪裁得很大，步调轻盈，从未被框在绘制的窗口中。
- **步骤或夜间日志：** `<ol>` 的阶段或小时，每个头都在扩展切口中，数字为表格，当前的一个为墨水，其余的为静音；仪表（2px `--color-rule-2` 轨道、`--color-accent-2` 或天蓝色填充）是唯一移动的线。
- **地面上的行和表格：**细线行，左侧为扩展标题，右侧为正常宽度； 2 纸带上的计算器，其答案是显示剪切的数字。

## Controls · 控制

- 该对：一个纯蓝色矩形，带有 `--color-accent-ink` 文本，旁边是 `--color-rule-2` 中的辅助轮廓，均为正方形，500。分段选项是相同的正方形，选择时填充墨水。
- 链接在悬停时带有蓝色下划线；输入位于纸张上，边缘为 1px `--color-muted`，方形。
- 天蓝色保持在 5% 以下：一个主要控件、一个链接的悬停、一米值或一个数字。绝不是场、渐变或第二盏灯。

## Motion · 运动

解决办法：首屏主视觉的文本在 `--ease-out` 上的 `--dur-long` 上从 0.6 淡入 1，一次，从可见的默认值。悬停会使表面亮度升高一度。当其来源发生变化时，值也会发生变化；没有任何东西滑动、循环或跟随光标。

## Voice · 嗓音

凉爽又空闲，夜班登记表：时间、计数、成本。简短的声明；数字总是带有它的单位或时间。切勿炒作。

## Do-nots · 不该做的事

- 绝不是温暖的口音；这里的光线很冷。
- 切勿显示较重的重量或正常宽度的头部；展开的300就是脸。
- 从不使用灯：卡片上没有径向发光、没有光晕、没有发光边缘。
- 切勿使用圆角或浅色截面；首尾相连且呈方形。
- 绝不是在双色调旁边拍摄自己颜色的照片，也绝不是日光场景。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@100,400;100,500;125,300&display=swap" rel="stylesheet">
```

```css
h1, h2 { font-weight: var(--display-weight); font-stretch: var(--display-stretch); line-height: 1.04; }
h3 { font-weight: 500; }
.fig { font-weight: var(--display-weight); font-stretch: var(--display-stretch); letter-spacing: -0.03em; line-height: 0.9; font-variant-numeric: tabular-nums; }
.well { background: var(--color-paper-2); border-radius: var(--radius-card); }
.well--raised { background: var(--color-paper-3); box-shadow: var(--shadow-card); }
.btn { border: var(--rule-hair) solid transparent; background: none; border-radius: var(--radius-pill); padding: var(--space-sm) var(--space-lg); font-weight: 500; color: var(--color-ink); transition: background-color var(--dur-short) var(--ease-out); }
.btn--primary { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--secondary { border-color: var(--color-rule-2); }
.btn--secondary:hover { background: var(--color-paper-2); }
.meter { height: 2px; background: var(--color-rule-2); } .meter > span { display: block; height: 100%; background: var(--color-accent); }
a:hover { text-decoration-color: var(--color-accent); }
.settle { animation: settle var(--dur-long) var(--ease-out) both; }
@keyframes settle { from { opacity: 0.6; } }
```
