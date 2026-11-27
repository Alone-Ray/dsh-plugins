# 移植现有 HTML5 小游戏

> 目标：拿到一个现成的小游戏源码，用尽量小的改动挂进游戏中心。
> 本文是流程和验收标准；每移植一个游戏，在 `CHANGELOG.md` 记一笔。

## 1. 先判断形态

| 形态 | 特征 | 走哪个适配器 |
|:--|:--|:--|
| Canvas 脚本 | 自己创建 canvas，`requestAnimationFrame` 驱动 | `web`（`createWebRuntime` 提供 canvas + 尺寸） |
| DOM / 混合 | 自己操作 DOM、CSS 动画、按钮 | `native`（游戏自己建根节点，宿主只给容器） |
| 引擎产物 | Phaser / Pixi / CreateJS 打包后的单文件 | 先按 Canvas 脚本处理，引擎和游戏一起打包 |

判断方法：看入口是 `canvas.getContext` 还是 `document.createElement`。两种都能接，别为了统一去改游戏架构。

## 2. 移植步骤

以 2048 这类 DOM 游戏为例：

1. **拿源码和许可证**：确认允许分发（MIT / Apache-2.0 / CC0 等），把版权声明留在插件里。GPL 类要先确认整个插件的分发方式。
2. **改成容器内查找**：把 `document.querySelector('.game')` 改成 `container.querySelector(...)`，不要把游戏挂到 `document.body`。
3. **尺寸用容器**：`window.innerWidth` 换成容器 `getBoundingClientRect()`；实现 `resize(w, h)`，窗口缩放时重排。
4. **输入挂容器**：键盘监听挂在容器的 `keydown` 上（容器 `tabIndex=0`），不要挂 `window`；指针事件加 `setPointerCapture` 或 pointerdown/up。
5. **样式隔离**：给游戏根节点加唯一前缀（如 `.g2048`），或者在 Shadow DOM 里渲染；不要写全局选择器。
6. **存档改宿主**：`localStorage.getItem('best')` 换成 `host.save.get('best')` / `host.save.set(...)`，自动按游戏隔离。
7. **暂停/恢复**：实现 `pause()` / `resume()`；切后台由宿主调用，游戏里丢掉累计时间差。
8. **资源随包**：图片、音频、字体放插件目录，不访问公网；大文件按需加载。
9. **验收**：内嵌、开窗、缩放、暂停、重开、最高分、深色/浅色、窄窗口。

## 3. 2048 案例

插件里的 2048 是按上面的规则写的 **DOM 形态** 参考实现：

- 根节点 `.g2048`，所有样式都在这一个前缀下；
- 尺寸由容器决定，`resize` 里重算棋盘边长；
- 键盘挂在容器上，触屏用 pointerdown/up 判断滑动方向；
- 最高分走 `host.save`；
- `pause/resume` 只影响输入和遮罩。

真正移植第三方 2048 时，保留它的棋盘逻辑与动画，把「查找 DOM、尺寸、输入、存档」四件事按第 2 节改掉即可；UI 可以继续用它自己的 CSS，但必须加前缀或放进 Shadow DOM。

## 4. 已知限制

- 不允许 iframe，所以不能直接贴 URL 运行；游戏必须作为模块打包进插件。
- WebGL / Unity / Godot 产物体积和加载策略还没验证，暂不接。
- 依赖 `window.open`、跨域 `fetch`、外部 CDN 的游戏需要先改掉这些依赖。
- 第三方库（Phaser 等）要和游戏一起打包；本插件没有构建步骤，建议在外部构建好后把单文件产物复制进来。

## 5. 验收清单

- [ ] 内嵌舞台和独立窗口都能运行
- [ ] 窗口缩放后布局正确
- [ ] 切后台自动暂停，回来能继续
- [ ] 键盘只在游戏容器内生效，不干扰聊天输入
- [ ] 最高分/进度重启后仍在
- [ ] 深色/浅色下文字可读
- [ ] 窄窗口（宽 < 600）不溢出
- [ ] 卸载/关闭窗口后 rAF、定时器、监听器全部清理
