# 导出格式

当 `design.md` 存在并且其 `## Exports` 需要刷新时，或者当用户请求其他格式的令牌时加载。 `tokens.css` 是事实来源，由 `theme.mjs scaffold` 编写；所有其他格式都是它的翻译，仅在需要时才编写。

## 令牌集

| 家庭 | 设计令牌 |
| --- | --- |
| 颜色 | `--color-paper`、`-paper-2`、`-paper-3`、`-ink`、`-ink-2`、`-muted`、`-rule`（以及主题设置的 `-rule-2`）、`-accent`、`-accent-ink`、`-focus`、 `-error`、`-success`； `-field` 处于坚定的姿态，`-accent-2` 的主题命名了第二种墨水 |
| 类型 | `--font-display`、`--font-body`、`--font-outlier`； `--text-xs` 到 `--text-3xl`，16px、`--text-display-s`、`--text-display` 和角色 `--text-section` (`h2`)、`--text-title` (`h3`)、`--text-lead` 的比率为 1.25 (an app screen: a fixed 1.2 ratio, the roles at small fixed steps)； `--tracking-display` |
| 空间 | `--space-3xs` (2px) 至 `--space-4xl` (144px)，十步； `--container`、`--gutter`、`--gap-columns`、`--section-gap-s`、`--section-gap`、`--section-gap-l` |
| 形状 | `--radius-card`, `--radius-pill`, `--rule-hair`, `--shadow-card` |
| 运动 | `--ease-out`, `--ease-in`, `--ease-in-out`; `--dur-micro` 120ms, `--dur-short` 220ms, `--dur-long` 420ms |
| 层数 | `--z-base` 1, `-raised` 10, `-dropdown` 100, `-sticky` 200, `-sticky-nav` 300, `-modal` 400, `-toast` 500, `-tooltip` 600 |

需要另一个令牌的页面按角色命名并在 `tokens.css` 中声明；下游没有使用 `tokens.css` 未声明的名称。

## 项目中的 `tokens.css`

脚手架在项目的入口样式表旁边写入 `tokens.css` 和 `base.css`（`src/index.css`、`app/globals.css`；`--dir` 命名另一个文件夹），并打印适合它的两个导入。它们紧跟在文件的最后一个 `@import` 之后，永远不会低于规则：CSS 会删除紧随其后的 `@import`，并且标记会消失而不会出现错误。如果项目已经命名其设计令牌（`--background`、Tailwind `@theme`），请将 Hallmark 的角色映射到这些名称上，而不是添加并行集。仅当用户请求完全接管时才替换该文件。

## 顺风 v4

其中入口样式表导入 Tailwind 4，脚手架将 `tokens.css` 写在两个块中，导入遵循 `@import "tailwindcss"`：

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./base.css" layer(base);
```

```css
@theme static { --color-paper: oklch(96.5% 0.008 50); --font-display: "Fraunces", serif; --text-lg: 1.25rem; --radius-card: 4px; }
:root { --space-lg: 24px; --dur-short: 220ms; --z-modal: 400; --section-gap: 144px; }
```

- **`@theme static`** 持有每个 `--color-*`、`--font-*`、`--text-*`、`--tracking-*`、`--radius-*`、`--shadow-*` 和 `--ease-*` 设计令牌，因此每个设计令牌都是一个实用程序（`bg-paper`、`text-ink`、 `font-display`、`rounded-card`），并且是静态的，仍然是手写 CSS 的变量。其他一切都保留在 `:root` 中。
- **绝不是 `--spacing-<name>`。** Tailwind 大小来自该命名空间的 `w-`、`max-w-`、`p-` 和 `gap-`，因此 `--spacing-xl: 40px` 将 `max-w-xl` 转换为 40px。空间尺度不需要映射：除了 2px 之外的每一步都是 Tailwind 的 4px 单位的倍数（`--space-lg` 是 `p-6`，`--space-xl` 是 `p-10`，`--space-2xl` 是 `p-16`）。
- **九个名称是 Tailwind 自己的：** `--text-xs`、`-sm`、`-lg`、`-xl`、`-2xl`、`-3xl` 和三个 `--ease-*`。脚手架的值取代了 Tailwind 的值，因此 `text-lg` 和 `ease-out` 在项目使用它们的任何地方都会发生变化。在一个新项目中，系统即将进行重新设计或全面重新设计。在其他页面不得移动的项目中的一个新页面上，从 `@theme` 中取出这九个页面，并将它们声明在页面的根元素上。
- **`base.css` 位于基础层。** 无分层，其元素规则（`a { color: inherit }`、`h1 { max-width: 20ch }`）优先于每个实用程序，因为 Tailwind 的实用程序位于一个层中。
- **该标记是从源中读取的。** Tailwind 会删除其发出的内容的评论； sloplint 读取您编写的样式表。

Tailwind v3（`@tailwind` 指令）：`tokens.css` 保留一个 `:root` 块，标记和两个导入都位于指令上方（在指令下方它们被删除），`base.css` 和 `layer(base)` 因此它在预检之后着陆并位于实用程序下方。根据请求提供实用程序：`tailwind.config` 中 `theme.extend` 下的相同名称，每个值都是令牌的 `var()`。

## DTCG `tokens.json`

对于样式词典或 Tokens Studio 管道。基于路径，每个标记上都有一个 `$type`，OKLCH 作为字符串（仅当管道无法读取它时才转换为十六进制，并且说转换是有损的）。流体尺寸输出其最大值； `clamp()` 保留在 CSS 中。

```json
{
  "color": {
    "paper": { "$value": "oklch(96.5% 0.008 50)", "$type": "color" },
    "accent": { "$value": "oklch(62% 0.17 28)", "$type": "color" }
  },
  "font": { "display": { "$value": "General Sans, ui-sans-serif, sans-serif", "$type": "fontFamily" } },
  "space": { "lg": { "$value": "24px", "$type": "dimension" } },
  "duration": { "short": { "$value": "220ms", "$type": "duration" } }
}
```

## shadcn/ui

shadcn 将完整颜色值保留在自己的变量中，并将它们映射到 `@theme inline` 中。将其变量指向 Hallmark 的标记：

```css
:root {
  --background: var(--color-paper); --foreground: var(--color-ink);
  --card: var(--color-paper-2); --card-foreground: var(--color-ink);
  --popover: var(--color-paper-2); --popover-foreground: var(--color-ink);
  --primary: var(--color-accent); --primary-foreground: var(--color-accent-ink);
  --secondary: var(--color-paper-3); --secondary-foreground: var(--color-ink-2);
  --muted: var(--color-paper-2); --muted-foreground: var(--color-muted);
  --accent: var(--color-paper-3); --accent-foreground: var(--color-ink);
  --destructive: var(--color-error);
  --border: var(--color-rule); --input: var(--color-rule); --ring: var(--color-focus);
  --radius: var(--radius-card);
}
```

shadcn 的 `accent` 是悬停表面，其 `muted` 是安静背景，因此其 `@theme inline` 块定义的 `--color-accent` 和 `--color-muted` 的含义与 Hallmark 的含义相冲突。在 shadcn 项目中，将 Hallmark 的两个令牌保留在 `@theme` 之外，让页面 CSS 通过 `var()` 到达它们，或者在那里重命名它们（`--color-signal`、`--color-ink-3`）并在交接中如此说明。
