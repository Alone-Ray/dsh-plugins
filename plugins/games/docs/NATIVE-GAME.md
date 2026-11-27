# 原生游戏开发手册

> 适用：在游戏中心里从零写一个游戏，走 `native` 适配器（canvas 或 DOM 都行）。
> 移植现成游戏看 [PORTING.md](PORTING.md)；运行时契约的完整定义看 [RUNTIME.md](RUNTIME.md)。

## 1. 游戏放在哪

目前插件是单文件 Client bundle，原生游戏写在 `client.js` 里：

1. 定义 `const myGame = { ... }`；
2. 加进 `const GAMES = [snakeGame, breakoutGame, game2048, myGame]`；
3. 中英文案加到 `zh` / `en` 字典（`titleKey` / `descKey` / `tagKey`）；
4. 在游戏中心页面里就会出现卡片和抽屉条目，不需要改页面或窗口代码。

> 以后接构建步骤、拆成独立模块时，这一步会变成「在 `games/` 下加文件并注册」，契约不变。

## 2. 定义字段

```js
const myGame = {
  id: 'my-game',            // 唯一，存档按它隔离
  titleKey: 'myGameTitle',  // 文案 key，不要写死中文
  descKey: 'myGameDesc',
  tagKey: 'myGameTag',
  adapter: 'native',        // native = 自己建 canvas / DOM
  minSize: { w: 320, h: 240 },
  create(host) { /* 返回 runtime */ },
};
```

## 3. 运行时契约

`create(host)` 返回一个对象，宿主只调用这五个方法：

| 方法 | 什么时候调用 | 必须做什么 |
|:--|:--|:--|
| `mount(container)` | 进入舞台 / 打开窗口 | 在 container 里建自己的 DOM 或 canvas，绑定监听，起循环 |
| `resize(w, h, dpr)` | 容器尺寸变化 | 重排、重设 canvas 像素尺寸；不要依赖 window 尺寸 |
| `pause()` | 切后台、被遮挡、主动暂停 | 停止更新；保留状态 |
| `resume()` | 回到前台 | 恢复更新；重置时间基准，避免一次大跳 |
| `destroy()` | 关窗、换游戏、卸载 | 取消 rAF、清定时器、移除监听和 DOM |

**不许**在 `mount` 之外创建全局资源；**不许**把东西挂到 `document.body`；**不许**监听 `window` 的键盘。

## 4. 宿主给什么（host）

```js
{
  apiVersion: 1,
  theme: { tokens },          // 主题变量快照，挂载时读取
  locale: { t, language },    // 文案
  get size(),                 // { width, height, dpr }，实时读容器
  save: { get(key), set(key, value) },  // 按游戏隔离
  log: (...args),             // 带前缀的日志
  exit(),                     // 请求宿主收回游戏
  audio: { unlock(), mute() } // 目前的占位实现
}
```

存档键只写自己的名字，例如 `host.save.set('best', 12)`，宿主会落到 `dsh-games.save.<id>.best`，不会和别的游戏串。

## 5. 最小模板（canvas）

```js
const myGame = {
  id: 'my-game',
  titleKey: 'myGameTitle',
  descKey: 'myGameDesc',
  tagKey: 'myGameTag',
  adapter: 'native',
  minSize: { w: 320, h: 240 },
  create(host) {
    let canvas = null;
    let ctx = null;
    let raf = 0;
    let alive = true;
    let paused = false;
    let last = 0;
    let width = 1;
    let height = 1;

    function layout() {
      const parent = canvas && canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
      if (!alive) return;
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!paused) {
        // update(dt)
        ctx.clearRect(0, 0, width, height);
        // draw()
      }
      raf = requestAnimationFrame(frame);
    }

    function keydown(event) {
      if (event.key === ' ') {
        event.preventDefault();
        paused = !paused;
      }
    }

    return {
      mount(container) {
        canvas = document.createElement('canvas');
        container.appendChild(canvas);
        container.tabIndex = 0;
        container.style.outline = 'none';
        ctx = canvas.getContext('2d');
        layout();
        container.addEventListener('keydown', keydown);
        container.focus({ preventScroll: true });
        raf = requestAnimationFrame(frame);
      },
      resize() {
        layout();
      },
      pause() {
        paused = true;
      },
      resume() {
        paused = false;
        last = 0;
      },
      destroy() {
        alive = false;
        if (raf) cancelAnimationFrame(raf);
        container.removeEventListener('keydown', keydown);
        if (canvas) canvas.remove();
        canvas = null;
        ctx = null;
      },
    };
  },
};
```

