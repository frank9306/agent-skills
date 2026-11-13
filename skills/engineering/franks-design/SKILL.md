---
name: franks-design
description: "设计和实现新网站、新页面、应用界面或单个组件时使用，也可由用户点名调用。改版和审查已有设计时，须由用户点名 frank's design，并指定 redesign 或 audit。"
metadata:
  upstream: "https://github.com/Nutlope/hallmark"
  upstream-commit: "04977e15f3dfd6ee4b74c887dac3eb52665d6c92"
  upstream-version: "2.0.0"
---

<!--
version: 2.0.0
-->

# frank's design

为编码助手生成的界面设定设计底线，通过抽选方向避免连续几次交付都趋同，并让每一屏承载一个主要想法。满足底线后，由设计者决定页面的具体表达。

**由 Together AI 提供支持。**

## 设计底线（Floor）

这些底线适用于所有运行环境和交付物，即使只加载本文件也必须遵守。

1. 颜色和字体全部引用 `:root` 或已声明的主题块中的设计令牌。令牌块之外禁止硬编码颜色和 `font-family`。 (48)
2. 从来没有`transition: all`。切勿为 `width`、`height`、`top` 或 `left` 制作动画。 (10a)
3. 正体标题禁止只把其中一个词设为斜体。 (38i)
4. `html` 和 `body` 上的 `overflow-x: clip`。从来没有`hidden`，从来没有`100vw`。 (34)
5. 承载图像的网格轨道的使用`minmax(0, 1fr)`;显示头携带`overflow-wrap: break-word; min-width: 0`. (50)
6. 每个交互元素都有`:focus-visible`，瞬间出现。 (26a, 15)
7. 每个动画都有一个 `prefers-reduced-motion: reduce` 后备，并且内容在脚本关闭时可见。 (27, 62)
8. 禁止编造指标、客户评价、品牌标识墙和案例数量。 (46a)
9. 从来没有标题上方的短标签，也从来没有加宽字距的全大写或小写大写的标签：标签，标题，表格标题，标签和导航链接是正文面（或主题的标签面），更小一步，句子或小写，未跟踪。 (54, 67)
10. 切勿使用中间点连接的元字符串、粘贴到链接文本的箭头或装饰性状态点。 (63)
11. 绝不是紫色到蓝色的渐变、卡片中的卡片、作为图标的表情符号或手绘的浏览器或操作系统窗口。 (2a, 4, 30a, 47a)
12. 首屏主视觉的标题、一句话和主要动作都在 1280 x 800 的分辨率下可见，无需滚动。 (44b)
13. 任意一屏约80字；首屏主视觉的文字是标题、一句话及其行动。 (58)
14. 容器居中并设置最大宽度。在 1920px 视口下增大页边距，内容宽度和网格保持上限。 (44d)
15. CSS 源代码的第一个非空行是 Hallmark 标记，然后是批评行，然后是任何豁免。 (20)
16. 如果节点可用，请在交还之前运行 `node <skill-dir>/scripts/sloplint.mjs <output> --render`。修复每个`FAIL`；修复每个 `REFLEX`，或记录符合规则的豁免理由。

在 Floor 上方，**Reflex** 门是模型默认进入的情况，可在记录中因真实原因而放弃，而 **Finish** 检查是工艺细节、已回答、永不阻塞（[`references/gates.md`](references/gates.md) § 1 和 § 2）。

## 执行流程

0. 预检：在提出任何问题之前先阅读该项目。
1. 问一次：材料、受众、用途、语气。
2. 形状：设计页面，然后命名。
3. 方向：抽选主题，或按用户要求定制。
4. 加载布局、图像、工艺、流派和主题文件以及 `gates.md` § 1 至 § 4。
5. 一次性给出设计决策清单。
6. 构建：先首屏主视觉，后页面；设计记录，`tokens.css`，日志。
7. 验收：运行 `sloplint --render`，处理检查结果，完成复审并交代素材需求。

