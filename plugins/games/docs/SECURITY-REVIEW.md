# 第三方源码审查记录

> 规则：**先审后下、先审后跑**。只从 GitHub API 读取文本，不执行；检查许可证、危险 API、外部资源、资产来源；通过后才复制进插件。

## 审查项

| 检查 | 通过标准 |
|:--|:--|
| 许可证 | MIT / Apache-2.0 / CC0；GPL 类需单独评估分发方式 |
| 动态执行 | 无 `eval`、`new Function`、`document.write`、动态 `import()` |
| 网络 | 无 `fetch` / `XMLHttpRequest` / `WebSocket` / 外部 CDN；README 链接不算代码 |
| 存储 | 无 `localStorage` / `indexedDB` / cookie 读写（游戏状态由宿主管） |
| 外链 | 无 `window.open`、无用户数据外发 |
| 资产 | 无来路不明的图片/音频/字体；纯 canvas 绘制优先 |
| 混淆 | 无长 base64/hex blob、无可疑压缩代码 |

## 已通过（已移植）

| 仓库 | 许可证 | 规模 | 审查结果 |
|:--|:--|:--|:--|
| [vruntime-labs/ping-pong](https://github.com/vruntime-labs/ping-pong) | MIT | `game.js` 4.4KB | 无网络/动态执行/存储；无资产；仅 `document` 监听，移植时改为容器 |
| [vrk/space-invaders](https://github.com/vrk/space-invaders) | MIT | 13 个 JS，约 20KB | 无网络/动态执行/存储；无资产；`document` 监听仅用于输入，移植时改为容器 |
| [taniarascia/sokoban](https://github.com/taniarascia/sokoban) | MIT | 4 个 JS，约 8KB | 无网络/动态执行/存储；ES modules；无资产；`document` 监听仅用于输入 |
| [jakesgordon/javascript-pong](https://github.com/jakesgordon/javascript-pong) | MIT | 34KB JS | 早期人工审阅，无网络/动态执行；未引入其图片/音效 |

## 已评估、未移植

| 仓库 | 许可证 | 结论 |
|:--|:--|:--|
| [dmcinnes/HTML5-Asteroids](https://github.com/dmcinnes/HTML5-Asteroids) | MIT | 需要 jQuery、字体文件、WAV；资产与依赖多，暂不接 |
| [Ryan-Menezes/Asteroids](https://github.com/Ryan-Menezes/Asteroids) | MIT | 图片/音效来源未核实，暂不接 |
| [zaceno/hyperoids](https://github.com/zaceno/hyperoids) | MIT | 依赖 hyperapp + 构建步骤，不适合当前无构建的 bundle |

## 移植时的统一改动

1. `document` / `window` 级键盘监听改为游戏容器级；
2. `document.querySelector('canvas')` 改为宿主提供的容器内 canvas；
3. 固定画布按容器等比缩放，DPR 上限 2；
4. 去掉外链、外部音频/图片依赖，或替换为 canvas 绘制；
5. 补 `pause / resume / destroy`，清理 rAF、监听器和 DOM；
6. 文案改走 `t()`；保留上游版权声明在 `THIRD_PARTY_NOTICES.md`。

## 备注

- 审查只覆盖本次读取的源码文件；后续上游更新需要重新审。
- 未执行任何第三方代码；所有测试只针对本插件自己的 bundle。
