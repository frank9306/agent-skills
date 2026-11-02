# 新闻源与用途

这是检索入口，不是已读清单或固定抓取协议。每次运行验证入口及文章日期，优先跟随站点自身导航和官方迁移链接。以下入口于 2026-11-02 做过工具核查；可访问性会变化，按本次实际读取结果报告。

## 每次必查的官方重点

| 来源 | 入口 | 用途 |
|---|---|---|
| OpenAI News | https://openai.com/news/ | 产品、公司、安全、工程与政策动态 |
| OpenAI Research | https://openai.com/research/index/ | 研究论文、技术报告与评估 |
| Anthropic News | https://www.anthropic.com/news | Claude 产品、公司与发布动态 |
| Anthropic Research | https://www.anthropic.com/research | 安全、可解释性、评估与科研 |
| Anthropic Engineering | https://www.anthropic.com/engineering | Agent、编程与工程实践 |
| DeepSeek 研究与动态 | https://www.deepseek.com/news/ | 官方模型发布和研究索引，按正文日期追查窗口内更新 |
| DeepSeek 官网公告 | https://www.deepseek.com/ | 检查公告横幅与新功能入口，再跟到具体官方发布或技术说明 |
| DeepSeek API 文档 | https://api-docs.deepseek.com/ | 核实模型、API、功能与价格变更；静态文档和抓取时间不能证明新闻发布日期 |
| DeepSeek GitHub | https://github.com/deepseek-ai | 官方开源仓库、README、技术报告和发布记录；区分研究原型与正式产品，最近提交不等于模型发布 |

OpenAI News 提供 https://openai.com/news/rss.xml 订阅入口；此次网页工具不支持其 XML 类型，使用支持 RSS 的读取器或回到 News 页面，不把 XML 提取失败当作没有更新。Claude 平台变更可追查 https://platform.claude.com/docs/en/release-notes/overview 。其他产品的 release notes 从其官方导航定位，避免硬编码易迁移的文档路径。

## 已启用的扩展官博（每次逐一检查）

用户于 2026-11-02 全选以下七个渠道。每次运行检查其最新列表和窗口内候选，再按重要性选入日报；可批量读取，读取失败须作为覆盖缺口，不为每家公司强凑一条新闻。

| 来源 | 入口 | 使用方式 |
|---|---|---|
| Microsoft Research Blog | https://www.microsoft.com/en-us/research/blog/ | 模型、Agent、评测与科研进展，追查论文或项目的原始证据 |
| Meta AI Blog | https://ai.meta.com/blog/ | 通用模型、多模态与开放研究；区分置顶文章和最新更新 |
| Google AI 官博 | https://blog.google/innovation-and-ai/technology/ai/ | Gemini 与 AI 产品/平台动态，和 DeepMind、Google Research 的同一事件合并 |
| Amazon Science Blog | https://www.amazon.science/blog | 推理、机器人、机器学习与云/系统研究，明确研究成果与产品可用性的区别 |
| Apple Machine Learning Research | https://machinelearning.apple.com/ | 端侧 AI、本地推理与机器学习研究，沿 highlights 和 publications 追到具体文章 |
| ByteDance Seed Blog & Publication | https://seed.bytedance.com/en/research/ | Seed、图像/视频生成、语音、Agent 和基础设施，分别核对博客与论文日期 |
| Mistral 官方博客 | https://mistral.ai/news/ | 开放模型、编程、语音与工程发布，核对权重许可、测试条件和可用范围 |

以上入口已于 2026-11-02 核实包含有效官方内容。Google 旧 `/technology/ai/` 路径会跳转到表中地址；Seed 的通用 `/blog` 路径曾无正文，使用上表已核实的 Blog & Publication 入口。

## 补充 AI 官方与开源来源

| 来源 | 入口 | 使用方式 |
|---|---|---|
| Google DeepMind | https://deepmind.google/blog/ | 前沿模型、多模态、机器人与科学 AI；旧 discover/blog 路径会重定向 |
| Google Research | https://research.google/blog/ | 算法、系统与应用研究 |
| NVIDIA AI | https://blogs.nvidia.com/blog/category/generative-ai/ | 芯片、推理基础设施、机器人与开放模型；营销性能需回查测试条件 |
| Hugging Face Blog | https://huggingface.co/blog | 工具、模型与开源生态；区分官方团队文章和社区作者文章 |
| Qwen | https://qwen.ai/blog 、 https://github.com/QwenLM | 国内模型与编程工具；博客本次未抽出正文，可从官方组织追查发布与模型卡 |

可按当天线索补充其他实验室、厂商、研究机构的官方发布，先确认官方归属。Qwen 旧站 https://qwenlm.github.io/ 已提示迁移，不把旧站文章当作持续更新入口。DeepSeek 的 `api-docs.deepseek.com/news/` 路径曾返回 API 入门文档，不能当成新闻列表；`www.deepseek.com/news/` 已核实为官方研究与动态入口。官网公告若跳到技术指南，应另核实变更发生时间，避免把静态指南当成当天新闻。

## 研究和社区线索

| 来源 | 入口 | 边界 |
|---|---|---|
| Hugging Face Daily Papers | https://huggingface.co/papers | 发现近期受关注论文；点赞是平台信号，结论追到论文原文 |
| arXiv AI recent | https://arxiv.org/list/cs.AI/recent | 直接读取摘要/论文；区分首次提交与修订，确认评审状态，研究热度不等于突破已验证 |
| Hacker News | https://news.ycombinator.com/ | 技术社区热点；沿原文核验，旧文重新上榜时保留原始日期 |

## 国内外综合新闻

| 来源 | 入口 | 使用方式 |
|---|---|---|
| AP 美联社 | https://apnews.com/ | 国际综合新闻，本次可读取；跟到具体报道核验时间 |
| 新华网 | https://www.news.cn/ | 国内重要新闻、国际与政策线索，本次可读取 |
| 中国新闻网 | https://www.chinanews.com.cn/ | 国内、国际、社会与财经，本次可读取 |
| Reuters 路透社 | https://www.reuters.com/ | 国际与商业候选源；本次工具未能直接打开，运行时可检索原站报道，不可据此声称读过正文 |
| BBC News | https://www.bbc.com/news | 国际候选源；本次受 robots 限制，按访问能力换 AP 或其他可靠来源 |
| 36氪 | https://36kr.com/ | 中国科技与商业线索；本次返回安全检测页，须取得正文才可引用内容 |
| 澎湃新闻 | https://www.thepaper.cn/ | 国内公共新闻候选源；本次返回 403，运行时失败则换源 |

对政策、统计、财报和科学发现，尽量追查政府、监管机构、交易所、公司公告和论文等原始材料。多篇转载同一原稿不构成独立交叉验证。来源间有差异时保留各自归属；单一媒体的显著位置不代表全网热度。
