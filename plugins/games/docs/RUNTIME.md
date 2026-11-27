# 游戏运行时契约

> 状态：**native 与 web 适配器已落地**（贪吃蛇 / 打砖块；`client.js` 的 `GameRuntimeView` + `createHost` + `createWebRuntime`）；`flash` 适配器仍待实现。实现时以本文为准，改了要同步改这里。

## 1. 一个游戏要提供什么

```js
export const definition = {
  id: 'snake',                    // 唯一，存档和 URL 都用它
  titleKey: 'games.snake.title',  // 文案走 locale
  descKey: 'games.snake.desc',
  accent: 'brand',                // 卡片强调色：brand / success / warn
  adapter: 'native',              // native | web | engine | flash | emulator
  minSize: { w: 360, h: 280 },    // 窗口小于这个尺寸时提示
  create(host) {                  // 返回 GameRuntime
    return {
      mount(container) {},
      resize(width, height, dpr) {},
      pause() {},
      resume() {},
      destroy() {},
    };
  },
};
```

`create` 是**纯函数式入口**：不进 React 状态，不读写全局，只拿 `host` 和容器。这样同一个游戏既能在内嵌舞台跑，也能在悬浮窗跑。

## 2. 宿主要给游戏什么（host）

```js
{
  theme: { tokens },            // 只读的主题变量，供 canvas 取色
  locale: { t, language },      // 游戏文案
  size: { width, height, dpr }, // 当前容器尺寸
  audio: { unlock(), mute(bool) },
  save: { get(key), set(key, value) },  // 命名空间已隔离到该游戏
  log: (...args) => void,
  exit: () => void,             // 请求宿主收回游戏
}
```

宿主负责：容器尺寸、DPR、暂停/恢复时机、键盘焦点范围、存档命名空间隔离、错误兜底。游戏只负责画面和逻辑。

## 3. 生命周期

```
create(host)
   │
 mount(container) ← 进入舞台 / 打开悬浮窗
   │
 resize(w,h,dpr) ← 每次容器变化（节流 100ms）
   │
 pause() / resume() ← 切换标签页、抽屉展开遮挡、窗口最小化
   │
 destroy() ← 退出游戏 / 切游戏 / 关窗（必须清理 rAF、定时器、监听器、音频）
```

**暂停时机**：`document.hidden`、窗口模式切换（内嵌 ↔ 悬浮）、抽屉遮挡超过 60% 舞台、游戏主动调用 `host.pause()`。

**恢复时不重放输入**；时间类游戏用累计时间差，不依赖 `Date.now()` 差值。

## 4. 输入

- 键盘监听只挂在游戏容器上，容器失焦立即释放。
- 游戏内快捷键不能注册到 `window`，避免和聊天输入冲突。
- 指针事件由容器捕获；拖拽类游戏自行 `setPointerCapture`。
- 触屏与鼠标统一走 Pointer Events。

## 5. 错误与降级

- 游戏抛错：宿主捕获，舞台显示「这个游戏挂了」+ 重试/换游戏，不影响 DSH。
- `mount` 超时（10s）：按失败处理。
- 音频被浏览器拦截：不报错，等用户第一次点击后再解锁。
- 资源加载失败：卡片显示缺失的资源名，不白屏。

## 6. 存档

- 每个游戏一个命名空间：`game:<id>`。
- 目标形态是 Host 侧 JSON（`host.call`），不写 `localStorage`（端口变了会丢）。
- **当前 native 实现先用 `localStorage`**，key 是 `dsh-games.save.<gameId>.<key>`，接口仍是 `host.save.get/set`，以后换存储只改宿主实现。
- 只存分数、进度这类小数据；大存档后续再定。

## 7. 版本

- 契约带 `apiVersion: 1`；破坏性改动升版本，旧游戏继续按旧版本跑或给出明确提示。
- 游戏声明 `minHostVersion`，宿主不满足时禁用而不是崩溃。

## 8. 示例（native）

```js
export const definition = {
  id: 'demo',
  adapter: 'native',
  create(host) {
    let raf = 0;
    let canvas;
    return {
      mount(container) {
        canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const loop = () => { raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
      },
      resize(w, h, dpr) { canvas.width = w * dpr; canvas.height = h * dpr; },
      pause() { cancelAnimationFrame(raf); },
      resume() { raf = requestAnimationFrame(function loop() { raf = requestAnimationFrame(loop); }); },
      destroy() { cancelAnimationFrame(raf); canvas.remove(); },
    };
  },
};
```
