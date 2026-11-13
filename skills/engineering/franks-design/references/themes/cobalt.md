---
name: Cobalt
slug: cobalt
genre: modern-minimal
paper: light 98.5 250
display: grotesk-sans Familjen Grotesk
accent: cool 256
posture: restrained
keywords: api, sdk, cli, dev tool, developer platform, docs, documentation, infrastructure, backend, database, observability, webhooks, events, type-safe, open source, ship, deploy, developer experience, technical
material: cool near-white paper, blue-grey ink and hairlines, Familjen Grotesk over IBM Plex Sans, a generated ASCII field on an 8 by 16 cell, keycaps and cut-corner panels, JetBrains Mono on graphite, one electric cobalt signal
photo: duotone graphite paper
pictured: Feature Ledger, Field hero
---

# Cobalt

冷白细线，Familjen Grotesk 标题配 IBM Plex Sans 正文。用 8 × 16 单元的 ASCII 字符和钴蓝色阶呈现真实流量。面板切对角，键帽带底边，代码区用石墨色。细线、切角和字符各有用途，避免深色开发者页面和终端外观。

## Tokens ·设计令牌

```css
:root {
  --color-paper: oklch(98.6% 0.005 250); --color-paper-2: oklch(96.2% 0.008 252); --color-paper-3: oklch(93% 0.011 252);
  --color-ink: oklch(21% 0.028 262); --color-ink-2: oklch(36% 0.022 260); --color-muted: oklch(50% 0.018 258);
  --color-rule: oklch(90% 0.009 252); --color-rule-2: oklch(83% 0.012 252);
  --color-graphite: oklch(21% 0.024 262); --color-graphite-2: oklch(26.5% 0.026 262); --color-graphite-ink: oklch(93% 0.010 250); --color-graphite-muted: oklch(69% 0.022 256);
  --color-accent: oklch(52% 0.19 258); --color-accent-2: oklch(76% 0.13 254); --color-accent-wash: oklch(95% 0.028 256); --color-accent-ink: oklch(98.6% 0.005 250); --color-focus: oklch(52% 0.19 258);
  --color-accent-deep: oklch(43% 0.2 262); --color-accent-edge: oklch(39% 0.16 260);
  --color-glyph-1: oklch(89% 0.025 254); --color-glyph-2: oklch(81% 0.045 255); --color-glyph-3: oklch(70% 0.085 256); --color-glyph-4: oklch(60% 0.13 257);
  --color-graphite-glyph-1: oklch(33% 0.03 262); --color-graphite-glyph-2: oklch(41% 0.05 260); --color-graphite-glyph-3: oklch(53% 0.1 258);
  --color-key-face: oklch(99.4% 0.003 250); --color-key-edge: oklch(80% 0.016 254);
  --font-display: "Familjen Grotesk", system-ui, sans-serif; --font-body: "IBM Plex Sans", system-ui, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;
  --radius-card: 8px; --radius-input: 6px; --radius-pill: 999px;
  --cell-w: 8px; --cell-h: 16px; --cut: 8px; --cut-l: 16px;
  --rule-hair: 1px; --shadow-card: 0 1px 2px oklch(21% 0.028 262 / 0.06);
  --shadow-key: 0 3px 0 0 var(--color-key-edge), 0 6px 8px -4px oklch(21% 0.028 262 / 0.28), inset 0 1px 0 oklch(100% 0 0 / 0.9);
  --shadow-key-accent: 0 3px 0 0 var(--color-accent-edge), 0 6px 8px -4px oklch(30% 0.12 260 / 0.45), inset 0 1px 0 oklch(100% 0 0 / 0.22);
  --shadow-key-press: inset 0 1px 2px oklch(21% 0.028 262 / 0.14);
  --tracking-display: -0.028em; --display-weight: 600;
}
```

## Type ·类型

- **显示：** Familjen Grotesk 600在头部和图形上，500在项目标题上，`--tracking-display`，行高1.02，句子大小写，表格图形；60px及以上的计数是最响亮的类型。
- **主体：** IBM Plex Sans 400和500。
- **标签、表头、状态：** Familjen Grotesk 500更小，`--color-muted`。无单声道。
- **代码和字形：** JetBrains Mono用于代码、机器值和字段；绝不是标签、磁头或芯片。