把 `container` 存到闭包里，`destroy` 时用它移除监听。

## 6. 硬性规则

1. **容器就是你的世界**：所有 DOM 都建在 `container` 里，不查询 `document`，不写全局 CSS。样式加自己的前缀（如 `.g2048-*`）。
2. **焦点**：`container.tabIndex = 0`，`mount` 后 `focus()`；键盘监听挂 `container`，处理过的键 `preventDefault()`，避免页面滚动。
3. **尺寸**：只用容器尺寸；`resize` 里重算，不要缓存 window 宽高。
4. **暂停**：`pause()` 不要销毁状态；`resume()` 重置时间基准，避免 `dt` 过大。
5. **清理**：`destroy()` 必须取消 rAF、`clearInterval`、`removeEventListener`、移除自己的 DOM。
6. **存档**：只用 `host.save`，键名自己 namespace；不要直接写 `localStorage`。
7. **颜色**：文字/面板用 `host.theme.tokens` 或 `--dsw-alias-*`；纯美术色可以写死。
8. **文案**：界面文字用 `host.locale.t`（或模块里的 `t`），并补 zh/en 两个 key。
9. **错误**：不要吞掉异常后继续跑坏循环；让宿主显示错误卡。
10. **多实例**：同一个游戏可能同时出现在内嵌和多个窗口里，所有状态必须是实例内的，不能放模块级变量。

## 7. 两个参考实现

- **贪吃蛇**：纯 canvas，固定网格 + 固定步长，键盘在容器上，最高分走 `host.save`。
- **2048**：纯 DOM，自己建棋盘和格子，样式全部 `.g2048-*` 前缀，滑动/方向键，暂停遮罩。

## 8. 性能要点

- 用 `requestAnimationFrame`，不要 `setInterval` 驱动画面；
- DPR 上限 2，4K 屏不要按 4 倍渲染；
- 每帧只做必要的重排；DOM 游戏把样式变化合并到一次写入；
- 切后台由宿主 `pause()`，自己不要再跑循环；
- 大图/音频按需加载，别在 `mount` 里同步解码几十 MB。

## 9. 调试与验收

调试：`host.log('...')`；在窗口里反复开关，确认没有泄漏；用两个窗口开同一个游戏，确认状态互不影响。

验收清单：

- [ ] 内嵌舞台能玩，窗口里也能玩
- [ ] 拖动缩放窗口后布局正确
- [ ] 切后台再回来能继续，不会瞬移
- [ ] 键盘只在游戏里生效，不抢聊天输入
- [ ] 关闭窗口 / 换游戏后没有残留 rAF、定时器、监听
- [ ] 最高分在重启后仍在
- [ ] 深色/浅色下文字可读
- [ ] 窄窗口（宽 < 600）不溢出

## 10. 常见坑

| 现象 | 原因 | 修法 |
|:--|:--|:--|
| 按键让页面滚动 | 监听在 window 或没 preventDefault | 监听容器 + 对方向键/空格 `preventDefault` |
| 窗口缩放后画面糊 | 只改了 CSS 尺寸，没改 canvas 像素尺寸 | `canvas.width/height` 按 `dpr` 重设 |
| 开两个窗口互相影响 | 状态写在模块级 | 全部放进 `create` 闭包 |
| 关窗后 CPU 还在跑 | `destroy` 没取消 rAF | 保存 rAF id 并取消 |
| 切回来游戏瞬移 | `dt` 用了切走前的时间 | `resume` 里 `last = 0` |
| 存档串游戏 | 用了全局 key | 只用 `host.save`，它会加游戏前缀 |
| 样式污染宿主 | 写了全局选择器 | 所有类名前缀 + 挂在根节点下 |
