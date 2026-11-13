---
name: Bloom
slug: bloom
genre: atmospheric
paper: light 97 72
display: grotesk-sans Ranade
accent: warm 36
posture: committed
keywords: generative, ai creative, music, song, video, image, voice, art, make, create, compose, render, imagine, prompt, creative studio, playground, expressive, warm, daylight, consumer creative, portrait, headshot, selfie, retouch
material: warm off-white paper with grain and a generated working grid, two quiet terracotta blooms, warm umber ink, Ranade with one roman Gambarino figure, rubber and cased parts lit from above, part tones on rounded clips
photo: warm exp=4
pictured: Workbench, Stage hero
---

# Bloom

像阳光照在工作纸上。暖白纸带细纹，钢琴卷帘、时间线或标尺的网格印在底面，向主区淡出。用棕墨与 Ranade，偶尔以正体 Gambarino 点题。在网格上用圆角片段展示创作，交互件带物理质感，如边框内的橡胶键和从堆叠抽出的盒。避开霓虹暗画布、奶油色编辑页和赤陶海报。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(97% 0.010 72); --color-paper-2: oklch(94.6% 0.013 70); --color-paper-3: oklch(91.5% 0.016 66);
  --color-ink: oklch(21% 0.024 40); --color-ink-2: oklch(31% 0.022 46); --color-muted: oklch(49% 0.02 56);
  --color-rule: oklch(88% 0.014 64); --color-sheet: oklch(98.7% 0.007 78);
  --color-accent: oklch(53% 0.145 36); --color-accent-2: oklch(66% 0.10 55); --color-accent-soft: oklch(53% 0.145 36 / 0.11);
  --color-accent-ink: oklch(98.5% 0.008 72); --color-focus: oklch(53% 0.145 36);
  --lane-1: oklch(50% 0.04 55); --lane-2: oklch(48% 0.105 28); --lane-3: oklch(70% 0.115 72); --lane-4: oklch(65% 0.085 12);
  --grid-16: oklch(21% 0.024 40 / 0.035); --grid-beat: oklch(21% 0.024 40 / 0.075); --grid-bar: oklch(21% 0.024 40 / 0.15); --grid-row: oklch(21% 0.024 40 / 0.045);
  --rubber: oklch(55% 0.15 34); --rubber-hi: oklch(66% 0.125 42); --rubber-lo: oklch(43% 0.125 31);
  --umber: oklch(30% 0.03 45); --bezel: oklch(92.5% 0.014 68); --case: oklch(93.5% 0.012 70);
  --hi: oklch(99.6% 0.006 80 / 0.75); --shade-1: oklch(21% 0.024 40 / 0.08); --shade-2: oklch(21% 0.024 40 / 0.16); --shade-3: oklch(30% 0.06 40 / 0.28);
  --font-display: "Ranade", ui-sans-serif, system-ui, sans-serif; --font-body: var(--font-display);
  --font-outlier: "Gambarino", Georgia, serif; --font-code: "Geist Mono", ui-monospace, monospace;
  --radius-card: 18px; --radius-inner: 10px; --radius-clip: 6px; --radius-pill: 999px; --rule-hair: 1px;
  --shadow-card: 0 1px 2px oklch(21% 0.024 40 / 0.06), 0 18px 36px -18px oklch(21% 0.024 40 / 0.26);
  --shadow-lift: 0 2px 4px oklch(21% 0.024 40 / 0.07), 0 36px 72px -32px oklch(45% 0.1 40 / 0.34);
  --tracking-display: -0.024em; --display-weight: 600;
}
```

## Type ·类型

- **显示：** Ranade 600每个头，`--tracking-display`，行高1.04至1.08，句首字母大写，一种颜色：墨水。
- **主体：** Ranade 400，17至18px，线高1.55；500用于标签和控件。一共三个重量。
- **衬线时刻：** Gambarino 400，罗马字体，一页一次：160px或更多处的一数字，或一lede。无头，无斜体。
- **标签：** Ranade 500更小一点，句子大小写，`--color-muted`。Geist Mono仅适用于内置产品内的标尺精细数字和时间码。

## Surfaces ·面

-地面是CSS中介质的网格：在舞台后面的`--color-sheet`上堆叠线性渐变的小节、节拍、十六分之一和行（钢琴卷轴的黑键行每八度着色），再继续微弱地经过它并屏蔽以径向淡出。网格在台阶旁边和结束时以小块作物的形式返回。
-在网格上，作品：`--lane-*`色调的四个部分通道作为圆形剪辑（`--radius-clip`，有色渐变，通道色调中的插入细线，亮起的顶部边缘）携带小节波形或音符；细线播放头；一按键条和一精细的数字标尺。
-生成纹理：纸张上的180px feTurbulence纹理为5%，橡胶上的柔光为30%。
-光线从上方照射到每个部分。留下两朵温暖的花朵，更安静：`--color-accent`位于右上角8%附近，`--color-accent-2`位于左下角5%附近，已修复。
-凸起的温暖面，绝不发丝的盒子：`--shadow-card`、`--shadow-lift`是最重要的一款。最多两个带子，无兵马俑。
-照片：家里的日光、手、窗边的乐器；晚上从来不去工作室。

## Range ·范围

- **输入成为一网格上的输出：**用户给出的内容（嗡嗡声、草图、线条）绘制为落在网格上的轨迹，结果在下面的车道中增长，并且Play真正播放它。
- **作为装箱书脊的选择：**作为一堆箱子的选项（带光条纹的色带、卡片标签、其部件的点）；选中一项滑出，网格重新排列。
- **衬线中的一数字**位于三个台阶旁边，每个台阶都有一小部分网格。
- **结果作为一剪辑**在结束时网格上，可下载。

## Controls ·控制

-第一是凹进式边框中的橡胶盖：从顶部照亮的圆顶`--rubber`径向渐变，纹理，设置在带有嵌入式灯罩的`--bezel`井中；它位于带有标签的`--color-sheet`药丸的左侧，当产品聆听时，其圆环会呼吸。按下使其下沉1px。
-次要：带有遮光环和顶部边缘发光的片状药丸，或`--umber`药丸。
-赤土色链接，悬停时有下划线；输入具有1px `--color-muted`边缘的52px药丸。

## Motion ·运动

一次，在视图中：输入绘制在(about 3 s)中，音符稳定，播放头滑回原处，车道增长。变换和不透明度，在屏幕外暂停。减少动作或无脚本：完成的编曲，播放头位于开头。花儿永远不会移动。

## Voice ·嗓音

温暖、日光、具体：动词（哼、做、听）、输出（歌曲、部分、场景）和地点。

## Do-nots ·不该做的事

-绝不是黑暗的画布、霓虹灯或第三朵花。
-无兵马俑或卡片；赤土是橡胶，是链接，是车道。
-禁止在整个部分上用满强度的网格；它从舞台上消失了。
-绝不用斜体衬线，也绝不在头部或两个地方用衬线。

## Build hint ·构建提示

```html
<link href="https://api.fontshare.com/v2/css?f[]=ranade@400,500,600&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=gambarino@400&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-weight: var(--display-weight); color: var(--color-ink); }
.roll { --beat: 40px; --row: 14px; background-color: var(--color-sheet); background-image: linear-gradient(to right, var(--grid-bar) 1px, transparent 1px), linear-gradient(to right, var(--grid-beat) 1px, transparent 1px), linear-gradient(to right, var(--grid-16) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-row) 1px, transparent 1px); background-size: calc(var(--beat) * 4) 100%, var(--beat) 100%, calc(var(--beat) / 4) 100%, 100% var(--row); }
.clip { --c: var(--lane-1); border-radius: var(--radius-clip); background: linear-gradient(color-mix(in oklab, var(--c) 18%, var(--color-sheet)), color-mix(in oklab, var(--c) 28%, var(--color-sheet))); box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--c) 42%, transparent), inset 0 1px 0 var(--hi); }
.rec { border-radius: 50%; background: radial-gradient(circle at 50% 30%, var(--bezel), var(--color-paper-3)); box-shadow: inset 0 2px 3px var(--shade-2), 0 1px 0 var(--hi); }
.rec__cap { border-radius: 50%; background: radial-gradient(120% 110% at 50% 18%, var(--rubber-hi), var(--rubber) 48%, var(--rubber-lo)); box-shadow: inset 0 1px 0.5px var(--hi), 0 5px 9px -3px var(--shade-3); }
.pill { border-radius: var(--radius-pill); background: var(--color-sheet); box-shadow: 0 0 0 1px var(--shade-1), 0 8px 18px -10px var(--shade-2), inset 0 1px 0 var(--hi); font-weight: 500; }
a { color: var(--color-accent); text-underline-offset: 0.2em; }
```
