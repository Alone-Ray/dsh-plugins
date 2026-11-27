# 自由窗（独立系统窗口）需求与接入方案

> 状态：**宿主能力未提供；插件侧接入位已实现**（`apply` 探测 `ctx.get('desktopWindows')`，缺失时回退并提示）。
> 本文是给 DSH 的功能需求，以及插件侧拿到能力后的接入方式。
> 用户已选方向 B：内嵌时留在组件内，自由窗时开独立窗口。

## 1. 需求

- 内嵌模式：游戏渲染在游戏中心页面里（已实现）。
- 自由窗模式：游戏在**独立的系统窗口**里，可以拖到 DSH 窗口外面、放到另一个显示器上。
- 两种模式共用同一个游戏运行时，切换不丢进度（理想状态）。

## 2. 现状核查（0.2.3-alpha.2 桌面壳）

| 检查项 | 结果 |
|:--|:--|
| Web/Host 是否在 Electron 主进程 | 否。主进程 `spawn` 出 `dsh-desktop-host` 子进程，页面和插件跑在里面 |
| 插件能否 `new BrowserWindow` | 否。只有主进程持有窗口 API，插件进程拿不到 |
| 子进程 → 主进程 IPC 是否开放开窗 | 否。只接受固定的内部事件 |
| `window.open` 弹窗捷径 | 否。主窗口 `setWindowOpenHandler` 直接 `deny`，http/https 只交给系统浏览器打开 |
| 现有 `open-in-app` / `pluginNavigation` | 只能切 DSH 内部视图，不能开系统窗口 |

结论：插件侧没有任何合法入口创建系统窗口；硬做必须改桌面壳，不在插件范围内。

## 3. 建议的宿主能力（提案）

### 方案 A：面板窗口（成本最低）

```js
// Renderer（插件可用）
const win = await ctx.desktopWindows.openPanel({
  panelId: 'games',        // 现有 main 面板 key
  title: '游戏中心',
  width: 720,
  height: 520,
  resizable: true,
});
win.close();
win.focus();
```

宿主实现要点：

1. 主进程新增 IPC（只允许已注册面板 id），`new BrowserWindow` 加载 `${origin}/?panel=games&detached=1`，复用现有 cookie 认证。
2. 页面识别 `detached=1`：只渲染该面板，不渲染侧栏/标题栏；插件通过 `ctx.get('desktopWindows').isDetached()` 判断运行环境。
3. 关闭窗口时通知插件，插件负责 `destroy()` 游戏运行时。

优点：插件只改渲染分支；主题、locale、认证都能复用。
缺点：整个页面壳仍会加载一遍，首帧稍慢。

### 方案 B：插件表面窗口（更彻底，成本高）

主进程创建一个只加载插件资源的窗口，宿主通过 preload 暴露最小 API（主题、locale、存档、远程调用转发）。适合未来把游戏窗口做成独立进程。

## 4. 插件侧接入方案（拿到能力后）

1. `apply` 里探测 `ctx.get('desktopWindows')`；没有就保持现在的应用内浮窗。
2. `floatGame()` 分支：
   - 有 `desktopWindows` → `openPanel({ panelId: 'games', ... })`，把 `GameSurface` 切到 detached 渲染分支；
   - 没有 → 现有 `shell.overlay` 浮窗。
3. 游戏运行时只 `mount` 一次：窗口创建后由新窗口的 React 树重新 mount，进度通过 `save`/`snapshot` 迁移；不做跨窗口 DOM 搬运（跨进程不可行）。
4. 关闭窗口 → `destroy()` → 回内嵌模式。

## 5. 临时替代（已实现）

应用内浮窗：自由拖动、缩放、吸附左右半屏 / 全屏、双击收回内嵌。这是宿主支持前最接近「自由窗」的形态。

## 6. 需要 DSH 侧确认

- 是否愿意新增 `desktopWindows` 这类插件 API，以及允许的窗口参数（尺寸、置顶、无边框）。
- 面板页在独立窗口里的渲染约定（只渲染面板，不带壳）。
- 多窗口的生命周期与认证复用方式。

这份文档可以直接作为需求提给 DSH；插件侧不需要再改架构，只补一个渲染分支。
