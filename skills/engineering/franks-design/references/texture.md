# 纹理和印刷伪影：预算词汇

仅当所选主题获得纹理（下面的亲和力表）或打印自定义绘图的谱系时才加载。纹理是一种有预算的处理，而不是氛围：每页一个工件系列，标记不透明，从不动画，从不低于正文文本超过耳语。 `flow.md` § 背带拒绝；到处都是颗粒。这个文件中的谷物，在一个赢得它的主题上，是工艺。

## 预算（对每个工件都有约束力）

- **每页一个伪像系列。** 颗粒、半色调、重合失调、扫描线或定边，绝不是两种。立体印刷是一个家族：它的纹理和套准失调都来自同一个鼓。照片处理的半色调属于图像，而不是页面，并且不算数。
- **标记不透明度，在标记块中声明：** `--texture-opacity` <= 0.08 页面宽度，<= 0.15 范围为卡片或板。在运行正文时，<= 0.05 或什么都没有。低频洗涤（基本频率为 0.02 或更低：纤维、纸张色调）会着色而不是斑点，并且可能会达到 0.12 页面宽度，并根据结果测量对比度。
- **从不动画。**没有漂移的颗粒，没有脉动的点。
- **`pointer-events: none` 和 `aria-hidden="true"`** 在每个叠加层上；纹理从不拦截输入，复古信号大气，绝不是绘制的显示器边框 (47a)。
- **性能：** 纯 CSS 或数据 URI SVG 过滤器；没有图像纹理请求。

## 1. 粒（纸）

斑点颗粒，标记化：

```css
:root { --texture-opacity: 0.08; }
.grained { position: relative; isolation: isolate; }
.grained::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background-size: 200px 200px; opacity: var(--texture-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 9 -4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
```

颜色矩阵将噪声转化为离散斑点（alpha 是噪声乘以 9 再减去 4），因此颗粒读取速度在预算范围内的 1 倍；未经处理的 `feTurbulence` 这些不透明度是无人看到的阴霾。在深色背景上，斑点必须是浅色：将矩阵的前三行更改为 `0 0 0 0 1`，以便每个斑点都是白色的，保持不透明度。当主题命名为谷物时，一张印版、一张强调卡或 0.08 或更少的页面。

## 2. 半色调（点域）

带有尺寸标记的点屏：

```css
:root { --halftone-size: 12px; --halftone-dot: 1.5px; }
.halftone { background-image: radial-gradient(var(--color-ink) var(--halftone-dot), transparent var(--halftone-dot));
  background-size: var(--halftone-size) var(--halftone-size); }
```

板填充和截面带。切勿在字体下方或重叠。墨水点或一种专色，绝不是在全场强度下的重音。

## 3. 重合失调（色差回声）

Riso 的签名，可移植到任何打印谱系自定义运行：

```css
.misreg { position: relative; display: inline-block; isolation: isolate; }
.misreg::before, .misreg::after {
  content: attr(data-text); position: absolute; inset: 0; z-index: -1;
  white-space: nowrap; pointer-events: none;
}
.misreg::before { color: var(--color-accent);   transform: translate(-2px, -2px); }
.misreg::after  { color: var(--color-accent-2, var(--color-focus)); transform: translate(2px, 2px); }
```

**每页一个焦点词，在首屏主视觉中，在主题 `waive 38iii` 下； ** 跨度是一个内联块，因此无论头部的行高如何，副本都位于字形上，并且它们打印在墨水后面，因此单词保持其颜色；只有边缘带有回声。回声颜色是主题声明的专色墨水（此处为 `--color-accent` 和 `--color-accent-2`，或主题自己的回声标记）；偏移量保持为 1 到 3px（更多读取被破坏，未打印）。最多可以在`--dur-long`以上的负载上稳定一次，减少动态效果时静态；它永远不会循环。

## 4. 扫描线（CRT）

街机的配方；复古的信号是大气，绝不是绘制的显示器边框 (47a)：

```css
:root { --scanline: oklch(from var(--color-ink) l c h / 0.06); }
body::after { content: ""; position: fixed; inset: 0; z-index: var(--z-raised);
  pointer-events: none;
  background: repeating-linear-gradient(transparent 0 2px, var(--scanline) 2px 3px); }
```

`--scanline` 是一个低 alpha 的页面本地装饰令牌。仅限拱廊和毗邻拱廊的海关。

## 5. Deckle（纸边）

对于印刷沿袭页面上的车牌、门票和存根：

```css
.deckled { box-shadow: inset 0 0 0 1px var(--color-rule);
  mask-image: radial-gradient(6px at 0 50%, transparent 97%, black);
  mask-size: 12px 24px; mask-repeat: repeat-y; mask-position: left; }
```

每页一个边缘、一个元素类（票据边缘、设计记录齿孔）。一般不会出现在卡片上；它是一个工件，而不是边框​​样式。

## 亲和力：谁赢得质感

当主题的 Surfaces 部分命名时，主题就获得了纹理；自定义抽奖在打印其血统（立体印刷、凸版印刷、票券、行式打印机）时获得它，然后它选择血统使用的一个工件。上面的预算绑定了每个主题，无论其文件如何规定：页面宽度的颗粒度为 0.08 或更少，一个板块内的颗粒度为 0.15，运行文本下的颗粒度为 0.05 或没有。示例：Riso（颗粒和套准不准）、半色调（点网）、粘贴（纤维清洗）、暗室（胶片颗粒）、Arcade（扫描线）。

**从不：**主题未命名的纹理、现代最小页面上的纹理、一页上的两个工件系列，或者由于页面感觉平坦而将纹理作为所有内容的氛围。

## 减少动态效果和可达性

一旦定位错误就解决了，其他的都不会移动；这里的所有内容在 `prefers-reduced-motion: reduce` 下都是相同的，因为没有任何动画。纹理永远不会将文本对比度降低到 Gate-40/41 阈值以下：测量纹理结果的对比度，而不是平面标记的对比度。
