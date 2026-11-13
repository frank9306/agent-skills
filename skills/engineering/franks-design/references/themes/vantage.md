---
name: Vantage
slug: vantage
genre: modern-minimal
paper: dark 13.5 235
display: grotesk-sans Geologica
accent: chromatic-lime 126
posture: restrained
keywords: lidar, scan, survey, mapping, 3d, spatial, point cloud, robotics, autonomy, drone, construction, digital twin, geospatial, measurement, sensor, inspection, engineering, heritage, digitisation, infrastructure, reality capture, terrain
material: blue-black ground, a live point cloud of the real thing as the hero's light, a sweep that lights it, pale steel ink, Geologica with sharpened corners at a light weight, hairline frames with corner ticks, one lime signal for what was found
pictured: Feature Ledger, Stage hero
photo: muted con=6 sat=-20
---

# 华帝

夜晚的现实捕捉：事物本身、一个地点、一个山脊、一个物体，被渲染为蓝黑色地面上数以万计的测量点，在扫描穿过并照亮它们时缓慢转动。页面周围是安静的：《地质学》的角被削尖了，钢灰色墨水，只标记了角的细线框架，带有单位的数字。一个石灰信号意味着发现、测量、实时。它不是粒子网络，不是霓虹灯网络页面，也不是发光瓷砖的仪表板。

## Tokens · 设计令牌

```css
:root {
  --color-paper: oklch(13.5% 0.012 235); --color-paper-2: oklch(17% 0.014 235); --color-paper-3: oklch(21% 0.016 235);
  --color-ink: oklch(95% 0.006 230); --color-ink-2: oklch(82% 0.012 230); --color-muted: oklch(66% 0.016 230);
  --color-rule: oklch(27% 0.014 235); --color-rule-2: oklch(34% 0.016 235);
  --color-accent: oklch(89% 0.19 126); --color-accent-hi: oklch(93% 0.17 126); --color-accent-ink: oklch(19% 0.04 126); --color-focus: oklch(89% 0.19 126);
  --point-lo: oklch(42% 0.04 245); --point-mid: oklch(70% 0.04 232); --point-hi: oklch(96% 0.02 215);
  --color-slot: oklch(21% 0.016 235);
  --font-display: "Geologica", ui-sans-serif, system-ui, sans-serif; --font-body: "Geologica", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 4px; --radius-pill: 999px; --rule-hair: 1px; --tick: 10px;
  --shadow-card: none;
  --tracking-display: -0.035em; --display-weight: 300;
}
```

两个表盘，印有标记 (`vantage: terrain/steel`)。一次运行中的两个 Vantage 页面两者都不同。

| 拨号 | 选项 |
| --- | --- |
| **主题**（云是什么） | `terrain`（默认）：以倾斜角度从上方观察地面、结构和天篷。 `object`：一个物体扫描整个，绕其轴旋转。 `interior`：从内部看到的房间或隧道 |
| **配色** | `steel`（默认）如上所述。 `sodium`：接地`oklch(13% 0.012 55)`，从`oklch(40% 0.05 50)`到`oklch(95% 0.03 80)`点，墨水温热，石灰保持作为信号 |

## Type · 类型

- **显示：** Geologica 300，带有 `"SHRP" 100`（其尖角）、`--tracking-display`、行高 1.0、句子大小写；小标题400。头很短，位于平坦的地面上，而不是位于密集的点上。
- **主体：** Geologica 300，位于 17px 和 `"SHRP" 0`，线高 1.6，`--color-ink-2`。
- **测量：** Geologica 400，`tabular-nums`，单位在`--color-muted`薄空间后小一步；语句大小的数字为 200。将 Geologica 400 标记为小一步，句子大小写。从不单声道，从不追踪大写字母。

## Surfaces · 表面

