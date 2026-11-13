# 卷轴编排：一劳永逸的模式

默认值仍然是none：`craft.md` § 5中的reveal-once是页面规范。此文件是例外：当内容具有值得固定或清理的序列时，在结构上使用一次滚动链接模式。 sloplint 的 F8 对模式族进行计数并标记第二个模式族。

## 预算

- **每页一种模式。** 两种滚动行为争夺相同的注意力。
- **切勿在正文上。** 目标是结构性的：固定部分、一个显示元素、一个 2px 书脊、数字。散文永远不会在读者面前移动。
- **首屏主视觉进入规则不变。** `craft.md` § 5 中的页面加载编排保持不变；卷轴编排永远不会取代它，也没有任何元素可以兼具两者。
- **静态最终状态强制。** 基础 CSS 显示完成的布局。编舞完全位于 `@supports (animation-timeline: view())` 和 `@media (prefers-reduced-motion: no-preference) and (min-width: 40rem)` 内部；减少动态效果，小屏幕和浏览器无需支持即可获取完整页面。
- **顺序问题：** `animation` 简写会重置 `animation-timeline` 和 `animation-range`，因此请在其后声明它们。
- **`linear` 在这里是正确的：** 拖动地图滚动距离以一对一地进行；缓动曲线将页面与拇指分离。
- 模式算作页面的三个运动基元 (`microinteractions.md`) 之一。

## 1 · 固定章节：固定部分时显示步骤

高轨道拥有一个命名的视图时间轴；固定窗格的步骤将其分成多个部分。 （卡住的窗格内的元素无法驱动自己的 `view()`：它们没有移动。）

```html
<section class="chapter">
  <div class="chapter__pin">
    <h2>How it works</h2>
    <ol class="chapter__steps"><li>…</li><li>…</li><li>…</li></ol>
  </div>
</section>
```
```css
.chapter { min-height: 280vh; }                          /* track length = pin duration */
.chapter__pin { position: sticky; top: calc(var(--banner-height, 0px) + var(--space-xl)); }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 40rem) {
    .chapter { view-timeline: --chapter block; }
    .chapter__steps li { animation: chapter-step linear both; animation-timeline: --chapter; }
    .chapter__steps li:nth-child(1) { animation-range: contain 5% contain 30%; }
    .chapter__steps li:nth-child(2) { animation-range: contain 30% contain 55%; }
    .chapter__steps li:nth-child(3) { animation-range: contain 55% contain 80%; }
    @keyframes chapter-step { from { opacity: 0.2; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  }
}
```

## 2 · 滑动链接标题：一个显示元素，剪辑擦除

对于中页声明标题 (`layout.md` § 5)，绝不是首屏主视觉 `h1`，其入口是负载显示。一页一个元素。

```css
.statement__head { /* base: fully drawn */ }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 40rem) {
    .statement__head {
      animation: head-wipe linear both;
      animation-timeline: view();
      animation-range: entry 20% cover 45%;
    }
    @keyframes head-wipe {
      from { clip-path: inset(0 100% 0 0); transform: translateX(-0.25em); }
      to   { clip-path: inset(0 0 0 0); transform: none; }
    }
  }
}
```

## 3 · 进度主干：`scroll(root)` 缩放 2px 规则

阅读进度如同发际线，而不是镀铬条。功能指示器，所以 `linear` 是佳能。隐藏在 40rem 下面（它吃掉了移动槽）。

```css
.spine { position: fixed; inset-block: 0; left: max(1rem, 2vw); width: 2px; background: var(--color-rule); }
.spine::after { content: ""; position: absolute; inset: 0; background: var(--color-accent);
  transform-origin: top; transform: scaleY(0); }
@media (max-width: 40rem) { .spine { display: none; } }
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 40rem) {
    .spine::after { animation: spine-grow linear both; animation-timeline: scroll(root); }
    @keyframes spine-grow { to { transform: scaleY(1); } }
  }
}
```

## 4 · 粘性双联画：两块图钉

结构为分体式(`layout.md` § 5)，一侧固定：`.sticky-stack { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: var(--gap-columns); }`、`.pane-sticky { position: sticky; top: calc(var(--banner-height, 0px) + var(--space-xl)); align-self: start; z-index: var(--z-sticky); }`、(it docks below a sticky nav, 56)、`.pane-scroll { display: grid; gap: var(--space-2xl); }`，每个图形为16：10且440px高或更高；在 60rem 一栏和 `position: static` 下。编排仅添加了这一点：滚动的人物在自己的 `view()` 上淡入（它们移动，因此自我时间线起作用）；固定的一侧从一个双联画到下一个双联画。

```css
/* base: .sticky-stack grid + .pane-sticky pin, above; the pinned side holds down the page */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) and (min-width: 40rem) {
    .pane-scroll figure { animation: fig-in linear both; animation-timeline: view();
      animation-range: entry 0% entry 60%; }
    @keyframes fig-in { from { opacity: 0.3; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  }
}
```

## JS 后备（可选，共享）

当 JS 存在而 `animation-timeline` 不存在时，一个后备方案是 `craft.md` § 5 中的 Reveal-once，而不是滚动侦听器或擦除 Polyfill：

```html
<script>
  if (!CSS.supports('animation-timeline: view()')) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -20%' });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  }
</script>
```

将其与到最终状态的 `--dur-long` `--ease-out` 转换配对，并仅在脚本添加 (62) 的 `.js` 类下隐藏 `[data-reveal]`。没有脚本，没有支持，静态布局已经是完成的页面。
