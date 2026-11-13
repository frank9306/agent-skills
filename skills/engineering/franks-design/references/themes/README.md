# 编写主题文件

仅在创建或编辑主题时读取。构建永远不需要它。 `node scripts/theme.mjs validate <file>` 检查下面的合同，并且必须在主题发货之前通过。

**主题是一种材料，仅此而已。**它说明了页面的组成部分：纸张、墨水、面、规则、半径、深度、纹理、控件、运动、声音。它从不说明页面包含什么、以什么顺序、以什么形状或任何内容获得多少空间，并且它从不发送组件：没有签名对象、没有绘制的东西、页面必须包含的命名部分。空间、剖面构图和首屏主视觉的尺寸都属于`layout.md`，并且每个主题都相同； “空气承载页面”或“空白构成结构”的主题正在压倒它们。 Floor、`craft.md` 或 `layout.md` 已绑定的每条规则均被忽略。

## 标题块

每个文件都使用此块打开，`scripts/theme.mjs index` 将其编译为 `index.json`（交易读取索引，而不是文件）：

```
---
name: Coral
slug: coral
genre: modern-minimal
paper: light 96.5 50
display: grotesk-sans General Sans
accent: warm 28
posture: restrained
keywords: saas, platform, billing, payments, dashboard, b2b, startup, pricing, analytics, fintech, workflow, onboarding, trust, warm, human
material: warm grey paper, warm charcoal ink, General Sans throughout, soft pills, one coral signal
photo: muted
---
```

- `paper`：波段 (`light` over 85% L, `mid` 30 to 85, `dark` under 30)，然后是 `--color-paper` 的 L 和色调。
- `display`：上课，然后是脸。类别： `roman-serif`、`high-contrast-serif`、`slab-serif`、`grotesk-sans`、`grotesk-heavy`、`geometric-sans`、`rounded-sans`、`display-condensed`、`display-heavy`、`mono`、`pixel`、 `handwritten`、`blackletter`。
- `accent`：波段（`warm` 10 至 60°，`cool` 200 至 300°，`neutral` 色度低于 0.05，或 `chromatic-<name>` 用于其他任何值），然后是色调。
- `posture`：`restrained`、`committed`、`full-palette` 或 `drenched`。
- `keywords`：提示中路由到此处的单词，小写，逗号分隔，十到二十五。
- `material`：一行，交易打印它：纸张、墨水、面、表面、信号。只有材料，没有物体。
- `photo`：页面上每张照片采取的处理方式，由脚手架作为插槽中每个图像上的 CSS 写入 `base.css`：`natural`、`warm`、`muted`、`mono`、`duotone <dark> <light>` 或 `tint <colour>`（没有 `--color-` 的令牌名称，因此`duotone ink paper`)，可选地后跟带有整数的 `con=`、`sat=`、`vib=`、`exp=`、`sepia=`、`high=` 或 `shad=`。选择材料对照片的作用：新闻纸将其打印为黑色，里索将其拉成两种墨水，温暖的工作室使其保持自然。
- `pictured`：由`scripts/picture.mjs`编写，主题图片中页面的形状和首屏主视觉姿势，因此构建知道已经拍摄了哪个构图。

## 图片

每个主题都在其文件旁边附带 `<slug>.jpg`：主题中内置的已完成页面的第一个屏幕和一个下部屏幕，每个屏幕的分辨率为 1440 x 900，缩放至 960 宽并堆叠 (`node scripts/picture.mjs <slug> <page.html> <y of the lower screen>`)。页面必须干净整洁，在每个屏幕上都通过 `layout.md`，并且是设计师会签名的页面；它的下部屏幕完整地显示了正在工作的材料，并且它的图片是真实的（照片或构建的产品），而不是空的插槽。构建读取图片是为了调色板平衡、打字声音和表面，而不是为了布局。没有图片的主题将通过警告进行验证。

