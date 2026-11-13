---
name: Refract
slug: refract
genre: atmospheric
paper: light 98.2 95
display: grotesk-sans Funnel Display
accent: cool 232
posture: restrained
keywords: pool, lido, swim, spa, hotel, resort, water, skincare, sunscreen, eyewear, glass, optics, light, daylight, architecture, interiors, studio, wellness, bathhouse, summer, clean, calm, product launch, hardware
material: sunlit white plaster with real light falling across it, water caustics or prism dispersion rendered live, deep pool-blue ink, Funnel Display at a light weight over Funnel Sans, clear surfaces that cast tinted shadows, one water signal
pictured: Timetable-led, Stage hero
photo: natural con=3 exp=4
---

# 折射

强烈阳光下的白色石膏，用光线进行装饰：水焦散网在地面上移动，或者棱镜在页面上投射光谱及其明亮的尖点。其他一切都很安静：深蓝色的墨水、重量轻的漏斗显示器、清晰的表面，其阴影带有穿过它们的光线的色彩。感觉就像炎热的下午的凉爽房间。它不是彩虹渐变，不是模糊的磨砂玻璃，不是蓝色科技登陆页面。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(98.2% 0.006 95); --color-paper-2: oklch(96.4% 0.006 95); --color-paper-3: oklch(93.6% 0.008 95);
  --color-ink: oklch(23% 0.035 245); --color-ink-2: oklch(36% 0.035 245); --color-muted: oklch(50% 0.025 240);
  --color-rule: oklch(89.5% 0.008 230); --color-rule-2: oklch(93.5% 0.006 230);
  --color-accent: oklch(50% 0.12 234); --color-accent-hi: oklch(44% 0.12 236); --color-accent-ink: oklch(99% 0.003 95); --color-accent-soft: oklch(94% 0.025 220); --color-focus: oklch(56% 0.14 234);
  --color-shade: oklch(86% 0.05 212); --color-shade-2: oklch(74% 0.07 220); --color-light: oklch(99.7% 0.004 95);
  --spec-1: oklch(78% 0.15 32); --spec-2: oklch(90% 0.15 105); --spec-3: oklch(82% 0.13 175); --spec-4: oklch(66% 0.15 270);
  --color-slot: oklch(86% 0.05 212);
  --edge-light: inset 0 1px 0 oklch(100% 0 0 / 0.9), inset 0 0 0 1px oklch(100% 0 0 / 0.55);
  --shadow-card: 18px 28px 48px -26px oklch(52% 0.09 220 / 0.38), 2px 3px 6px -2px oklch(40% 0.05 230 / 0.12);
  --shadow-cast: 28px 40px 70px -30px oklch(60% 0.11 212 / 0.45);
  --font-display: "Funnel Display", ui-sans-serif, system-ui, sans-serif; --font-body: "Funnel Sans", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 22px; --radius-inner: 12px; --radius-pill: 999px; --rule-hair: 1px;
  --tracking-display: -0.032em; --display-weight: 400;
}
```

两个表盘，印有标记 (`refract: water/pool`)。一次运行中的两个 Refract 页面两者都不同。

| 拨号 | 选项 |
| --- | --- |
| **光**（生成的地面） | `water`（默认）：来自流动水面的焦散，水色阴影上的明亮网。 `glass`：阳光透过玻璃窗，玻璃边缘分为温暖和凉爽，棱镜的扇形穿过补丁，落在产品和地面上，像太阳一样缓慢 |
| **配色** | `pool`（默认）如上所述。 `noon`：墨水`oklch(20% 0.01 260)`，口音接近黑色，光谱唯一颜色 |

## Type · 类型

- **显示：** 漏斗显示 400 (300 for a figure set at statement size)、`--tracking-display`，行高 1.02，句首字母大写，一种颜色。头脑保持冷静；灯光是最响亮的部分。
- **正文：** Funnel Sans 400，位于 17px，行高 1.6，`--color-ink-2`； `--color-muted` 领先一步。
- **标签、表头、时间：** Funnel Sans 500 缩小一步，句子大小写，每个图上都有 `tabular-nums`。从不单声道，从不追踪大写字母。

## Surfaces · 表面

- **灯光：** 一个生成的画布或着色器，而不是纹理的照片，也不是渐变斑点。在`water`中，阴影是`--color-shade`，网是`--color-light`，在最亮的接缝处微弱地分裂成`--spec-*`；在 `glass` 中，地面保持纸状，`--spec-*` 的条带以低角度掉落，沿一侧边缘有白色尖端。光线落在首屏主视觉远离头部的一侧，并在文本下方消失在纸上，因此头部始终位于普通纸上。
- **清晰的表面：** 在 `--edge-light` 的光照下，面板呈白色 72% 至 86%，永不模糊；他们的影子正好从一个太阳（`--shadow-card`）上落下来，被水染上了颜色。第二个较大的演员表 (`--shadow-cast`) 仅位于页面上的一个主要对象下方。
- **规则：** `--color-rule` 中的细线，仅水平，在表格和列表中。面板上的半径 `--radius-card`，内部的 `--radius-inner`，用于控制的药丸。
- **带子：**纸和纸-2；一个带可以再次点亮（关闭或声明），一页上点亮的地面不得超过两个。
- **照片：**明亮、阳光照射、硬阴影、水或白色建筑或阳光下的产品；没有人摆姿势。容器内全出血的方角，`--radius-card`。没有双色调。

## Range · 范围

- **预订通道的时间：**当访客选择一个会话时，会话作为长规则的行，显示数字中的时间，右侧边缘的状态药丸，下一个空行由其后面的细光带照亮。
- **太阳下的数字：** Funnel Display 300 中声明大小的一个数字，光线落在其旁边的空间中，其单位和光源位于一条静音线中。
- **白天为光：** 一条小时作为细长条，其高度为光或需求，当前时间由重音点标记，其余部分为 `--color-shade`。
- **桌子上的产品：** 产品的真实屏幕是一块位于灯光下的透明面板，其投射的阴影有色，一个可以移动灯光本身的工作控件。

## Controls · 控制

- 主要药丸：`--color-accent-ink`下的`--color-accent`，顶部边缘白色插入，48px；悬停时颜色变暗为 `--color-accent-hi`。二级药丸：白色，80%，带有 `--edge-light` 和发际线。
- 输入为带有细线和 `--radius-inner` 的白色孔； `--color-focus` 中的对焦环。
- 重音位于主要、焦点、当前标记和悬停链接上；光谱只存在于光中。

## Motion · 运动

水以游泳池速度 (a full pattern change in about 12 seconds) 移动；玻璃像太阳一样漂移，60 秒内穿过一条带。面板在悬停时抬起 2px，并拉长阴影。光线在屏幕外暂停。减少动态效果：一帧静止的灯光。

## Voice · 嗓音

明亮而朴素，有点感官：温度、时间、光的作用。

## Do-nots · 不该做的事

- 切勿在多个对象上出现彩虹文字、渐变按钮或光谱边框。
- 切勿使用磨砂玻璃或背景模糊；清晰的表面保持清晰。
- 切勿在运行文本下点亮灯光，也切勿连续放置两个点亮的地面。
- 绝不是灰色阴影；每一个阴影都带有光的色彩，从一个太阳落下。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500&family=Funnel+Sans:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); letter-spacing: var(--tracking-display); line-height: 1.02; }
.clear { background: color-mix(in oklab, var(--color-light) 80%, transparent); border-radius: var(--radius-card); box-shadow: var(--edge-light), var(--shadow-card); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); font: 500 var(--text-md)/1 var(--font-body); box-shadow: var(--shadow-card); transition: background var(--dur-short) var(--ease-out); }
.btn:hover { background: var(--color-accent-hi); }
.btn--clear { background: color-mix(in oklab, var(--color-light) 80%, transparent); color: var(--color-ink); box-shadow: var(--edge-light), var(--shadow-card); }
.light { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; -webkit-mask-image: linear-gradient(to right, transparent 30%, var(--color-ink) 62%); mask-image: linear-gradient(to right, transparent 30%, var(--color-ink) 62%); }
```
