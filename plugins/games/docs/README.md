# dsh-games 技术文档

这套文档是插件的「底层设计 + 当前状态」记录，代码和文档同步改。

## 目录

| 文档 | 内容 |
|:--|:--|
| [COMPATIBILITY.md](COMPATIBILITY.md) | 兼容技术选型：现有游戏从哪来、怎么接、哪些不接 |
| [SCORECARD.md](SCORECARD.md) | 兼容面全景记分卡：31 个面、完成度、下一步对应关系 |
| [RUNTIME.md](RUNTIME.md) | 游戏运行时契约：一个游戏要提供什么、宿主给它什么 |
| [NATIVE-GAME.md](NATIVE-GAME.md) | 原生游戏开发手册：模板、规则、性能、验收、常见坑 |
| [WINDOW.md](WINDOW.md) | 窗口模型：内嵌 / 悬浮、拖拽缩放、抽屉，以及「拖出 DSH」的限制 |
| [DETACH.md](DETACH.md) | 自由窗（独立系统窗口）的宿主需求与接入方案 |
| [PORTING.md](PORTING.md) | 移植现有 HTML5 小游戏的流程与验收清单 |
| [SECURITY-REVIEW.md](SECURITY-REVIEW.md) | 第三方源码先审后下的规则与记录 |
| [UI.md](UI.md) | 视觉与交互规范：颜色、阴影、动效、背景 |
| [ROADMAP.md](ROADMAP.md) | 里程碑、决策记录、风险 |
| [CHANGELOG.md](CHANGELOG.md) | 每次改动记录 |

## 更新规则

1. 改行为必须同步更新对应文档和 `CHANGELOG.md`，不允许「代码改了文档没改」。
2. 文档里区分 **已实现 / 已验证 / 待验证 / 不做**，不把计划写成事实。
3. 任何底层取舍写进 `ROADMAP.md` 的决策记录（ADR），包括为什么没选另一条路。
4. 升级 DSH 后重跑一遍「验证清单」，结果写回对应文档。
