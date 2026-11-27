# 兼容技术选型

> 状态：**已确定方向，适配器部分实现**。本文是底层约定，先于代码。
> 全景进度（31 个兼容面）见 [SCORECARD.md](SCORECARD.md)。**当前 `web` / DOM 只有自研样例，还没有接任何外部游戏源码。**

## 1. 目标与非目标

**目标**

- 自己写的游戏：零依赖、直接跑。
- 现有 HTML5 / Canvas 小游戏：改很少的胶水代码就能移植。
- 老 Flash 小游戏：走模拟器，能跑多少算多少。
- 同一套窗口、主题、存档、暂停逻辑，不为每个游戏重写。

**非目标**

- 不在 DSH 里跑不可信的远程代码。
- 不追求 100% 兼容所有引擎导出物（Unity/Godot 大型产物不在首批）。
- 不做游戏内购、联网对战、账号体系。

## 2. 三条硬约束（决定了一切）

1. **不能用 iframe。** DSH 插件页是 React 组件，iframe 会丢主题、locale、指针上下文；官方实践明确不建议。→ 现有游戏必须变成「模块」，不能贴 URL。
2. **插件是自包含的 Client bundle。** 没有构建步骤时只能写普通 JS；引入引擎要么内联打包，要么按需从插件包资源加载（后者待验证）。
3. **游戏代码和 DSH 页面同权限。** 一旦加载就在宿主页面里执行，能读 DOM、能发请求。→ 默认只加载我们审查过的模块。

## 3. 兼容矩阵

| 来源 | 代表 | 接入方式 | 预估工作量 | 状态 |
|:--|:--|:--|:--|:--|
| 自研 Canvas 2D | 本插件自带游戏 | `native` 适配器 | 小 | **已实现**（贪吃蛇） |
| 单文件 HTML5 | itch.io / Game Jam 作品 | `web` 适配器（容器 + 尺寸回调） | 小 | **已实现**（内置打砖块验证链路） |
| DOM 小游戏 | 2048 类、按钮/网格交互 | `native` 适配器（游戏自带 DOM，样式加前缀） | 小 | **已实现**（内置 2048 验证链路） |
| Phaser 3 | 大量 2D 开源游戏 | 引擎和游戏打包成一个模块，`web` 适配器启动 | 中 | 规划 |
| PixiJS / CreateJS | 渲染层 / Flash 迁移 | 同上，只接管 renderer | 中 | 规划 |
| Egret / LayaAir | 国内 Flash 风格引擎 | 需要 shim 全局对象和资源加载 | 中高 | 待评估 |
| Godot 4 / Defold | WASM 导出 | 资源目录 + 启动回调，体积大 | 高 | 暂不做 |
| Unity WebGL | 大型产物 | 体积和加载策略都不合适 | 高 | 不做 |
| Flash / SWF | 老页游 | Ruffle（WASM）适配器 | 中 | 规划 |
| FC/GBA 等 | ROM 模拟器 | EmulatorJS 适配器 | 中 | 待评估 |
| 微信小游戏 | 微信 SDK 依赖 | `wx.*` shim + Canvas | 高 | 暂不做 |

## 4. 适配器分层

所有游戏最终都归一到同一个运行时契约（见 [RUNTIME.md](RUNTIME.md)）：

```
GameDefinition（元数据 + 适配器类型）
        │
        ├─ native      直接实现 mount/resize/pause/resume/destroy
        ├─ web         给容器和尺寸，游戏自己接管 canvas/DOM
        ├─ engine      web 的特化：先启动引擎，再挂场景
        ├─ flash       Ruffle 运行时 + SWF 资源
        └─ emulator    EmulatorJS/DOSBox + ROM
```

**统一入口**：`createRuntime(definition, host)` 返回 `{ mount, resize, pause, resume, destroy }`。窗口只认这五个方法，不认引擎。

## 5. 资源与加载

- 游戏资源放在插件包内，通过打包或包资源路由加载；**默认不访问公网**。
- 大运行时（Ruffle ≈ 10 MB 量级、EmulatorJS 数 MB）按需加载，不拖慢启动。
- 加载失败必须降级成一张卡片说明，不允许白屏。

## 6. 安全边界

- 只加载随插件发布的游戏模块；「从 URL 装游戏」不作为默认能力。
- 游戏容器内禁用 `document.write`、`window.open` 这类外逃行为（代码审查 + 运行时限制）。
- 游戏不能直接读写 DSH 的存储键；存档只能走宿主提供的 `save` API。
- 全屏、音频、指针锁等敏感能力由宿主代管。

## 7. 待验证项（实现前必须做掉）

1. 插件包内的静态资源（wasm/图片）能否通过包资源路由被 Client 读取。
2. `ctx.provide('games')` 跨 bundle 注册游戏是否稳定（决定「独立游戏包」这条路）。
3. Ruffle 在 DSH 的 Content-Security-Policy 下能否加载 wasm。
4. Phaser 打包后的体积和首帧时间是否可接受（目标 < 1.5 s）。

## 8. 结论

**先做 `native` + `web` 两层，Flash 作为独立适配器后补。** 这样自研游戏和大多数 HTML5 游戏能覆盖，成本和风险都可控；引擎型游戏按「打包成一个模块」处理，不为每个引擎写专门适配器。