## 正文按顺序为 3,000 到 8,000 字节

1. **一段：**主题感觉如何，不是什么。没有品牌名称：描述寄存器，而不是有它的网站。
2. **标记：** `:root` 块，其中包含 OKLCH 中的实际值：paper、paper-2、paper-3、ink、ink-2、muted、rule、accent、accent-ink、focus；三个字体标记； `--radius-card`、`--radius-pill`、`--rule-hair`、`--shadow-card`； `--tracking-display`、`--display-weight`（每个头所承受的重量）。可选：`--color-slot`，当槽洗应采用第二种色调而不是强调色时。块内没有注释：`theme.mjs scaffold` 将其逐字复制到页面的 `tokens.css` 中。具有颜色设计的主题在块下方的短表中列出了替代方案，并且页面在设计记录中说明了其选择。
3. **类型：** 显示、正文和异常值（如果有），以及权重、跟踪、大小写和前导；尺寸来自共享比例 (`layout.md` § 2)，因此主题仅在其面需要的地方命名一步（压缩面可能会设置大一步）。标签、标题、表格标题、标签和导航链接是正文面小一步、句子大小写、未跟踪，或者一个标签面朝主题名称，绝不是单声道，除非单声道是该主题的材料。头部只有一种重量和一种颜色；一个基于重音单词的主题为其命名并表示它出现一次。
4. **表面：** 四到六个项目符号：规则重量和规则运行位置、半径、深度姿态、页面可以使用的条带（哪种纸张、多少张）、照片（什么样的图片适合材料、如何构图和裁剪、如何满足类型）、纹理预算（命名 `texture.md` 配方，如果有）。
5. **范围：** 在没有照片的情况下，对这种材料的用途进行三到四点说明：`layout.md` § 5 的哪种成分最适合以及与什么（显示面上的图形、绘制到表格中的规则、作为保持形状的带的重音、作为样本的线条、产品自身的表面）。主题中的页面将图片与只有此材料可以制作 (83) 的部分交替显示，因此范围使其无法作为图库进行阅读。这些是对共享组合的处理，不是页面必须包含的组件，也不是部分顺序。
6. **控件：** 两个或三个项目符号：控件对、链接、输入以及重音可能所在的位置。
7. **运动：** 一到三行：多快、如何缓和、什么可能移动。
8. **语音：** 副本寄存器上的一两行。
9. **注意事项：** 针对该主题自身故障模式的三到五个项目符号，切勿重述门。
10. **构建提示：** 最多 20 行 CSS 包含使材质可识别的规则（头部设置、控制对、孔或带表面、纹理（如果有））、每种颜色、持续时间、缓动和间隔标记（验证拒绝原始毫秒、裸 `ease`、命名颜色和原始间距）。字体链接为一行。

## 主题可能不包含什么

任何类型的组件或物体（盘子、标志、光盘、抽屉、贴纸、票据、绘制的产品、对开栏、页面必须绘制的标记）、部分序列、页面轮廓、强制导航、页脚、首屏主视觉或图像、HTML 支架、页面部分类名称、空间或密度规则、逐字复制、发明的品牌名称或人物、任何形式的标题上方的短标签、加宽字距的全大写或小写大写的标签、设计记录或徽章不包含任何事实、修复布局的计数、邻居比较表（该交易计算距标题块的距离）或参考站点列表。

## 应避免的矛盾

验收规则强制执行的 AI 外观的现场校准：带有高对比度衬线和赤土色 (65) 的奶油色纸；主题上的等宽标签声音，其材质不是单声道 (64)；标签、标签或控件采用大写字母 (67)；头部内有一个彩色或粗体的单词 (38iii)；中点元字符串和箭头后缀 (63)；斜体显示为繁体 (38)；在深色主题 (29) 上发光阴影和径向光晕。想要其中之一的主题将其声明为其在标头和文件中的材料，并且它放弃命名一次 Reflex，或者不具有它。