- **云：** 一个生成的画布或仅由点组成的 WebGL 场景，它们之间没有线条，没有发光：从 `--point-lo` 到 `--point-hi` 的距离大小、高度颜色、柔和的深度淡入淡出。每隔几秒就会有一个扫掠平面经过，并将其接触的点提升到白色；发现的任何东西都是石灰。它充满了首屏主视觉的头部旁边或后面，并在边缘淡入纸上。
- **框架：** 细线 `--color-rule` 框仅在其角落（`--tick` 长刻度）绘制，围绕测量的物体或面板；仅用于输入的完整细线框。半径最大为 `--radius-card`。
- **标注：** 测量点的图形和单位带有引线 (a hairline with a 3px dot at the point)；屏幕上最多两个。
- **乐队：** 纸，2 纸用于一个安静的乐队；没有点亮或着色的带子。深度平坦，无阴影。
- **照片：**平日光下的真实地点或物体，静音，`--radius-card`；从来没有科幻渲染。

## Range · 范围

- **截面切割：**穿过云的一小片，在整个宽度上设置为点的轮廓，由引线和图形标出两个或三个高度。
- **扫描日志作为表格：** 捕获的行及其日期、面积、点和精度以表格形式表示，实时行用石灰点标记。
- **图层作为工作开关：**地面、结构、天篷和发现的项目作为规则的开关列表，真正重新着色或隐藏它们旁边的云。
- **测量的数字：** 在角刻度内声明尺寸的一个数字，其下方的公差处于静音状态。

## Controls · 控制

- 主丸：`--color-accent-ink`、48px、Geologica 400下的`--color-accent`；将鼠标悬停在 `--color-accent-hi` 上。次要：`--color-rule-2`中的发际线药丸，墨迹文字。
- 输入：`--color-paper-2` 孔，带有细线框架、石灰插入符和焦点。打开时切换石灰。
- 石灰仅标记发现的东西，无论是活的还是初级的；从来没有一个标题，也没有比药丸更大的填充物。

## Motion · 运动

云缓慢转动（两分钟内转一圈，七十秒内转动一个物体），每六到八秒扫描一次，缓入缓出，指针使视图倾斜几度。面板和行会消失一次。画布在屏幕外暂停。减少动态效果：一帧静止画面，扫描在场景中间停止。

## Voice · 嗓音

测量和精确：扫描什么、有多大、有多准确、多快。

## Do-nots · 不该做的事

- 永远不会有连接点的线条，永远不会发光或绽放，永远不会有网格地板后退到地平线。
- 除了石灰之外，在这些点上从未发现过超过一种色调。
- 切勿将云置于运行文本或表单后面。
- 绝不是等宽标签；数字是地质学表格。

## Build hint · 构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Geologica:wght,CRSV,SHRP@200..500,0,0..100&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: var(--display-weight); font-variation-settings: "SHRP" 100; letter-spacing: var(--tracking-display); line-height: 1; }
body { font-weight: 300; font-variation-settings: "SHRP" 0; }
.num { font-variant-numeric: tabular-nums; font-weight: 400; } .num .u { color: var(--color-muted); font-size: 0.75em; }
.ticks { position: relative; } .ticks::before, .ticks::after { content: ""; position: absolute; inset: 0; pointer-events: none; border: var(--rule-hair) solid var(--color-rule-2); -webkit-mask: conic-gradient(at var(--tick) var(--tick), transparent 75%, var(--color-ink) 0) 0 0 / calc(100% - var(--tick)) calc(100% - var(--tick)); mask: conic-gradient(at var(--tick) var(--tick), transparent 75%, var(--color-ink) 0) 0 0 / calc(100% - var(--tick)) calc(100% - var(--tick)); }
.btn { min-height: 48px; padding: 0 var(--space-lg); border: 0; border-radius: var(--radius-pill); background: var(--color-accent); color: var(--color-accent-ink); font: 400 var(--text-md)/1 var(--font-body); transition: background var(--dur-short) var(--ease-out); }
.btn:hover { background: var(--color-accent-hi); }
.btn--line { background: transparent; color: var(--color-ink); box-shadow: inset 0 0 0 var(--rule-hair) var(--color-rule-2); }
```
