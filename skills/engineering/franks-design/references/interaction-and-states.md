# 交互和状态

已加载表单和有状态控件。 `craft.md` § 9 和门 39a 拥有输入规则，§ 2 拥有对比；该文件拥有八状态表、字段配方和覆盖模式。

## 八种交互状态

| 状态 | 什么时候 | 治疗 |
| --- | --- | --- |
| 默认 | 休息时 | 基础造型 |
| 徘徊 | 指针指向 `@media (hover: hover)` 内部 | 一个信号：颜色步进、1px 提升或边框步进 (11) |
| 重点 | 键盘或程序焦点 | 戒指，立刻 (15, 26a) |
| 积极的 | 新闻发布会期间 | 1px 下降或加深一级 |
| 残疾人 | 不互动 | 三个通道在一起：`opacity: 0.55`、`cursor: not-allowed` 和本机 `disabled` 属性，或控件必须保持可聚焦的 `aria-disabled="true"` (39a) |
| 加载中 | 加工 | 内嵌进度；标签保持可读且宽度不跳跃 |
| 错误 | 失败的 | 边界上的`--color-error`，消息，`aria-invalid`；永远不要单独着色 |
| 成功 | 完全的 | 结果本身，来自服务器的回答；最多一个页面集合中的图标；没有吐司 (16)；未发出请求的无成功状态 (70) |

缺少其中之一的元素尚未完成。

## 焦点环

脚手架的环是页面的：`outline: 2px solid var(--color-focus); outline-offset: 2px`，插入输入（负偏移），因此它永远不会与相邻字段发生冲突。元素和页面的比例为 3:1。 `:focus-visible`，所以显示为键盘；决不 `outline: none` 没有替换。

## 点击目标

44 x 44 CSS px 代表手指可以触及的任何地方。展开一个小控件而不改变其外观：

```css
.icon-btn { position: relative; }
.icon-btn::before { content: ""; position: absolute; inset: -12px; }
```

## 表格

- 每个字段上方都有一个可见的标签；从不使用占位符作为标签。
- 占位符显示格式 (`01 Jan 2026`)，而不是指令。
- 一旦触摸该字段，就验证模糊，然后验证每个输入。
- 错误可以用一句话说明发生了什么、为什么发生以及该怎么做；将其与 `aria-describedby` 绑定到字段并设置 `aria-invalid="true"`。
- 必填字段包含 `aria-required` 和可见单词，切勿单独使用颜色。
- 仅当请求正在处理时禁用提交，切勿在休息时禁用提交。

## 表单字段

每个文本输入、文本区域、选择和组合框。

**边框永远不会改变宽度。** 状态移动到 `background-color`、`border-color`、`outline` 或 `box-shadow`，从不移动到 `border-width`；静止时保留透明轮廓，因此环看起来不会发生变化。

```css
.input { border: 1px solid var(--color-muted); outline: 2px solid transparent; outline-offset: -3px; }
.input:focus-visible { outline-color: var(--color-focus); }
```

| 状态 | 治疗 |
| --- | --- |
| 默认 | 1px `--color-muted` 边框 (a field's edge needs 3:1, which a rule never has)，纸张背景，`--color-muted` 中的占位符 |
| 徘徊 | `--color-paper-2`背景，边框不变 |
| 重点 | 戒指；相同宽度的边框可能会加深到`--color-ink-2` |
| 充满 | 默认；值承载状态 |
| 残疾人 | 三个通道；占位符变暗一级 |
| 错误 | `--color-error` 边框、辅助行中的错误文本、页面右侧插槽中设置的错误图标 |
| 成功 | 仅在真实支票退回后；页面集中的复选图标；当用户编辑时清除 |
| 加载中 | 右边缘插槽中有一个小旋转器；该字段保持可编辑状态，提交等待 |

- **高度：**输入与其旁边的按钮高度匹配 (44 to 52px on a marketing page, 39)；垂直内边距为 `(height - line-height) / 2`。
- **右边缘插槽：** 为清除按钮、错误字形或旋转器保留大约 24px，因此出现时不会出现任何回流。
- **标签** 4 至 8px 以上； **帮手**关于4px下面在标签的尺寸上，比较安静，在保留`min-height: 1lh` (F14)的一行中；该错误替换了该行中的帮助程序，永远不会添加第二个。
- 切勿过渡 `border-width`、`padding` 或 `height`；切勿为环设置动画。

**控件。** 文本区域：`resize: vertical`、`min-height: 6rem`。选择：本机，包装纸上有定制的 V 形图案；仅当它保留本机键盘和屏幕阅读器行为时，才是完全自定义的选择。复选框和单选框：原生，`accent-color` 用于廉价的正确版本，按 CSS 中的状态设置样式，从不通过脚本切换。开关是具有相同合同的复选框。范围：拇指聚焦并 44px 击中目标。文件输入：样式为`<label>`的表面。组合框：列表框位于下方，不推送内容，`aria-expanded` 镜像它，箭头循环，Enter 选择，Escape 关闭。

## 模态和叠加

- 原生 `<dialog>` 使用 `showModal()` 打开：焦点陷阱、Escape 和 `::backdrop` 免费。
- 添加自定义定位后将其固定，或者它可以捕捉到角落：`position: fixed; inset: 0; margin: auto; height: fit-content; max-height: min(80dvh, 40rem)`。非对话框叠加层以 `display: grid; place-items: center` 为中心位于固定容器上。
- `inert`在后面一页；关闭 Escape、背景单击和可见的关闭控件；首先关注第一个交互元素。

## 弹出窗口、菜单、工具提示

用于轻关闭、堆叠和逃逸的 Popover API； CSS 锚点定位（如果可用），否则为 `position: fixed` 和 `getBoundingClientRect()`；在视口边缘附近翻转；永远不会在夹住它的 `overflow: hidden` 祖先内部。

## 撤消超过确认

可逆操作立即运行，并提供 5 到 10 秒的撤消功能。不可逆的（删除帐户、删除表）保留确认，用户键入要销毁的事物的名称。

## 加载和空状态

- 内容形状已知的骨架（列表、卡片、表格）；一个旋转器仅在一个按钮中，取代了标签。
- 空状态是一行命名空的内容，一行说明空的原因，以及一项操作 (`craft.md` § 6)。从来没有一个裸露的*没有结果*。
- 用户注意力附近的禁用控件会说明其被禁用的原因。