## Surfaces ·面

- 1px `--color-rule`对每个面做边缘处理并分割每一行；中性色倾斜至色调250至260。
-面板、芯片和区域在两个相对的角上切割：`border-radius: var(--cut-l) 4px`，`corner-shape: bevel round bevel round`在`@supports`内，`--cut`在小零件上，普通8px和6px半径作为后备。深度为`--shadow-card`和纸台阶；只有钥匙才有优势。
-地面是画布上生成的ASCII字段，而不是图片：每8 x 16个单元采样到字斜坡中的噪声，将`--color-glyph-1`着色到`-4`，其中`--color-accent-deep`表示最密集的单元，由产品自身的流程塑造（一侧为原始，另一侧已解析）。它坐在首屏的后面；一排分隔线和一石墨面板（石墨字形色调）可重复，最多四处；单元格上的点网格代表没有脚本。
-石墨是深色材料：`--color-graphite`位于`--color-graphite-ink`下，`--color-graphite-2`用于选定的行或标题条，`--color-graphite-muted`用于注释。语法采用`--color-accent-2`，绝不是彩虹。每页最多两个带，一石墨。
-照片很少见：最多一张，从远处看到的真实系统，双色调，没有文字。

## Range ·范围

- **API表格：**规则全宽，单声道机器值，钴洗上的一行。
- **映射：**两个石墨窗格，输入和输出，由细线弯头连接的匹配线。
- **作为标尺的时间线：**一根发际线上的真实秒数，尝试在Familjen 600中以显示尺寸显示其状态的刻痕刻度，作为尺寸线等待，错误颜色中的失败。
- **对提示数字的有效控制：**其结果是一米五十个单电池的一大数字。

## Controls ·控制

-键帽：3px底部边缘上的键面按钮，悬停时抬起1px，按下时下沉；第一主键是一把实心钴钥匙。选项是凹陷的纸盘3上的按键，按下选中一。
-命令是带有工作复制密钥的剪切芯片。链接在悬停时带有钴下划线。输入已剪切，`--color-muted`边框，钴焦点。
-状态是带有一图标的文本，而不是填充的芯片。场外屏幕的钴含量保留在5%以下。

## Motion ·运动

该场以30 fps的速度运行，带有指针镜头，在屏幕外暂停，是一在减少动态效果的时静止的场景。钥匙行程超过`--dur-micro`；连接器拉入一次。无反弹，无视差。

## Voice ·嗓音

声明性且具体，就像一好的变更日志：事件、端点、状态代码。没有炒作形容词。

## Do-nots ·不该做的事

-绝不是温暖的口音、药丸或渐变按钮。
-永远不要为了噪音本身而噪音：该字段映射了产品的流量或状态，并且没有类型位于其最密集的单元格上。
-禁止伪造代码：片段编译或返回；如果提示符中没有主机，请拨打`example.com`。

## Build hint ·构建提示

```html
<link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; letter-spacing: var(--tracking-display); color: var(--color-ink); } h3 { font-weight: 500; }
.key { border: var(--rule-hair) solid var(--color-rule-2); border-radius: var(--radius-input); padding: 0 var(--space-lg); min-height: 48px; background: var(--color-key-face); color: var(--color-ink); font: 500 var(--text-md)/1 var(--font-display); box-shadow: var(--shadow-key); transition: transform var(--dur-micro) var(--ease-out), box-shadow var(--dur-micro) var(--ease-out); }
.key:hover { transform: translateY(-1px); } .key:active { transform: translateY(3px); box-shadow: var(--shadow-key-press); }
.key--primary { background: var(--color-accent); border-color: var(--color-accent-edge); color: var(--color-accent-ink); box-shadow: var(--shadow-key-accent); }
.cut { border: var(--rule-hair) solid var(--color-rule); border-radius: var(--radius-card); background: var(--color-paper); }
@supports (corner-shape: bevel) { .cut { border-radius: var(--cut-l) 4px var(--cut-l) 4px; corner-shape: bevel round bevel round; } }
.graphite { background: var(--color-graphite); color: var(--color-graphite-ink); } .graphite .token { color: var(--color-accent-2); }
a { text-decoration-color: var(--color-rule-2); text-underline-offset: 0.2em; } a:hover { text-decoration-color: var(--color-accent); }
```
