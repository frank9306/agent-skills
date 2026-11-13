# 字体

在自定义运行中加载。目录主题已经命名了它的面孔；不要阅读本文来进行事后猜测。

**阅读前需要：**页面的想法及其显示的内容。 **给出：** 一个显示面、一个主体面、一个可选的异常值和加载规则。

## 规则

一张展示脸和一张本体脸，或者两者都是一个家族；可选的异常值仅具有一个角色（文字标记、标题数字、代码）。自定义运行选择没有目录主题集的显示面：`node <skill-dir>/scripts/theme.mjs check --face "<face>"` 拒绝​​正在使用的显示面，因此在写入令牌之前运行它。下面的列表已经将这些面孔排除在外。选择该想法所需的类别，然后从中选择两个或三个面孔，并根据页面上的形状和颜色决定每个面孔中设置的真实标题；面孔的名字、声誉或主题关联都不是理由。仅自由面孔，除非用户已确认许可；首选可变字体。

## 默认被禁止

每个模型都先达到这些，所以它们读作未选择：Inter、Roboto、Open Sans、Lato、Poppins、Source Sans、Nunito、Montserrat、Raleway、Work Sans、DM Sans、Plus Jakarta Sans、system-ui、Arial 和 Helvetica 作为显示或字体； Merriweather、Lora 和 Georgia 作为正文衬线；快递新或系统单。当用户请求或预检在项目中找到其中之一时，页面仍可能使用其中之一；那么设计记录就是这么说的。

**饱和**（漂亮的面孔，但第一个答案，所以他们想在 设计决策清单中争论）：Playfair Display、Cormorant Garamond、DM Serif Display、Fraunces、Instrument Serif、Recoleta、Space Grotesk、Hubot Sans、Bebas Neue 和 Unbounded 作为显示； Geist、Instrument Sans 和 Mona Sans 作为正文或整个页面。

## 来源

- **Google 字体。** 免费，由 CDN 提供，可在任何地方使用。默认来源。
- **Fontshare**（印度字体铸造厂）。免费用于商业用途，铸造级。一行：`<link href="https://api.fontshare.com/v2/css?f[]=<family>@<weights>&display=swap" rel="stylesheet">`。
- **铸造厂**（Klim、Pangram Pangram、Production Type、Lineto、Colophon）仅在用户确认许可时；然后询问哪个并直接从中选择。

## 显示目录不使用的面孔

| 班级 | 面孔（来源） |
| --- | --- |
| 罗马衬线 | EB Garamond、Cardo、Castoro、Piazzolla、Alegreya、Marcellus（谷歌）；雷西亚·甘贝塔 (Fontshare) |
| 高对比度衬线 | Gloock、Libre Bodoni、Abril Fatface、Rozha One、Besley（谷歌）；侵蚀，情节剧（Fontshare） |
| 平板衬线 | Arvo、Hepta Slab、Domine、Alfa Slab One、Solway（谷歌）； Bespoke Slab（Fontshare；旧式人物忽略 `lining-nums`，因此人物位于身体脸部） |
| 格罗泰斯克无体 | Rethink Sans, Reddit Sans, Albert Sans (Google); Clash Grotesk, Supreme (Fontshare) |
| 几何无衬线体 | Lexend、斯巴达联盟、Afacad（谷歌）； Satoshi、Technor、Excon（Fontshare） |
| 圆形无衬线 | Inclusive Sans、Nunito Sans 700 仅带有参数、Varela Round (Google)； Chubbo，Comico（Fontshare） |
| 凝重而沉重 | Teko、Tektur、Michroma、Antonio（谷歌）； Clash Display、Panchang、Khand、Telma、Stardom、Array（Fontshare） |
| 单声道作为显示器 | Space Mono, Fragment Mono, Red Hat Mono, Spline Sans Mono, Sometype Mono (Google) |
| 像素 | 按 Start 2P、VT323、Pixelify Sans、Tiny5、DotGothic16、Workbench (Google) |
| 手写 | Shantell Sans、Caveat、Gochi Hand、Reenie Beanie (Google)； Sharpie（字体共享） |

## 身体面孔

目录中可能会使用人体面孔；主体不是主题的签名。 Sans：Hanken Grotesk、IBM Plex Sans、Figtree、Onest、Sofia Sans、Golos Text、Karla、Chivo、Albert Sans、Public Sans、Archivo、Manrope（Google）； Switzer、General Sans、Satoshi（Fontshare）。 Serif：Newsreader、Source Serif 4、Literata、Spectral、Crimson Pro、EB Garamond、Piazzolla（Google）； Sentient（Fontshare）。用于代码、图形和测量的 Mono：Geist Mono、JetBrains Mono、IBM Plex Mono、DM Mono、Fira Code、Azeret Mono、Chivo Mono、Overpass Mono (Google)。

## 字标

导航和页脚中的文字标记可能会采用与正文不同的外观，并且在色调丰富的页面上应该如此：将其折叠到正文系列中会扁平化层次结构，并且页面读起来就像没有品牌一样。当页面没有其他角色时，这是异常值的一个角色：

```css
:root { --font-body: "Switzer", ui-sans-serif, system-ui, sans-serif; --font-outlier: "Gambetta", ui-serif, serif; }
.wordmark { font-family: var(--font-outlier); font-weight: 600; letter-spacing: -0.015em; }
```

只有当身体的声音是品牌（一封信、一份宣言、一份长文件）时，才崩溃到一个家庭；然后文字标记会采用该系列的展示剪裁或其最重的重量。文字标记为 600 处主体面部的产品页面是未设计的默认值。

## 加载中

- 仅加载页面使用的权重，作为每个源一个 `<link>`，使用 `display=swap`； `<link rel="preconnect">`先到主机。
- 自托管面的 `@font-face` 带有 `font-display: swap` 和公制匹配的后备（`size-adjust`、`ascent-override`、`descent-override`、`line-gap-override`），因此交换不会回流折叠。
- 切勿合成粗体或斜体：`font-synthesis: none`，如果头部使用斜体，则加载斜体。
- 可变字体加载一次并给出每种权重；更喜欢家人运送的地方。