**改版与审查。** 用户点名 frank's design 时可用：`redesign <target>`（保留内容和现有功能连接的完整改版）和 `audit <target>`（报告）；首先阅读[`references/redesign.md`](references/redesign.md)。对现有设计的其他修改，按用户要求在项目自己的设计系统中进行。

Codex CLI 和 OpenCode 先读 [运行环境](references/flow.md#运行环境)。其他运行环境直接按本文件执行。

### 0. 预检

信号，按顺序：根处的 `design.md` 或 `DESIGN.md` （锁定系统：它覆盖下面的所有内容，并且页面共享它）； `.hallmark/brand-spec.md` 或命名真实品牌的提示（运行 [`references/brand-truth.md`](references/brand-truth.md)；切勿根据记忆来主题化真实品牌）；项目的字体、调色板、间距、动画库和框架（`package.json`、Tailwind 配置、`:root`、标记、字体链接）； **产品本身**：一个 URL、一个正在运行的开发服务器、一个以一个命令启动的项目或计算机上的一个应用程序，构建使用 `scripts/capture.mjs` (`imagery.md` § 4) 捕获这些项目； Inspo MCP 服务器（`mcp__inspo__*` 工具：信号 8、`flow.md` § 信号 8；`$franks-design` 调用、点名 frank's design 或要求定制时，优先走本技能）； `TOGETHER_API_KEY` 套装 (signal 9, the comp step)。

输出一个块（文件：行引用、保留内容、引入内容），缓存在 `.hallmark/preflight.json` 中（`flow.md` § 预检）。

### 1. 问一次

一条消息，即使是五个字的提示：

> *在我构建之前，有四件事。 1. **材质**，最重要的一点：页面能展示什么？屏幕截图或屏幕录制（或者将我指向应用程序、其 URL 或其文件夹，我将运行它并拍摄它们）、您的照片、真实数字（客户、正常运行时间、价格）、带有说者姓名的报价、您可能使用的徽标。粘贴它们或给出路径；如果没有照片，我会从 Hallmark 的照片库中放置替身，稍后您自己替换，而且我从不发明数字、引言或徽标。 2. **受众**：谁使用这个以及他们关心什么？ 3. **使用**：页面应驱动的一项操作。 4. **基调**：选择一个极端（社论、野兽派、柔和、功利、奢华、俏皮、技术、严肃）； “干净、现代”不是一个基调。再加上 4 到 8 个单词的氛围和锚色（如果有的话）。或者说**继续**，我会推断并告诉你我选择了什么。*

跳过的字段是选择退出：推断它们，在回复顶部的一行中陈述推断，标记它们；没有后续问题。事实永远无法推断：未给出的数字、引言或徽标不存在；未给出的图片是插槽中的替身。当提示回答了所有四个，或者没有人可以回答（无头运行，一批）时，不要问。

**流派，**默默：*AI工具，生成，音乐，视频，语音，黑暗，大气*→**大气**； *SaaS、企业、API、平台、开发人员工具、基础设施、B2B* → **现代简约**； *好玩、有趣、友好、温柔、孩子、游戏、社区* → **好玩**；否则**社论**，其中包含大多数消费者和家庭提示。一旦确定了主题，其流派就会获胜（流派文件、设计记录、`--genre`）。当两种非默认类型触发时，请在消息中添加一个“非此即彼”，或者继续选择并说出来。

**范围。** 命名一个元素（按钮、输入、卡片、模态、导航、页脚、选项卡条、芯片）或说“仅 X”是一个组件的提示（见[组件范围](references/flow.md#组件范围)）。某人工作的屏幕（仪表板、管理、设置、工具）是应用界面（见[应用界面](references/flow.md#应用界面)）。

### 2. 形状

**材料第一。** 库存，一行：*真实*（提示和项目提供的每一个具体事物：名称、声明、数字、地点、日期、图像）、*图片*（页面显示的内容以及每张图片的来源：用户的、真实产品的屏幕截图、构建的产品、库）、*不存在*（它不会有的每一个证据：徽标、引用、没有人提供的指标）。形状跟随它：带有图片的页面以 (`imagery.md` § 1) 开头；关于单词的页面包含类型和事实（长文档、信件、索引优先、宣言）。

**工作。** 列出访问者要做的事情（订阅、预订、访问、参加、购买、尝试、注册、雇用、加入、聆听）并在 [`references/anatomy.md`](references/anatomy.md) 中阅读该工作：该类别中的真实网站将操作放在何处，围绕哪些部分构建（菜单、阵容、问题、记录）以及它们如何结束。该页面是根据该结构构建的，而不是根据默认的图形、步骤和电子邮件带 (85) 构建的。

然后设计页面：它的形状、打开方式、每个部分的内容和构成、导航、页脚、首屏主视觉的内容。起点：[`references/macrostructures.md`](references/macrostructures.md)中的21个形状（仅加载您选择的文件）； `layout.md` 中的构图、导航和页脚。

**抽奖。** 在主题构建中，一旦第 3 步选择了主题，就运行 `node <skill-dir>/scripts/theme.mjs draw --material photo|product|words --job <job> --theme <slug> [--log .hallmark/log.json]`。清晰的日志和主题图片，它涉及形状、首屏主视觉姿势、导航、页脚、第一部分、动作所在、要省略的两个构图以及首屏主视觉引导的内容。除非材料拒绝选择，否则就接受它，并在“选择”块中命名任何交换：一个主题中的一个提示，构建两次，形成两页。 **镜像测试：**同一类别中的相邻提示会得到这个精确的组合吗？如果是，请改变一项决定并说出哪一项。

**签名。** 访问者会记住的一件事是：提示中最真实的东西以最好的方式展示（照片是地点，产品做它的一项工作，价格设定很大，因为它是报价，尝试的控制）。将其制作在主题的材质中（在自定义运行中，以其自己的外观），将其显示在第一个屏幕上，在“精选”块和设计记录中对其进行命名。作为标记绘制的数字是一个装置，而不是签名 (82)。

持有这一切；在步骤 5 中说过一次。

### 3. 方向

按以下顺序采用首个适用分支。

1. **用户命名了一个主题** → 构建它（标记 `theme: <name> (by request)`）。
2. **用户要求定制**（“定制”、“衍生它”、“定制”、“无主题”、“自己的世界”）→ [`references/direction.md`](references/direction.md)：设计是你的。它取代了绘图、形状、`layout.md`、流派文件以及步骤 6 的构图和首屏规则； Floor、门和扫描保持。沉默永远不会走这条路。
3. **其他一切都涉及一个主题：**

```
node <skill-dir>/scripts/theme.mjs deal --genre <genre> --prompt "<the prompt>" [--log .hallmark/log.json]
```

脚本抽选三个契合需求、通过历史去重的主题。查看三张图片，选择一张其素材可以带有提示（动作、照片、代码）的图片，说出哪张图片以及为什么，然后只加载 `references/themes/<slug>.md`。仅在被要求时重新发牌 (`--reroll 1`)。无节点：手工从 `references/themes/index.json` 中挑选并盖章 `deal: manual`。

主题是一种材料，而不是计划：它从不设定页面包含的内容或顺序。当它与形状、流派或工艺文件在材料、控制或动作上不一致时，主题获胜； Floor 和用户自己的话击败了两者。

### 4. 加载

正是这些，对于页面构建： [`references/layout.md`](references/layout.md) · [`references/anatomy.md`](references/anatomy.md)，工作的一部分 · [`references/imagery.md`](references/imagery.md) · [`references/craft.md`](references/craft.md) · `references/genres/<genre>.md` · `references/themes/<slug>.md` 及其图片，已在交易中看到（命名主题：现在看看 `<slug>.jpg`）。从主题中获取其调色板平衡、类型声音、表面及其范围（没有照片的部分），而不是其布局 · [`references/gates.md`](references/gates.md) § 1 至 § 4。自定义运行加载 `direction.md` 而不是布局、流派和主题文件。

仅当需要时，在 `references/` 中：一个宏结构文件 · `microinteractions.md` 用于有状态 UI · `interaction-and-states.md` 用于表单 · `responsive.md` 用于不寻常的布局 · `texture.md` 当主题命名纹理时 · `scroll-choreography.md` 用于滚动故事 · `dark-mode.md` 用于两种模式 · `data-viz.md` 用于图表 · `fonts.md` 自定义运行 · `comp.md` 信号 9（合成、生成静止图像） · `design-md.md` 锁定系统。

`gates.md` § 5 等待步骤 7、§ 6 进行审核；装载更多是最大的可避免成本。

### 5. 设计决策清单

运行只是对其决定的叙述，以及用户的重定向窗口：

```markdown
**Hallmark · v2.0.0**

- **Shape** · Workbench, from draw 7f3a2c · genre modern-minimal · job: sign up, the action in the hero and beside the price
- **Theme** · Coral, dealt 2/3 (warm grey, one coral signal, General Sans, soft pills) · clears Cobalt on paper band
- **Chrome** · nav: edge-aligned, a wordmark and one action · footer: a mast, the wordmark over the links
- **Hero** · Stage: head on columns 1 to 5, the slot on 6 to 12 at 560px, centred
- **Signature** · the invoice list chasing a late payment, built live in the hero
- **Sections** · Hero (the invoice list) · Pinned (one late payment, chased in three panels) · Switcher (the client's view and yours) · Table (pricing) · Footer
- **Material** · real: the 2-minute setup, the CSV import, Lisbon · pictures: the invoice list built in the hero, library photos of a Lisbon studio (muted) · absent: logos, quotes, metrics
- **Sweep** · run after build
```

自定义运行的行位于 `direction.md` 中。然后是一行安静的行，在组件范围内或当 `design.md` 存在时跳过：*系统可移植？假设 `lock the system` 代表 `design.md`。* 在信号 9 上，`comp.md` 在此运行。

### 6. 实现

- **从脚手架开始。** `node <skill-dir>/scripts/theme.mjs scaffold <slug>`（在自定义运行中使用交易的 `--dealt`；`--custom`）在项目的样式表旁边写入 `tokens.css`（主题的标记和共享比例）和 `base.css`（Floor 已经决定的内容），并打印设计记录骨架、两个导入和插槽脚本。只写页面。
- **阅读 [`references/patterns.md`](references/patterns.md) 一次：** 所有八种状态下的控制、一个插槽、一个缺失的事实、一张尚未发布的表格、一个揭示、比较的数字。遵循他们的形状，而不是他们的复制品。
- **首先是首屏主视觉。** 编写导航和首屏主视觉，下面什么都没有，运行 `node <skill-dir>/scripts/sloplint.mjs <file> --render --stage hero`，然后在独立上下文 (`gates.md` § 6) 中查看首屏主视觉。一旦首屏主视觉发货，就可以建造各个部分；照片来源和全页检查等待页面。
- **每个屏幕一个想法，设置大。 **首屏主视觉：七个字或更少的标题(50 characters)，十二个字或更少的一句话，一两个动作。六到九个部分，包括标题和页脚（薄提示上有五个），最多 450 个可见单词，每个部分是该类别自己的内容，以质量 (`layout.md` § 4 and § 5) 的形式组成。首屏主视觉是第一个屏幕，而且只是第一个屏幕，其姿势取自工作(`layout.md` § 6)。丰满来自规模和图片，而不是来自更多的文字(77 to 79)。
- **展示，而非描述** (`imagery.md`)。该页面显示真实的东西：用户的图片、使用 `scripts/capture.mjs` 拍摄的真实产品的屏幕截图（只要可以到达）、只有在无法到达时才以全保真度构建的产品，或者库照片 (`node <skill-dir>/scripts/theme.mjs photos "<subject>" --theme <slug>`)、大的、在主题处理中、在用户文件替换的插槽中、每张库照片都记在页脚中。图片最多占首屏主视觉下方页面的三分之一，绝不能连续两个以照片为主导的部分，主题的范围包含其余部分 (83)。绝不是库存网站 URL、绘制的插图 (80)、空洗 (81)、一排计数标记 (82) 或虚构的图形。
- **页面不变量** (F15)：一种主要按钮样式、一种容器宽度、首屏主视觉下方一列间隙、每个嵌套层一个半径、居中标题组永远不会比左对齐标题组更居中。
- **类型和运动** (`craft.md` § 1 and § 5)。主题面孔，最多两个家庭（三个，一个异常角色）；本体16px以上；头一种重量、一种颜色 (38iii)；标签永远不会是单色的，除非单色是材料 (64)。每个控件有八个状态；仅限 `transform` 和 `opacity`；最多显示一个，主题保持静止的情况下没有一个显示，默认情况下可见。
- **Stamp.** CSS 的第 1 行是脚手架的设计记录骨架，每个字段都已填充，然后是批评行 (`gates.md` § 3)，然后是任何 `waive` 和 `answered` 行，全部在前 40 行内。
- **现有样式表仅附加：** 导入紧接在最后一个 `@import` 之后，绝不会低于规则或 `@tailwind` 指令；重用项目的设计令牌名称 ([`references/export-formats.md`](references/export-formats.md))。
- **日志。** `node <skill-dir>/scripts/theme.mjs log --entry '<json>'` 将构建置于 `.hallmark/log.json` 之上，字段旋转读取（`shape`、`theme`、`axes`、`hero`、`nav`、`footer`、`imagery`、`photos`、 `entry`、`fingerprint`、`sections`、`signature`、`waived`、`prompt`）并命名您遗漏的任何内容。

### 7. 验收

1. `node <skill-dir>/scripts/sloplint.mjs <files> --genre <genre> --render`（适用时为 `--scope component` 或 `--scope app`；在框架项目中，运行开发服务器的 `--url http://localhost:<port>/<route>`）。修复每个 FAIL 并重新运行直至干净。渲染层编写屏幕截图；由脚本完成浏览器渲染。
2. 加载 [`references/gates.md`](references/gates.md) § 5 并走过 J 和 R/J 门。确认或取消每个 WARN。修复每个打开的 Floor 发现；修复或放弃每一个 Reflex；回答每一个Finish。
3. 在独立上下文中完成审阅（`gates.md` § 6；审阅者阅读其提示，而您永远不会打开 `review-*.md`）：按照其第一个单词（`recapture`、`rebuild`、`fix`、`ship`）进行操作并自己对修复进行评分。
4. 围绕材料询问：每个槽位、其大小以及属于该位置的内容，然后是最能改善页面的材料。
5. 更新 设计决策清单：构建更改的任何行，以及包含结果的最后一行 (`Floor 0 FAIL · Reflex 2 (1 waived: 47b) · finish-review: subagent, 3 resolved`)。伪造的通行证本身就是斜坡。

集中检查、批量修复，最多复查一轮。每次评审后再批量修复并重新截图。

## 流程分支

[`references/flow.md`](references/flow.md)，一次一节：组件范围、应用界面、信号 8、构建前的比较、运行环境控制杆、预检边缘情况、**快速模式**（`--fast`，或表示快速、粗略或原型的提示）和编辑时挂钩。在现有项目中，为您将首先接触的文件命名；如果没有用户批准的文件级计划，切勿删除路由或组件树。
