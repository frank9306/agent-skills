---
name: franks-design
description: "查找、遵循或维护项目的 DESIGN.md。界面任务开始时读取项目已有的设计规范；用户要求沉淀或更新设计系统时，创建或更新该文件。"
metadata:
  upstream: "https://github.com/Nutlope/hallmark"
  upstream-commit: "04977e15f3dfd6ee4b74c887dac3eb52665d6c92"
  upstream-version: "2.0.0"
---

# 项目设计规范

- **读取**：按项目指令定位 `DESIGN.md`。项目未指定时，查找项目根目录下的 `DESIGN.md`，兼容已有的 `design.md`。界面工作遵循适用的项目规范。缺少该文件时，沿用项目现有实现与约定。
- **创建**：用户要求创建或沉淀项目设计规范时，在约定位置写入 `DESIGN.md`，默认放在项目根目录。记录已确认且可复用的约定，并链接到令牌、主题或组件等权威实现。
- **更新**：用户要求更新规范时，编辑已有文件并保留文件名及无关内容。只记录已有依据或已确认的变更。文档与实现冲突时，指出具体差异，并依据用户确认的方向更新。
