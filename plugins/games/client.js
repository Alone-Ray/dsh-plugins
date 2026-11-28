window.__ModuleLoader__.load({
  id: '@local/dsh-games',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-games';
    const STORAGE_KEY = 'dsh-games.state.v2';
    const MIN_W = 320;
    const MIN_H = 240;
    const DEFAULT_RECT = { x: 0, y: 0, w: 560, h: 460 };
    const WIN_MODES = ['float', 'dock-left', 'dock-right', 'full'];
    const WIN_MODE_KEYS = {
      float: 'modeFloat',
      'dock-left': 'modeLeft',
      'dock-right': 'modeRight',
      full: 'modeFull',
    };
    const HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    const zh = {
      nav: '游戏',
      title: '游戏中心',
      subtitle: '框架预览：内嵌 / 多窗口、游戏抽屉、自定义背景，以及第一个原生游戏（贪吃蛇）。',
      openDemo: '打开游戏',
      newWindow: '新开窗口',
      detach: '独立窗口',
      detachFallback: 'DSH 暂未开放独立窗口，已用应用内窗口代替',
      windowsRunning: '个窗口运行中',
      embedAll: '全部收回内嵌',
      openEmbedded: '内嵌打开',
      openFloating: '新窗口打开',
      back: '返回游戏中心',
      gamesList: '游戏列表',
      moreGames: '更多游戏待接入',
      windowSection: '窗口',
      reset: '重置',
      width: '宽',
      height: '高',
      avoidComposer: '避开输入框',
      background: '自定义背景',
      bgChoose: '选择图片 / 视频',
      bgReset: '恢复默认',
      bgHint: '支持图片或视频，建议 60MB 以内；只存在本机。',
      bgNone: '当前是默认极光背景',
      bgUnsupported: '只支持图片或视频文件',
      bgTooLarge: '文件太大，请控制在 60MB 以内',
      bgFailed: '背景保存失败，换个文件试试',
      modeFloat: '浮动',
      modeLeft: '左半屏',
      modeRight: '右半屏',
      modeFull: '全屏',
      embedded: '内嵌',
      embed: '收回内嵌',
      floatIt: '新窗口',
      close: '关闭',
      closeWindow: '关闭这个窗口',
      more: '更多',
      menuFloat: '浮动窗口',
      menuLeft: '吸附左半屏',
      menuRight: '吸附右半屏',
      menuFull: '全屏',
      menuDetach: '独立窗口（新开）',
      menuEmbed: '全部收回内嵌',
      menuClose: '关闭游戏',
      floatingNote: '游戏正在应用内窗口里运行',
      floatingHint: '可以同时开多个窗口；左侧抽屉换游戏，双击窗口标题栏全部收回内嵌。',
      bringBack: '全部收回内嵌',
      drawerToggle: '收起/展开游戏列表',
      hintDrag: '拖动标题栏移动，拖动边缘缩放，双击标题栏收回内嵌',
      comingSoon: '待接入游戏',
      adapterTitle: '待接入适配层',
      adapterDesc: '更多游戏可以用同一套运行时接进来。',
      adaptersTitle: '接入方式',
      adapterNative: '原生模块',
      adapterNativeDesc: '已落地：贪吃蛇按 mount / resize / pause / destroy 跑在舞台和窗口里。',
      adapterHtml5: 'HTML5 小游戏',
      adapterHtml5Desc: '已跑通：打砖块通过这层 canvas 适配器接入。',
      adapterFlash: 'Flash / SWF',
      adapterFlashDesc: '计划用 Ruffle（WASM）适配器加载。',
      crashTitle: '这个游戏挂了',
      crashHint: '游戏渲染出错，已隔离，不影响 DSH 其他部分。',
      crashRetry: '重试',
      snakeTitle: '贪吃蛇',
      snakeDesc: '方向键 / WASD 控制，空格暂停，R 重开；吃到果子加分。',
      snakeTag: '原生',
      snakeScore: '分数',
      snakeBest: '最高',
      snakeOver: '游戏结束',
      snakeRestart: '按 R 或点击重来',
      snakePaused: '已暂停',
      snakePauseHint: '按空格继续',
      breakoutTitle: '打砖块',
      breakoutDesc: '移动鼠标或左右键控制挡板，空格暂停，R 重开；清空砖块过关。',
      breakoutTag: 'HTML5 适配',
      breakoutScore: '分数',
      breakoutLives: '生命',
      breakoutOver: '游戏结束',
      breakoutWin: '通关',
      breakoutRestart: '按 R 或点击重来',
      breakoutPauseHint: '按空格继续',
      g2048Title: '2048',
      g2048Desc: '方向键 / 滑动合并数字，凑出 2048；空格暂停，R 重开。',
      g2048Tag: 'DOM 游戏',
      g2048Hint: '方向键 / 滑动；空格暂停',
      g2048RestartBtn: '重开',
      g2048Score: '分数',
      g2048Best: '最高',
      g2048Over: '没有可走的步了',
      g2048Win: '凑出 2048！',
      g2048Restart: '按 R 或点击重开',
      pongTitle: '乒乓球',
      pongDesc: 'W/S 或上下键移动，先得 5 分获胜；空格暂停，R 重开。',
      pongTag: '第三方移植',
      pongHint: 'W / S 或 ↑ / ↓ 移动 · 空格暂停 · R 重开',
      pongWin: '你赢了',
      pongLose: 'AI 赢了',
      pongPaused: '已暂停',
      pongRestart: '按 R 或空格重开',
      invadersTitle: '太空侵略者',
      invadersDesc: '左右键移动，空格射击；P 暂停；回车开始。',
      invadersTag: '第三方移植',
      invadersStart: '按回车开始',
      invadersOver: '游戏结束',
      invadersScore: '得分',
      invadersRestart: '按回车再来一局',
      invadersPaused: '已暂停',
      invadersResume: '按 P 继续',
      sokobanTitle: '推箱子',
      sokobanDesc: '方向键 / WASD 移动，把所有箱子推到目标点；R 重开。',
      sokobanTag: '第三方移植',
      sokobanWin: '过关！',
      sokobanRestart: '重开',
      running: '运行中',
    };

    const en = {
      nav: 'Games',
      title: 'Games',
      subtitle: 'Framework preview: embedded and multi-window modes, the drawer, custom backgrounds and the first native game (Snake).',
      openDemo: 'Open game',
      newWindow: 'New window',
      detach: 'Independent window',
      detachFallback: 'DSH does not expose independent windows yet; opened an in-app window instead',
      windowsRunning: 'windows running',
      embedAll: 'Embed all',
      openEmbedded: 'Open embedded',
      openFloating: 'Open in new window',
      back: 'Back to Games',
      gamesList: 'Games',
      moreGames: 'More games to come',
      windowSection: 'Window',
      reset: 'Reset',
      width: 'Width',
      height: 'Height',
      avoidComposer: 'Avoid the composer',
      background: 'Custom background',
      bgChoose: 'Choose image / video',
      bgReset: 'Restore default',
      bgHint: 'Images or videos up to 60 MB; stored only on this machine.',
      bgNone: 'Using the default aurora background',
      bgUnsupported: 'Only image or video files are supported',
      bgTooLarge: 'That file is too large; keep it under 60 MB',
      bgFailed: 'Saving the background failed; try another file',
      modeFloat: 'Floating',
      modeLeft: 'Left half',
      modeRight: 'Right half',
      modeFull: 'Full screen',
      embedded: 'Embedded',
      embed: 'Embed',
      floatIt: 'New window',
      close: 'Close',
      closeWindow: 'Close this window',
      more: 'More',
      menuFloat: 'Floating window',
      menuLeft: 'Dock left half',
      menuRight: 'Dock right half',
      menuFull: 'Full screen',
      menuDetach: 'Independent window (new)',
      menuEmbed: 'Embed all',
      menuClose: 'Close game',
      floatingNote: 'The game is running in in-app windows',
      floatingHint: 'Open as many windows as you like; the left drawer switches games, double-click a title bar to embed them all.',
      bringBack: 'Embed all',
      drawerToggle: 'Toggle the game list',
      hintDrag: 'Drag the title bar to move, edges to resize, double-click to embed',
      comingSoon: 'Games to come',
      adapterTitle: 'Adapter seam pending',
      adapterDesc: 'More games can plug into the same runtime.',
      adaptersTitle: 'Adapters',
      adapterNative: 'Native module',
      adapterNativeDesc: 'Shipped: Snake runs on mount / resize / pause / destroy in both the stage and windows.',
      adapterHtml5: 'HTML5 mini game',
      adapterHtml5Desc: 'Shipped: Breakout arrives through this canvas adapter.',
      adapterFlash: 'Flash / SWF',
      adapterFlashDesc: 'Planned through a Ruffle (WASM) adapter.',
      crashTitle: 'This game crashed',
      crashHint: 'The game threw while rendering. It is isolated; the rest of DSH is unaffected.',
      crashRetry: 'Retry',
      snakeTitle: 'Snake',
      snakeDesc: 'Arrow keys / WASD to steer, Space to pause, R to restart. Eat the fruit to score.',
      snakeTag: 'Native',
      snakeScore: 'Score',
      snakeBest: 'Best',
      snakeOver: 'Game over',
      snakeRestart: 'Press R or click to retry',
      snakePaused: 'Paused',
      snakePauseHint: 'Press Space to continue',
      breakoutTitle: 'Breakout',
      breakoutDesc: 'Move the mouse or use arrow keys to steer the paddle; Space pauses, R restarts. Clear the bricks to win.',
      breakoutTag: 'HTML5 adapter',
      breakoutScore: 'Score',
      breakoutLives: 'Lives',
      breakoutOver: 'Game over',
      breakoutWin: 'Cleared',
      breakoutRestart: 'Press R or click to retry',
      breakoutPauseHint: 'Press Space to continue',
      g2048Title: '2048',
      g2048Desc: 'Arrow keys or swipes merge the numbers; reach 2048. Space pauses, R restarts.',
      g2048Tag: 'DOM game',
      g2048Hint: 'Arrow keys / swipe; Space pauses',
      g2048RestartBtn: 'Restart',
      g2048Score: 'Score',
      g2048Best: 'Best',
      g2048Over: 'No moves left',
      g2048Win: 'You reached 2048',
      g2048Restart: 'Press R or click to retry',
      pongTitle: 'Ping Pong',
      pongDesc: 'Move with W/S or the arrow keys; first to 5 wins. Space pauses, R restarts.',
      pongTag: 'Third-party port',
      pongHint: 'W / S or ↑ / ↓ to move · Space to pause · R to restart',
      pongWin: 'You win',
      pongLose: 'AI wins',
      pongPaused: 'Paused',
      pongRestart: 'Press R or Space to retry',
      invadersTitle: 'Space Invaders',
      invadersDesc: 'Arrow keys to move, Space to shoot, P to pause; Enter starts.',
      invadersTag: 'Third-party port',
      invadersStart: 'Press Enter to start',
      invadersOver: 'Game over',
      invadersScore: 'Score',
      invadersRestart: 'Press Enter to play again',
      invadersPaused: 'Paused',
      invadersResume: 'Press P to continue',
      sokobanTitle: 'Sokoban',
      sokobanDesc: 'Move with the arrow keys / WASD and push every box onto a target. R restarts.',
      sokobanTag: 'Third-party port',
      sokobanWin: 'Level clear!',
      sokobanRestart: 'Restart',
      running: 'Running',
    };

    let translate = (key) => key;
    function t(key) {
      try {
        return translate(key) || key;
      } catch (error) {
        return key;
      }
    }

    // A native game implements only the runtime contract; it never touches
    // the page, the window manager or the store.
    const snakeGame = {
      id: 'snake',
      titleKey: 'snakeTitle',
      descKey: 'snakeDesc',
      tagKey: 'snakeTag',
      adapter: 'native',
      minSize: { w: 320, h: 280 },
      create(host) {
        const COLS = 22;
        const ROWS = 16;
        const TICK = 110;
        const readColor = (tokens, name, fallback) => tokens[name] || fallback;
        const initialTokens = host.theme.tokens || {};
        let bg = readColor(initialTokens, '--dsw-alias-bg-base', '#0b0d10');
        let ink = readColor(initialTokens, '--dsw-alias-label-secondary', '#8a8f98');
        let label = readColor(initialTokens, '--dsw-alias-label-primary', '#f5f6f8');
        let accent = readColor(initialTokens, '--dsw-alias-brand-primary', '#3d5afe');
        let success = readColor(initialTokens, '--dsw-alias-state-success-primary', '#3ecf8e');
        let warn = readColor(initialTokens, '--dsw-alias-state-warn-primary', '#ffb020');
        const offTheme = host.theme.subscribe
          ? host.theme.subscribe((tokens) => {
              bg = readColor(tokens, '--dsw-alias-bg-base', '#0b0d10');
              ink = readColor(tokens, '--dsw-alias-label-secondary', '#8a8f98');
              label = readColor(tokens, '--dsw-alias-label-primary', '#f5f6f8');
              accent = readColor(tokens, '--dsw-alias-brand-primary', '#3d5afe');
              success = readColor(tokens, '--dsw-alias-state-success-primary', '#3ecf8e');
              warn = readColor(tokens, '--dsw-alias-state-warn-primary', '#ffb020');
            })
          : function noop() {};

        let canvas = null;
        let ctx2d = null;
        let raf = 0;
        let alive = true;
        let paused = false;
        let over = false;
        let last = 0;
        let acc = 0;
        let pulse = 0;
        let width = 1;
        let height = 1;
        let cell = 20;
        let offsetX = 0;
        let offsetY = 0;
        let boardW = 0;
        let boardH = 0;
        let snake = [];
        let dir = { x: 1, y: 0 };
        let nextDir = { x: 1, y: 0 };
        let food = { x: 0, y: 0 };
        let score = 0;
        let best = Number(host.save.get('best')) || 0;

        function layout() {
          const parent = canvas && canvas.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          width = Math.max(1, Math.round(rect.width));
          height = Math.max(1, Math.round(rect.height));
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          canvas.style.width = width + 'px';
          canvas.style.height = height + 'px';
          ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
          const pad = Math.max(10, Math.round(Math.min(width, height) * 0.035));
          const hud = 30;
          cell = Math.max(8, Math.floor(Math.min((width - pad * 2) / COLS, (height - hud - pad * 2) / ROWS)));
          boardW = cell * COLS;
          boardH = cell * ROWS;
          offsetX = Math.round((width - boardW) / 2);
          offsetY = hud + Math.max(0, Math.round((height - hud - boardH) / 2));
        }

        function placeFood() {
          for (let guard = 0; guard < 200; guard += 1) {
            const x = Math.floor(Math.random() * COLS);
            const y = Math.floor(Math.random() * ROWS);
            if (!snake.some((segment) => segment.x === x && segment.y === y)) {
              food = { x: x, y: y };
              return;
            }
          }
          food = { x: 0, y: 0 };
        }

        function reset() {
          snake = [
            { x: 7, y: 8 },
            { x: 6, y: 8 },
            { x: 5, y: 8 },
          ];
          dir = { x: 1, y: 0 };
          nextDir = { x: 1, y: 0 };
          score = 0;
          over = false;
          paused = false;
          acc = 0;
          last = 0;
          placeFood();
        }

        function gameOver() {
          over = true;
          if (score > best) {
            best = score;
            host.save.set('best', best);
          }
        }

        function step() {
          if (over || paused) return;
          dir = nextDir;
          const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
          if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
            gameOver();
            return;
          }
          for (let i = 0; i < snake.length - 1; i += 1) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
              gameOver();
              return;
            }
          }
          snake.unshift(head);
          if (head.x === food.x && head.y === food.y) {
            score += 1;
            if (score > best) {
              best = score;
              host.save.set('best', best);
            }
            placeFood();
          } else {
            snake.pop();
          }
        }

        function setDir(x, y) {
          if (over) return;
          if (x === -nextDir.x && y === -nextDir.y) return;
          nextDir = { x: x, y: y };
        }

        function roundRect(x, y, w, h, r) {
          const radius = Math.min(r, w / 2, h / 2);
          ctx2d.beginPath();
          ctx2d.moveTo(x + radius, y);
          ctx2d.arcTo(x + w, y, x + w, y + h, radius);
          ctx2d.arcTo(x + w, y + h, x, y + h, radius);
          ctx2d.arcTo(x, y + h, x, y, radius);
          ctx2d.arcTo(x, y, x + w, y, radius);
          ctx2d.closePath();
        }

        function draw(now) {
          pulse = (Math.sin(now / 320) + 1) / 2;
          ctx2d.clearRect(0, 0, width, height);
          ctx2d.fillStyle = bg;
          ctx2d.fillRect(0, 0, width, height);

          ctx2d.fillStyle = 'rgba(127,127,127,0.08)';
          roundRect(offsetX - 8, offsetY - 8, boardW + 16, boardH + 16, 16);
          ctx2d.fill();

          ctx2d.save();
          ctx2d.globalAlpha = 0.16;
          ctx2d.strokeStyle = ink;
          ctx2d.lineWidth = 1;
          for (let x = 1; x < COLS; x += 1) {
            ctx2d.beginPath();
            ctx2d.moveTo(offsetX + x * cell + 0.5, offsetY);
            ctx2d.lineTo(offsetX + x * cell + 0.5, offsetY + boardH);
            ctx2d.stroke();
          }
          for (let y = 1; y < ROWS; y += 1) {
            ctx2d.beginPath();
            ctx2d.moveTo(offsetX, offsetY + y * cell + 0.5);
            ctx2d.lineTo(offsetX + boardW, offsetY + y * cell + 0.5);
            ctx2d.stroke();
          }
          ctx2d.restore();

          ctx2d.beginPath();
          ctx2d.arc(
            offsetX + food.x * cell + cell / 2,
            offsetY + food.y * cell + cell / 2,
            cell * 0.26 + pulse * cell * 0.05,
            0,
            Math.PI * 2,
          );
          ctx2d.fillStyle = warn;
          ctx2d.globalAlpha = 0.92;
          ctx2d.fill();
          ctx2d.globalAlpha = 1;

          for (let i = snake.length - 1; i >= 0; i -= 1) {
            const segment = snake[i];
            const inset = Math.max(1, cell * 0.07);
            ctx2d.globalAlpha = i === 0 ? 1 : Math.max(0.55, 0.95 - i * 0.02);
            ctx2d.fillStyle = i === 0 ? accent : success;
            roundRect(
              offsetX + segment.x * cell + inset,
              offsetY + segment.y * cell + inset,
              cell - inset * 2,
              cell - inset * 2,
              cell * 0.26,
            );
            ctx2d.fill();
          }
          ctx2d.globalAlpha = 1;

          const head = snake[0];
          if (head) {
            const hx = offsetX + head.x * cell + cell / 2;
            const hy = offsetY + head.y * cell + cell / 2;
            const ex = dir.x !== 0 ? dir.x * cell * 0.16 : 0;
            const ey = dir.y !== 0 ? dir.y * cell * 0.16 : 0;
            const ox = dir.x === 0 ? cell * 0.18 : 0;
            const oy = dir.y === 0 ? cell * 0.18 : 0;
            ctx2d.fillStyle = bg;
            ctx2d.beginPath();
            ctx2d.arc(hx + ex + ox, hy + ey + oy, Math.max(1.4, cell * 0.07), 0, Math.PI * 2);
            ctx2d.fill();
            ctx2d.beginPath();
            ctx2d.arc(hx + ex - ox, hy + ey - oy, Math.max(1.4, cell * 0.07), 0, Math.PI * 2);
            ctx2d.fill();
          }

          ctx2d.fillStyle = ink;
          ctx2d.font = '12px ui-sans-serif, system-ui, sans-serif';
          ctx2d.textAlign = 'left';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText(t('snakeScore') + ' ' + score, offsetX, 16);
          ctx2d.textAlign = 'right';
          ctx2d.fillText(t('snakeBest') + ' ' + best, offsetX + boardW, 16);
          ctx2d.textAlign = 'left';

          if (paused || over) {
            ctx2d.fillStyle = 'rgba(0,0,0,0.42)';
            roundRect(offsetX, offsetY, boardW, boardH, 12);
            ctx2d.fill();
            ctx2d.textAlign = 'center';
            ctx2d.fillStyle = label;
            ctx2d.font = '600 18px ui-sans-serif, system-ui, sans-serif';
            ctx2d.fillText(over ? t('snakeOver') : t('snakePaused'), offsetX + boardW / 2, offsetY + boardH / 2 - 10);
            ctx2d.fillStyle = ink;
            ctx2d.font = '12px ui-sans-serif, system-ui, sans-serif';
            ctx2d.fillText(
              over ? t('snakeRestart') : t('snakePauseHint'),
              offsetX + boardW / 2,
              offsetY + boardH / 2 + 16,
            );
            ctx2d.textAlign = 'left';
          }
          ctx2d.textBaseline = 'alphabetic';
        }

        function frame(now) {
          if (!alive) return;
          if (!last) last = now;
          const dt = Math.min(120, now - last);
          last = now;
          if (!paused && !over) {
            acc += dt;
            let guard = 0;
            while (acc >= TICK && guard < 8) {
              acc -= TICK;
              guard += 1;
              step();
            }
          }
          draw(now);
          raf = requestAnimationFrame(frame);
        }

        function keydown(event) {
          const key = event.key;
          if (
            key === 'ArrowUp' ||
            key === 'ArrowDown' ||
            key === 'ArrowLeft' ||
            key === 'ArrowRight' ||
            key === ' '
          ) {
            event.preventDefault();
          }
          if (key === 'ArrowUp' || key === 'w' || key === 'W') setDir(0, -1);
          else if (key === 'ArrowDown' || key === 's' || key === 'S') setDir(0, 1);
          else if (key === 'ArrowLeft' || key === 'a' || key === 'A') setDir(-1, 0);
          else if (key === 'ArrowRight' || key === 'd' || key === 'D') setDir(1, 0);
          else if (key === ' ') {
            if (over) reset();
            else paused = !paused;
          } else if (key === 'r' || key === 'R') reset();
        }

        let start = null;
        function pointerdown(event) {
          const container = canvas && canvas.parentElement;
          if (container && container.focus) container.focus({ preventScroll: true });
          start = { x: event.clientX, y: event.clientY };
        }
        function pointerup(event) {
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          start = null;
          if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
            if (over) reset();
            return;
          }
          if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
          else setDir(0, dy > 0 ? 1 : -1);
        }

        return {
          mount(container) {
            canvas = document.createElement('canvas');
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            container.appendChild(canvas);
            container.tabIndex = 0;
            container.style.outline = 'none';
            ctx2d = canvas.getContext('2d');
            reset();
            layout();
            container.addEventListener('keydown', keydown);
            container.addEventListener('pointerdown', pointerdown);
            container.addEventListener('pointerup', pointerup);
            if (container.focus) container.focus({ preventScroll: true });
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
            offTheme();
            if (raf) cancelAnimationFrame(raf);
            const container = canvas && canvas.parentElement;
            if (container) {
              container.removeEventListener('keydown', keydown);
              container.removeEventListener('pointerdown', pointerdown);
              container.removeEventListener('pointerup', pointerup);
            }
            if (canvas) canvas.remove();
            canvas = null;
            ctx2d = null;
          },
        };
      },
    };

    const breakoutGame = {
      id: 'breakout',
      titleKey: 'breakoutTitle',
      descKey: 'breakoutDesc',
      tagKey: 'breakoutTag',
      adapter: 'web',
      minSize: { w: 360, h: 300 },
      createGame(host) {
        const readColor = (tokens, name, fallback) => tokens[name] || fallback;
        const initialTokens = host.theme.tokens || {};
        let bg = readColor(initialTokens, '--dsw-alias-bg-base', '#0b0d10');
        let ink = readColor(initialTokens, '--dsw-alias-label-secondary', '#8a8f98');
        let label = readColor(initialTokens, '--dsw-alias-label-primary', '#f5f6f8');
        let accent = readColor(initialTokens, '--dsw-alias-brand-primary', '#3d5afe');
        let success = readColor(initialTokens, '--dsw-alias-state-success-primary', '#3ecf8e');
        let warn = readColor(initialTokens, '--dsw-alias-state-warn-primary', '#ffb020');
        let danger = readColor(initialTokens, '--dsw-alias-state-error-primary', '#ef5f5f');
        const offTheme = host.theme.subscribe
          ? host.theme.subscribe((tokens) => {
              bg = readColor(tokens, '--dsw-alias-bg-base', '#0b0d10');
              ink = readColor(tokens, '--dsw-alias-label-secondary', '#8a8f98');
              label = readColor(tokens, '--dsw-alias-label-primary', '#f5f6f8');
              accent = readColor(tokens, '--dsw-alias-brand-primary', '#3d5afe');
              success = readColor(tokens, '--dsw-alias-state-success-primary', '#3ecf8e');
              warn = readColor(tokens, '--dsw-alias-state-warn-primary', '#ffb020');
              danger = readColor(tokens, '--dsw-alias-state-error-primary', '#ef5f5f');
            })
          : function noop() {};
        const COLS = 8;
        const ROWS = 4;
        const PADDLE_W = 0.2;
        const PADDLE_H = 0.022;
        const PADDLE_Y = 0.86;
        const BALL_R = 0.017;
        const TOP = 0.12;
        const GAP = 0.008;

        let canvas = null;
        let container = null;
        let ctx2d = null;
        let raf = 0;
        let alive = true;
        let paused = false;
        let over = false;
        let cleared = false;
        let last = 0;
        let width = 1;
        let height = 1;
        let paddle = 0.5;
        let ball = { x: 0.5, y: 0.8, vx: 0.3, vy: -0.55 };
        let bricks = [];
        let score = 0;
        let lives = 3;
        let best = Number(host.save.get('best')) || 0;

        function layout() {
          const parent = canvas && canvas.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          width = Math.max(1, Math.round(rect.width));
          height = Math.max(1, Math.round(rect.height));
          const ratio = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.round(width * ratio);
          canvas.height = Math.round(height * ratio);
          ctx2d.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function makeBricks() {
          bricks = [];
          const brickW = (1 - GAP * (COLS + 1)) / COLS;
          for (let row = 0; row < ROWS; row += 1) {
            for (let col = 0; col < COLS; col += 1) {
              bricks.push({
                x: GAP + col * (brickW + GAP),
                y: TOP + row * (0.042 + GAP),
                w: brickW,
                h: 0.042,
                row: row,
              });
            }
          }
        }

        function resetBall() {
          paddle = 0.5;
          ball = {
            x: 0.5,
            y: PADDLE_Y - 0.06,
            vx: Math.random() > 0.5 ? 0.3 : -0.3,
            vy: -0.55,
          };
        }

        function reset() {
          score = 0;
          lives = 3;
          over = false;
          cleared = false;
          paused = false;
          last = 0;
          makeBricks();
          resetBall();
        }

        function loseLife() {
          lives -= 1;
          if (lives <= 0) {
            over = true;
            if (score > best) {
              best = score;
              host.save.set('best', best);
            }
            return;
          }
          resetBall();
        }

        function step(dt) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;
          if (ball.x < BALL_R) {
            ball.x = BALL_R;
            ball.vx = Math.abs(ball.vx);
          }
          if (ball.x > 1 - BALL_R) {
            ball.x = 1 - BALL_R;
            ball.vx = -Math.abs(ball.vx);
          }
          if (ball.y < BALL_R) {
            ball.y = BALL_R;
            ball.vy = Math.abs(ball.vy);
          }
          if (ball.y > 1 + BALL_R) {
            loseLife();
            return;
          }

          if (ball.vy > 0 && ball.y + BALL_R >= PADDLE_Y && ball.y - BALL_R <= PADDLE_Y + PADDLE_H) {
            if (Math.abs(ball.x - paddle) <= PADDLE_W / 2 + BALL_R) {
              const offset = (ball.x - paddle) / (PADDLE_W / 2);
              ball.y = PADDLE_Y - BALL_R;
              ball.vy = -Math.abs(ball.vy);
              ball.vx = offset * 0.75;
              const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) || 1;
              const target = Math.min(1.15, 0.62 + score * 0.0008);
              ball.vx = (ball.vx / speed) * target;
              ball.vy = (ball.vy / speed) * target;
            }
          }

          for (let i = bricks.length - 1; i >= 0; i -= 1) {
            const brick = bricks[i];
            if (
              ball.x + BALL_R > brick.x &&
              ball.x - BALL_R < brick.x + brick.w &&
              ball.y + BALL_R > brick.y &&
              ball.y - BALL_R < brick.y + brick.h
            ) {
              bricks.splice(i, 1);
              score += 10;
              if (score > best) {
                best = score;
                host.save.set('best', best);
              }
              ball.vy = ball.y < brick.y + brick.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
              break;
            }
          }

          if (bricks.length === 0) {
            cleared = true;
            if (score > best) {
              best = score;
              host.save.set('best', best);
            }
          }
        }

        function roundRect(x, y, w, h, r) {
          const radius = Math.min(r, w / 2, h / 2);
          ctx2d.beginPath();
          ctx2d.moveTo(x + radius, y);
          ctx2d.arcTo(x + w, y, x + w, y + h, radius);
          ctx2d.arcTo(x + w, y + h, x, y + h, radius);
          ctx2d.arcTo(x, y + h, x, y, radius);
          ctx2d.arcTo(x, y, x + w, y, radius);
          ctx2d.closePath();
        }

        function draw() {
          ctx2d.clearRect(0, 0, width, height);
          ctx2d.fillStyle = bg;
          ctx2d.fillRect(0, 0, width, height);

          const palette = [accent, success, warn, danger];
          for (const brick of bricks) {
            const bx = brick.x * width;
            const by = brick.y * height;
            const bw = brick.w * width;
            const bh = brick.h * height;
            ctx2d.globalAlpha = 0.85;
            ctx2d.fillStyle = palette[brick.row % palette.length];
            roundRect(bx, by, bw, bh, Math.min(6, bh / 2));
            ctx2d.fill();
          }
          ctx2d.globalAlpha = 1;

          ctx2d.fillStyle = accent;
          roundRect(
            (paddle - PADDLE_W / 2) * width,
            PADDLE_Y * height,
            PADDLE_W * width,
            PADDLE_H * height,
            PADDLE_H * height,
          );
          ctx2d.fill();

          ctx2d.beginPath();
          ctx2d.arc(ball.x * width, ball.y * height, BALL_R * height, 0, Math.PI * 2);
          ctx2d.fillStyle = label;
          ctx2d.fill();
          ctx2d.lineWidth = 2;
          ctx2d.strokeStyle = accent;
          ctx2d.stroke();

          ctx2d.fillStyle = ink;
          ctx2d.font = '12px ui-sans-serif, system-ui, sans-serif';
          ctx2d.textAlign = 'left';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText(t('breakoutScore') + ' ' + score, 12, 18);
          ctx2d.textAlign = 'right';
          ctx2d.fillText(t('breakoutLives') + ' ' + lives, width - 12, 18);
          ctx2d.textAlign = 'left';

          if (paused || over || cleared) {
            ctx2d.fillStyle = 'rgba(0,0,0,0.45)';
            roundRect(width * 0.08, height * 0.3, width * 0.84, height * 0.34, 16);
            ctx2d.fill();
            ctx2d.textAlign = 'center';
            ctx2d.fillStyle = label;
            ctx2d.font = '600 18px ui-sans-serif, system-ui, sans-serif';
            ctx2d.fillText(
              over ? t('breakoutOver') : cleared ? t('breakoutWin') : t('snakePaused'),
              width / 2,
              height * 0.43,
            );
            ctx2d.fillStyle = ink;
            ctx2d.font = '12px ui-sans-serif, system-ui, sans-serif';
            ctx2d.fillText(
              over || cleared ? t('breakoutRestart') : t('breakoutPauseHint'),
              width / 2,
              height * 0.53,
            );
            ctx2d.textAlign = 'left';
          }
          ctx2d.textBaseline = 'alphabetic';
        }

        function frame(now) {
          if (!alive) return;
          if (!last) last = now;
          const dt = Math.min(0.03, (now - last) / 1000 || 0.016);
          last = now;
          if (!paused && !over && !cleared) step(dt);
          draw();
          raf = requestAnimationFrame(frame);
        }

        function keydown(event) {
          if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
            event.preventDefault();
            paddle = Math.max(PADDLE_W / 2, paddle - 0.05);
          } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
            event.preventDefault();
            paddle = Math.min(1 - PADDLE_W / 2, paddle + 0.05);
          } else if (event.key === ' ') {
            event.preventDefault();
            if (over || cleared) reset();
            else paused = !paused;
          } else if (event.key === 'r' || event.key === 'R') {
            reset();
          }
        }

        function pointerMove(event) {
          const rect = canvas.getBoundingClientRect();
          if (!rect.width) return;
          const x = (event.clientX - rect.left) / rect.width;
          paddle = Math.min(1 - PADDLE_W / 2, Math.max(PADDLE_W / 2, x));
        }

        function pointerDown() {
          if (container && container.focus) container.focus({ preventScroll: true });
          if (over || cleared) reset();
        }

        return {
          start(canvasEl, containerEl) {
            canvas = canvasEl;
            container = containerEl;
            ctx2d = canvas.getContext('2d');
            container.tabIndex = 0;
            container.style.outline = 'none';
            container.addEventListener('keydown', keydown);
            canvas.addEventListener('pointermove', pointerMove);
            canvas.addEventListener('pointerdown', pointerDown);
            reset();
            layout();
            if (container.focus) container.focus({ preventScroll: true });
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
            offTheme();
            if (raf) cancelAnimationFrame(raf);
            if (container) {
              container.removeEventListener('keydown', keydown);
            }
            if (canvas) {
              canvas.removeEventListener('pointermove', pointerMove);
              canvas.removeEventListener('pointerdown', pointerDown);
            }
            canvas = null;
            container = null;
            ctx2d = null;
          },
        };
      },
    };

    // A DOM game: it owns its markup and styles inside the host container.
    const game2048 = {
      id: '2048',
      titleKey: 'g2048Title',
      descKey: 'g2048Desc',
      tagKey: 'g2048Tag',
      adapter: 'native',
      minSize: { w: 340, h: 380 },
      create(host) {
        let root = null;
        let board = null;
        let overlay = null;
        let overlayTitle = null;
        let overlayHint = null;
        let scoreEl = null;
        let bestEl = null;
        let container = null;
        let cells = [];
        let grid = [];
        let score = 0;
        let best = Number(host.save.get('best')) || 0;
        let over = false;
        let won = false;
        let paused = false;
        let swipe = null;

        function empty() {
          return [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ];
        }

        function spawn() {
          const spots = [];
          for (let r = 0; r < 4; r += 1) {
            for (let c = 0; c < 4; c += 1) {
              if (!grid[r][c]) spots.push([r, c]);
            }
          }
          if (spots.length === 0) return;
          const spot = spots[Math.floor(Math.random() * spots.length)];
          grid[spot[0]][spot[1]] = Math.random() < 0.9 ? 2 : 4;
        }

        function slide(line) {
          const values = line.filter((value) => value);
          const out = [];
          for (let i = 0; i < values.length; i += 1) {
            if (values[i] === values[i + 1]) {
              const merged = values[i] * 2;
              out.push(merged);
              score += merged;
              i += 1;
            } else {
              out.push(values[i]);
            }
          }
          while (out.length < 4) out.push(0);
          return out;
        }

        function hasMoves() {
          for (let r = 0; r < 4; r += 1) {
            for (let c = 0; c < 4; c += 1) {
              if (!grid[r][c]) return true;
              if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
              if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
            }
          }
          return false;
        }

        function move(dir) {
          if (over || paused || won) return;
          const before = JSON.stringify(grid);
          if (dir === 'left' || dir === 'right') {
            for (let r = 0; r < 4; r += 1) {
              let row = grid[r].slice();
              if (dir === 'right') row.reverse();
              row = slide(row);
              if (dir === 'right') row.reverse();
              grid[r] = row;
            }
          } else {
            for (let c = 0; c < 4; c += 1) {
              let column = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
              if (dir === 'down') column.reverse();
              column = slide(column);
              if (dir === 'down') column.reverse();
              for (let r = 0; r < 4; r += 1) grid[r][c] = column[r];
            }
          }
          if (JSON.stringify(grid) === before) return;
          spawn();
          if (score > best) {
            best = score;
            host.save.set('best', best);
          }
          if (!won && grid.some((row) => row.some((value) => value >= 2048))) won = true;
          if (!hasMoves()) over = true;
          render();
        }

        function reset() {
          grid = empty();
          score = 0;
          over = false;
          won = false;
          paused = false;
          spawn();
          spawn();
          render();
        }

        function render() {
          for (let r = 0; r < 4; r += 1) {
            for (let c = 0; c < 4; c += 1) {
              const cell = cells[r * 4 + c];
              const value = grid[r][c];
              cell.textContent = value ? String(value) : '';
              cell.className = 'g2048-cell' + (value ? ' v' + Math.min(value, 4096) : '');
              if (value) {
                cell.classList.remove('is-pop');
                void cell.offsetWidth;
                cell.classList.add('is-pop');
              }
            }
          }
          scoreEl.textContent = String(score);
          bestEl.textContent = String(best);
          overlay.hidden = !(paused || over || won);
          if (!overlay.hidden) {
            overlayTitle.textContent = over ? t('g2048Over') : won ? t('g2048Win') : t('snakePaused');
            overlayHint.textContent = over || won ? t('g2048Restart') : t('snakePauseHint');
          }
        }

        function layout() {
          if (!root || !container || !board) return;
          const rect = container.getBoundingClientRect();
          const size = Math.max(180, Math.min(rect.width - 32, rect.height - 128, 520));
          board.style.width = size + 'px';
          board.style.height = size + 'px';
        }

        function keydown(event) {
          const map = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            w: 'up',
            a: 'left',
            s: 'down',
            d: 'right',
            W: 'up',
            A: 'left',
            S: 'down',
            D: 'right',
          };
          if (event.key === ' ') {
            event.preventDefault();
            if (over || won) reset();
            else paused = !paused;
            render();
            return;
          }
          if (event.key === 'r' || event.key === 'R') {
            reset();
            return;
          }
          const dir = map[event.key];
          if (!dir) return;
          event.preventDefault();
          if (paused) {
            paused = false;
            render();
          }
          move(dir);
        }

        function pointerdown(event) {
          swipe = { x: event.clientX, y: event.clientY };
          if (container && container.focus) container.focus({ preventScroll: true });
        }

        function pointerup(event) {
          if (!swipe) return;
          const dx = event.clientX - swipe.x;
          const dy = event.clientY - swipe.y;
          swipe = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
          if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
          else move(dy > 0 ? 'down' : 'up');
        }

        function click(event) {
          if (event.target.closest('[data-restart]')) {
            reset();
            return;
          }
          if (over || won) reset();
        }

        function element(tag, className, text) {
          const node = document.createElement(tag);
          if (className) node.className = className;
          if (text !== undefined) node.textContent = text;
          return node;
        }

        function build(target) {
          root = element('div', 'g2048');
          const top = element('div', 'g2048-top');
          top.appendChild(element('div', 'g2048-title', '2048'));
          const scores = element('div', 'g2048-scores');
          const scoreBox = element('div', 'g2048-score');
          scoreBox.appendChild(element('span', '', t('g2048Score')));
          scoreEl = element('b', '', '0');
          scoreBox.appendChild(scoreEl);
          const bestBox = element('div', 'g2048-score');
          bestBox.appendChild(element('span', '', t('g2048Best')));
          bestEl = element('b', '', '0');
          bestBox.appendChild(bestEl);
          scores.appendChild(scoreBox);
          scores.appendChild(bestBox);
          top.appendChild(scores);

          board = element('div', 'g2048-board');
          cells = [];
          for (let i = 0; i < 16; i += 1) {
            const cell = element('div', 'g2048-cell');
            board.appendChild(cell);
            cells.push(cell);
          }

          overlay = element('div', 'g2048-overlay');
          overlay.hidden = true;
          overlayTitle = element('strong');
          overlayHint = element('span');
          overlay.appendChild(overlayTitle);
          overlay.appendChild(overlayHint);

          const foot = element('div', 'g2048-foot');
          foot.appendChild(element('span', '', t('g2048Hint')));
          const restart = element('button', '', t('g2048RestartBtn'));
          restart.type = 'button';
          restart.setAttribute('data-restart', '');
          foot.appendChild(restart);

          root.appendChild(top);
          root.appendChild(board);
          root.appendChild(overlay);
          root.appendChild(foot);
          target.appendChild(root);
        }

        return {
          mount(target) {
            container = target;
            build(target);
            container.tabIndex = 0;
            container.style.outline = 'none';
            container.addEventListener('keydown', keydown);
            root.addEventListener('pointerdown', pointerdown);
            root.addEventListener('pointerup', pointerup);
            root.addEventListener('click', click);
            reset();
            layout();
            if (container.focus) container.focus({ preventScroll: true });
          },
          resize() {
            layout();
          },
          pause() {
            paused = true;
            render();
          },
          resume() {
            paused = false;
            render();
          },
          destroy() {
            if (container) container.removeEventListener('keydown', keydown);
            if (root) {
              root.removeEventListener('pointerdown', pointerdown);
              root.removeEventListener('pointerup', pointerup);
              root.removeEventListener('click', click);
              root.remove();
            }
            root = null;
            board = null;
            overlay = null;
            cells = [];
            container = null;
          },
        };
      },
    };

    // Ported from vruntime-labs/ping-pong (MIT, Copyright (c) 2026 vruntime labs).
    // Adapted for DSH: container-scoped input, fixed 60 Hz step, responsive canvas,
    // removed external links and touch buttons, added pause / restart / win state.
    const pongGame = {
      id: 'pong',
      titleKey: 'pongTitle',
      descKey: 'pongDesc',
      tagKey: 'pongTag',
      adapter: 'native',
      minSize: { w: 360, h: 280 },
      create(host) {
        const W = 600;
        const H = 400;
        const BAR = 30;
        const STEP = 1000 / 60;
        const keys = { up: false, down: false };
        let root = null;
        let canvas = null;
        let ctx = null;
        let container = null;
        let raf = 0;
        let alive = true;
        let paused = false;
        let last = 0;
        let acc = 0;
        let user = { x: 10, y: 0, width: 10, height: 80, score: 0 };
        let ai = { x: W - 20, y: 0, width: 10, height: 80, score: 0 };
        let ball = { x: W / 2, y: H / 2, radius: 8, dx: 5, dy: 5 };
        let winner = null;

        function playHeight() {
          return H - BAR;
        }

        function resetBall() {
          ball.x = W / 2;
          ball.y = playHeight() / 2;
          ball.dx = -ball.dx;
        }

        function reset() {
          user = { x: 10, y: playHeight() / 2 - 40, width: 10, height: 80, score: 0 };
          ai = { x: W - 20, y: playHeight() / 2 - 40, width: 10, height: 80, score: 0 };
          ball = { x: W / 2, y: playHeight() / 2, radius: 8, dx: 5, dy: 5 };
          keys.up = false;
          keys.down = false;
          winner = null;
          paused = false;
          last = 0;
          acc = 0;
        }

        function collision(b, p) {
          return (
            b.x - b.radius < p.x + p.width &&
            b.x + b.radius > p.x &&
            b.y - b.radius < p.y + p.height &&
            b.y + b.radius > p.y
          );
        }

        function update() {
          if (paused || winner) return;
          const limit = playHeight();
          const dir = (keys.up ? -6 : 0) + (keys.down ? 6 : 0);
          user.y = Math.max(0, Math.min(limit - user.height, user.y + dir));
          ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.08;
          ai.y = Math.max(0, Math.min(limit - ai.height, ai.y));

          ball.x += ball.dx;
          ball.y += ball.dy;
          if (ball.y - ball.radius < 0 || ball.y + ball.radius > limit) ball.dy = -ball.dy;

          const paddle = ball.x < W / 2 ? user : ai;
          if (collision(ball, paddle)) ball.dx = -ball.dx;

          if (ball.x - ball.radius < 0) {
            ai.score += 1;
            resetBall();
          } else if (ball.x + ball.radius > W) {
            user.score += 1;
            resetBall();
          }

          if (user.score >= 5) winner = 'user';
          else if (ai.score >= 5) winner = 'ai';
        }

        function text(value, x, y, size, color, align) {
          ctx.fillStyle = color;
          ctx.font = '600 ' + size + 'px ui-sans-serif, system-ui, sans-serif';
          ctx.textAlign = align || 'left';
          ctx.fillText(value, x, y);
        }

        function render() {
          if (!ctx) return;
          ctx.fillStyle = '#0b0d10';
          ctx.fillRect(0, 0, W, H);

          ctx.fillStyle = 'rgba(148,163,184,.22)';
          for (let y = 0; y < playHeight(); y += 28) ctx.fillRect(W / 2 - 2, y, 4, 14);

          text(String(user.score), W / 4, 56, 34, '#f8fafc', 'center');
          text(String(ai.score), (3 * W) / 4, 56, 34, '#f8fafc', 'center');

          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(user.x, user.y, user.width, user.height);
          ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.fillRect(0, H - BAR, W, BAR);
          text(t('pongHint'), W / 2, H - 10, 11, '#7dd3fc', 'center');

          if (paused || winner) {
            ctx.fillStyle = 'rgba(15,23,42,.74)';
            ctx.fillRect(0, 0, W, H);
            text(
              winner ? (winner === 'user' ? t('pongWin') : t('pongLose')) : t('pongPaused'),
              W / 2,
              H / 2 - 4,
              26,
              '#f8fafc',
              'center',
            );
            text(winner ? t('pongRestart') : t('snakePauseHint'), W / 2, H / 2 + 28, 12, '#94a3b8', 'center');
          }
          ctx.textAlign = 'left';
        }

        function layout() {
          if (!canvas || !container || !ctx) return;
          const rect = container.getBoundingClientRect();
          const scale = Math.min(rect.width / W, rect.height / H);
          const cssW = Math.max(1, Math.floor(W * scale));
          const cssH = Math.max(1, Math.floor(H * scale));
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.style.width = cssW + 'px';
          canvas.style.height = cssH + 'px';
          canvas.width = Math.round(cssW * dpr);
          canvas.height = Math.round(cssH * dpr);
          ctx.setTransform((cssW / W) * dpr, 0, 0, (cssH / H) * dpr, 0, 0);
        }

        function frame(now) {
          if (!alive) return;
          if (!last) last = now;
          const dt = Math.min(100, now - last);
          last = now;
          if (!paused && !winner) {
            acc += dt;
            let guard = 0;
            while (acc >= STEP && guard < 5) {
              update();
              acc -= STEP;
              guard += 1;
            }
          }
          render();
          raf = requestAnimationFrame(frame);
        }

        function keydown(event) {
          if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
            event.preventDefault();
            keys.up = true;
          } else if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') {
            event.preventDefault();
            keys.down = true;
          } else if (event.key === ' ') {
            event.preventDefault();
            if (winner) reset();
            else paused = !paused;
            last = 0;
            acc = 0;
          } else if (event.key === 'r' || event.key === 'R') {
            reset();
          }
        }

        function keyup(event) {
          if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') keys.up = false;
          if (event.key === 's' || event.key === 'S' || event.key === 'ArrowDown') keys.down = false;
        }

        function pointerMove(event) {
          if (!canvas || winner) return;
          const rect = canvas.getBoundingClientRect();
          if (!rect.height) return;
          const y = ((event.clientY - rect.top) / rect.height) * H;
          user.y = Math.max(0, Math.min(playHeight() - user.height, y - user.height / 2));
        }

        function pointerDown(event) {
          pointerMove(event);
          if (container && container.focus) container.focus({ preventScroll: true });
        }

        return {
          mount(target) {
            container = target;
            root = document.createElement('div');
            root.className = 'pong-game';
            canvas = document.createElement('canvas');
            root.appendChild(canvas);
            target.appendChild(root);
            target.tabIndex = 0;
            target.style.outline = 'none';
            ctx = canvas.getContext('2d');
            reset();
            layout();
            target.addEventListener('keydown', keydown);
            target.addEventListener('keyup', keyup);
            canvas.addEventListener('pointermove', pointerMove);
            canvas.addEventListener('pointerdown', pointerDown);
            if (target.focus) target.focus({ preventScroll: true });
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
            acc = 0;
          },
          destroy() {
            alive = false;
            if (raf) cancelAnimationFrame(raf);
            if (container) {
              container.removeEventListener('keydown', keydown);
              container.removeEventListener('keyup', keyup);
            }
            if (canvas) {
              canvas.removeEventListener('pointermove', pointerMove);
              canvas.removeEventListener('pointerdown', pointerDown);
            }
            if (root) root.remove();
            root = null;
            canvas = null;
            ctx = null;
            container = null;
          },
        };
      },
    };

    // Ported from vrk/space-invaders (MIT, Copyright (c) 2017).
    // Adapted for DSH: container-scoped input, pause/resume/destroy, canvas
    // scaling, localized text screens. Game rules and classes are unchanged.
    const invadersGame = {
      id: 'invaders',
      titleKey: 'invadersTitle',
      descKey: 'invadersDesc',
      tagKey: 'invadersTag',
      adapter: 'native',
      minSize: { w: 360, h: 420 },
      create(host) {
        const W = 600;
        const H = 600;

        class Rectangle {
          constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
          }

          detectCollision(other) {
            const myRightX = this.x + this.width;
            const otherRightX = other.x + other.width;
            if (this.x > otherRightX) return false;
            if (other.x > myRightX) return false;
            if (this.isBelow(other)) return false;
            if (this.isAbove(other)) return false;
            return true;
          }

          intersectsX(other) {
            const myRightX = this.x + this.width;
            const otherRightX = other.x + other.width;
            if (this.x > otherRightX) return false;
            if (other.x > myRightX) return false;
            return true;
          }

          isAbove(other) {
            return other.y > this.y + this.height;
          }

          isBelow(other) {
            return this.y > other.y + other.height;
          }
        }

        const BULLET_Y_VELOCITY = 5;
        const BULLET_SIZE = 5;

        class Bullet extends Rectangle {
          constructor(startX, startY) {
            super(startX, startY, BULLET_SIZE, BULLET_SIZE);
            this.color = 'white';
            this.yVelocity = BULLET_Y_VELOCITY;
            this.alive = true;
          }

          update() {
            const newY = this.y + this.yVelocity;
            if (newY > H - BULLET_SIZE) this.kill();
            this.y = newY;
          }

          render(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
          }

          kill() {
            this.alive = false;
          }

          isAlive() {
            return this.alive;
          }
        }

        const BARRIER_HEIGHT = 40;
        const BARRIER_WIDTH = 70;
        const BARRIER_MAX_HEALTH = 10;

        class Barrier extends Rectangle {
          constructor(startX, startY) {
            super(startX, startY, BARRIER_WIDTH, BARRIER_HEIGHT);
            this.health = BARRIER_MAX_HEALTH;
          }

          resolveEnemyCollisions(bullets) {
            if (bullets.length === 0) return;
            bullets.forEach((bullet) => {
              if (this.detectCollision(bullet) || (this.intersectsX(bullet) && bullet.isBelow(this))) {
                this.health -= 1;
                const height = Math.ceil((this.health / BARRIER_MAX_HEALTH) * BARRIER_HEIGHT);
                const diff = this.height - height;
                this.y += diff;
                this.height = height;
                bullet.kill();
              }
            });
          }

          resolvePlayerCollisions(bullet) {
            if (!bullet) return;
            if (this.detectCollision(bullet) || (this.intersectsX(bullet) && bullet.isAbove(this))) {
              this.health -= 1;
              this.height = Math.floor((this.health / BARRIER_MAX_HEALTH) * BARRIER_HEIGHT);
              bullet.kill();
            }
          }

          isAlive() {
            return this.health > 0;
          }

          render(ctx) {
            ctx.fillStyle = 'blueviolet';
            ctx.fillRect(this.x, this.y, this.width, this.height);
          }
        }

        const ENEMY_BOX_HEIGHT = 20;
        const ENEMY_BOX_WIDTH = 30;
        const ENEMY_COL_MARGIN = 7;
        const ENEMY_ROW_MARGIN = 18;
        const NUMBER_COLUMNS = 11;
        const NUMBER_ROWS = 5;
        const FLEET_START_Y = 150;
        const FLEET_WIDTH = (NUMBER_COLUMNS - 1) * ENEMY_COL_MARGIN + NUMBER_COLUMNS * ENEMY_BOX_WIDTH;
        const FLEET_START_X = (FLEET_WIDTH - 2 * ENEMY_COL_MARGIN) / 4;
        const UPDATE_FREQUENCY_START = 45;
        const UPDATE_FREQUENCY_MIN = 4;
        const ENEMY_SHOOT_PROBABILITY = 0.5;
        const ENEMY_MAYBE_SHOOT_FREQUENCY = 120;

        class Enemy extends Rectangle {
          constructor(startX, startY, onBumpedEdge, onReachedEnd) {
            super(startX, startY, ENEMY_BOX_WIDTH, ENEMY_BOX_HEIGHT);
            this.onBumpedEdge = onBumpedEdge;
            this.onReachedEnd = onReachedEnd;
            this.color = 'white';
            this.xVelocity = 5;
            this.shouldHighlight = false;
            this.highlightTicks = 0;
            this.alive = true;
          }

          advanceY() {
            this.xVelocity *= -1;
            const newY = this.y + ENEMY_ROW_MARGIN;
            const bound = H - ENEMY_BOX_HEIGHT * 4;
            if (newY >= bound) this.onReachedEnd();
            else this.y = newY;
          }

          advanceX() {
            const leftBound = ENEMY_COL_MARGIN;
            const rightBound = W - this.width - ENEMY_COL_MARGIN;
            const newX = this.x + this.xVelocity;
            const nextX = this.x + 2 * this.xVelocity;
            if (nextX > rightBound || nextX < leftBound) this.onBumpedEdge();
            this.x = newX;
          }

          render(ctx) {
            if (this.shouldHighlight) {
              if (this.highlightTicks >= 10) {
                this.highlightTicks = 0;
                this.shouldHighlight = false;
                this.color = 'white';
              } else {
                if (this.highlightTicks === 0) this.color = 'red';
                this.highlightTicks += 1;
              }
            }
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
          }

          highlight() {
            this.shouldHighlight = true;
          }

          kill() {
            this.alive = false;
          }

          isAlive() {
            return this.alive;
          }

          createBullet() {
            return new Bullet(this.x + this.width / 2, this.y + this.height / 2);
          }
        }

        class EnemyFleet {
          constructor(onNewBullet, onEnemyKilled) {
            this.onNewBullet = onNewBullet;
            this.onEnemyKilled = onEnemyKilled;
            this.onBumpedEdge = this.onBumpedEdge.bind(this);
            this.onReachedEnd = this.onReachedEnd.bind(this);
          }

          start() {
            this.restart();
          }

          restart() {
            this.enemies = [];
            this.enemiesByColRow = [];
            this.numberKilled = 0;
            this.ticksSoFar = 0;
            this.ticksSinceLastSpeedUp = 0;
            this.updateFrequency = UPDATE_FREQUENCY_START;
            this.needsNextRow = false;
            this.conquered = false;

            for (let col = 0; col < NUMBER_COLUMNS; col += 1) {
              const startX = FLEET_START_X + (ENEMY_BOX_WIDTH + ENEMY_COL_MARGIN) * col;
              this.enemiesByColRow[col] = [];
              for (let row = 0; row < NUMBER_ROWS; row += 1) {
                const startY = FLEET_START_Y + (ENEMY_BOX_HEIGHT + ENEMY_ROW_MARGIN) * row;
                const enemy = new Enemy(startX, startY, this.onBumpedEdge, this.onReachedEnd);
                this.enemies.push(enemy);
                this.enemiesByColRow[col].push(enemy);
              }
            }
          }

          resolveCollisions(bullet) {
            if (!bullet) return;
            this.enemies.forEach((enemy) => {
              if (enemy.detectCollision(bullet)) {
                enemy.kill();
                bullet.kill();
                this.numberKilled += 1;
                this.onEnemyKilled();
              }
            });
            this.enemies = this.enemies.filter((enemy) => enemy.isAlive());
          }

          update(dt) {
            this.ticksSoFar += dt;
            this.ticksSinceLastSpeedUp += dt;

            if (this.ticksSoFar % ENEMY_MAYBE_SHOOT_FREQUENCY === 0) {
              for (let i = 0; i < 2; i += 1) {
                if (Math.random() < ENEMY_SHOOT_PROBABILITY) {
                  const shooter = this.chooseRandomShooter();
                  if (shooter) {
                    this.onNewBullet(shooter.createBullet());
                    shooter.highlight();
                  }
                }
              }
            }

            if (this.ticksSinceLastSpeedUp % this.updateFrequency === 0) {
              if (this.needsNextRow) {
                this.enemies.forEach((enemy) => enemy.advanceY());
                this.needsNextRow = false;
              } else {
                this.enemies.forEach((enemy) => enemy.advanceX());
              }
              if (this.numberKilled > 0) {
                this.updateFrequency = Math.max(this.updateFrequency - this.numberKilled, UPDATE_FREQUENCY_MIN);
                this.ticksSinceLastSpeedUp = 0;
                this.numberKilled = 0;
              }
            }
          }

          render(ctx) {
            this.enemies.forEach((enemy) => enemy.render(ctx));
          }

          hasConquered() {
            return this.conquered;
          }

          isDefeated() {
            return this.enemies.length === 0;
          }

          onBumpedEdge() {
            this.needsNextRow = true;
          }

          onReachedEnd() {
            this.conquered = true;
          }

          chooseRandomShooter() {
            const potentialShooters = [];
            for (const row of this.enemiesByColRow) {
              for (let i = row.length - 1; i >= 0; i -= 1) {
                const enemy = row[i];
                if (enemy.isAlive()) {
                  potentialShooters.push(enemy);
                  break;
                }
              }
            }
            if (potentialShooters.length === 0) return null;
            return potentialShooters[Math.floor(Math.random() * potentialShooters.length)];
          }
        }

        const PLAYER_BULLET_Y_VELOCITY = 9;
        const PLAYER_BULLET_SIZE = 5;

        class PlayerBullet extends Rectangle {
          constructor(startX, startY) {
            super(startX, startY, PLAYER_BULLET_SIZE, PLAYER_BULLET_SIZE);
            this.color = 'white';
            this.yVelocity = -PLAYER_BULLET_Y_VELOCITY;
            this.alive = true;
          }

          update() {
            const newY = this.y + this.yVelocity;
            if (newY < 0) this.kill();
            this.y = newY;
          }

          render(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
          }

          kill() {
            this.alive = false;
          }

          isAlive() {
            return this.alive;
          }
        }

        const PLAYER_SHIP_HEIGHT = 20;
        const PLAYER_SHIP_WIDTH = 40;
        const PLAYER_SHIP_SPEED = 4;
        const PLAYER_MAX_HEALTH = 3;

        class PlayerShip extends Rectangle {
          constructor(onNewBullet, keyTarget) {
            super((W - PLAYER_SHIP_WIDTH) / 2, H - PLAYER_SHIP_HEIGHT * 1.5, PLAYER_SHIP_WIDTH, PLAYER_SHIP_HEIGHT);
            this.onNewBullet = onNewBullet;
            this.keyTarget = keyTarget;
            this.onKeyDown = this.onKeyDown.bind(this);
            this.onKeyUp = this.onKeyUp.bind(this);
            this.lastBullet = null;
          }

          start() {
            this.restart();
            this.health = PLAYER_MAX_HEALTH;
            this.keyTarget.addEventListener('keyup', this.onKeyUp);
            this.keyTarget.addEventListener('keydown', this.onKeyDown);
          }

          restart() {
            this.health = Math.min(this.health + 1, PLAYER_MAX_HEALTH);
            this.xVelocity = 0;
            this.arrowsPressed = [];
          }

          stop() {
            this.keyTarget.removeEventListener('keyup', this.onKeyUp);
            this.keyTarget.removeEventListener('keydown', this.onKeyDown);
          }

          update() {
            this.x = Math.max(Math.min(this.x + this.xVelocity, W - PLAYER_SHIP_WIDTH), 0);
            if (this.lastBullet && !this.lastBullet.isAlive()) this.lastBullet = null;
          }

          resolveCollisions(enemyBullets) {
            if (enemyBullets.length === 0) return;
            enemyBullets.forEach((bullet) => {
              if (this.detectCollision(bullet)) {
                this.health -= 1;
                bullet.kill();
              }
            });
          }

          render(ctx) {
            if (this.health >= PLAYER_MAX_HEALTH) ctx.fillStyle = 'hotpink';
            else if (this.health === 2) ctx.fillStyle = 'yellow';
            else ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
          }

          isAlive() {
            return this.health > 0;
          }

          shootBullet() {
            if (this.lastBullet) return;
            const bullet = new PlayerBullet(this.x + this.width / 2, this.y + this.height / 2);
            this.lastBullet = bullet;
            this.onNewBullet(bullet);
          }

          onKeyDown(event) {
            const key = event.key;
            if (key === 'ArrowLeft') {
              event.preventDefault();
              this.xVelocity = -PLAYER_SHIP_SPEED;
              this.arrowsPressed.push(key);
            } else if (key === 'ArrowRight') {
              event.preventDefault();
              this.xVelocity = PLAYER_SHIP_SPEED;
              this.arrowsPressed.push(key);
            } else if (key === ' ') {
              event.preventDefault();
              this.shootBullet();
            }
          }

          onKeyUp(event) {
            const key = event.key;
            this.arrowsPressed = this.arrowsPressed.filter((element) => element !== key);
            if (this.arrowsPressed.length === 0) this.xVelocity = 0;
          }
        }

        class ScoreKeeper {
          constructor() {
            this.score = 0;
          }

          update() {
            this.score += 10;
          }

          render(ctx) {
            ctx.fillStyle = 'blueviolet';
            ctx.font = '20px Consolas, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(t('invadersScore') + ': ' + this.score, W - 10, 30);
            ctx.textAlign = 'left';
          }

          getScore() {
            return this.score;
          }
        }

        class TextWriter {
          constructor(context) {
            this.ctx = context;
            this.y = H / 3;
            this.color = 'white';
          }

          writeLine(textInput) {
            const text = textInput || '';
            this.ctx.fillStyle = this.color;
            this.ctx.font = '20px Consolas, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(text, W / 2, this.y);
            this.ctx.textAlign = 'left';
            this.y += 30;
          }
        }

        const FPS = 60;
        const SECONDS_PER_TICK = 1 / FPS;

        class SpaceGame {
          constructor(canvas, onGameOver, keyTarget) {
            this.onNewEnemyBullet = this.onNewEnemyBullet.bind(this);
            this.onNewPlayerBullet = this.onNewPlayerBullet.bind(this);
            this.onEnemyKilled = this.onEnemyKilled.bind(this);
            this.onGameOver = onGameOver;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.keyTarget = keyTarget;
            this.running = false;
            this.pausedState = false;
            this.loopHandle = 0;
          }

          start() {
            this.playerShip = new PlayerShip(this.onNewPlayerBullet, this.keyTarget);
            this.enemyFleet = new EnemyFleet(this.onNewEnemyBullet, this.onEnemyKilled);
            this.barriers = this.constructBarriers();
            this.enemyBullets = [];
            this.scoreKeeper = new ScoreKeeper();
            this.playerShip.start();
            this.enemyFleet.start();
            this.startGameLoop();
          }

          startGameLoop() {
            this.running = true;
            this.pausedState = false;
            const startTime = performance.now();
            let ticksLastTime = 0;
            const gameLoop = (timestamp) => {
              if (!this.running) return;
              this.clearScreen();
              const secondsSinceStart = (timestamp - startTime) / 1000;
              const ticksSinceStart = Math.floor(secondsSinceStart / SECONDS_PER_TICK);
              const ticksDelta = ticksSinceStart - ticksLastTime;

              this.playerShip.update();
              this.playerShip.render(this.ctx);
              this.enemyFleet.update(ticksDelta);
              this.enemyFleet.render(this.ctx);
              this.barriers.forEach((barrier) => barrier.render(this.ctx));
              this.scoreKeeper.render(this.ctx);

              if (this.playerBullet) this.playerBullet.update();
              this.filterBulletsByLiving();
              if (this.playerBullet) this.playerBullet.render(this.ctx);

              this.enemyBullets.forEach((bullet) => bullet.update());
              this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.isAlive());
              this.enemyBullets.forEach((bullet) => bullet.render(this.ctx));

              this.enemyFleet.resolveCollisions(this.playerBullet);
              this.playerShip.resolveCollisions(this.enemyBullets);
              this.filterBulletsByLiving();
              this.barriers.forEach((barrier) => barrier.resolveEnemyCollisions(this.enemyBullets));
              this.barriers.forEach((barrier) => barrier.resolvePlayerCollisions(this.playerBullet));
              this.barriers = this.barriers.filter((barrier) => barrier.isAlive());
              this.filterBulletsByLiving();

              ticksLastTime = ticksSinceStart;
              if (!this.enemyFleet.hasConquered() && this.playerShip.isAlive()) {
                if (this.enemyFleet.isDefeated()) this.nextLevel();
                this.loopHandle = requestAnimationFrame(gameLoop);
              } else {
                this.stop();
              }
            };
            this.loopHandle = requestAnimationFrame(gameLoop);
          }

          pause() {
            if (!this.running) return;
            this.running = false;
            this.pausedState = true;
            if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
            const writer = new TextWriter(this.ctx);
            writer.y = H / 2 - 20;
            writer.writeLine(t('invadersPaused'));
            writer.writeLine(t('invadersResume'));
          }

          resume() {
            if (!this.pausedState) return;
            this.startGameLoop();
          }

          isPaused() {
            return this.pausedState;
          }

          stop() {
            this.running = false;
            this.pausedState = false;
            if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
            if (this.playerShip) this.playerShip.stop();
            this.onGameOver(this.scoreKeeper ? this.scoreKeeper.getScore() : 0);
          }

          destroy() {
            this.running = false;
            this.pausedState = false;
            if (this.loopHandle) cancelAnimationFrame(this.loopHandle);
            if (this.playerShip) this.playerShip.stop();
          }

          nextLevel() {
            this.playerShip.restart();
            this.enemyFleet.restart();
            this.enemyBullets = [];
            this.playerBullet = null;
          }

          clearScreen() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }

          onNewEnemyBullet(bullet) {
            this.enemyBullets.push(bullet);
          }

          onNewPlayerBullet(bullet) {
            this.playerBullet = bullet;
          }

          onEnemyKilled() {
            this.scoreKeeper.update();
          }

          constructBarriers() {
            const BARRIER_MARGIN = 10;
            const NUMBER_BARRIERS = 4;
            const BARRIER_Y_POSITION = H * 0.75;
            const barriers = [];
            const maxWidth = W - BARRIER_MARGIN * 2;
            const sectionWidth = maxWidth / NUMBER_BARRIERS;
            const xOffset = (sectionWidth - BARRIER_WIDTH) / 2;
            for (let i = 0; i < NUMBER_BARRIERS; i += 1) {
              barriers.push(new Barrier(i * sectionWidth + xOffset + BARRIER_MARGIN, BARRIER_Y_POSITION));
            }
            return barriers;
          }

          filterBulletsByLiving() {
            this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.isAlive());
            if (this.playerBullet && !this.playerBullet.isAlive()) this.playerBullet = null;
          }
        }

        class App {
          constructor(canvas, container) {
            this.canvas = canvas;
            this.container = container;
            this.ctx = canvas.getContext('2d');
            this.game = null;
            this.acceptStart = true;
            this.onKeyUp = this.onKeyUp.bind(this);
            this.onKeyDown = this.onKeyDown.bind(this);
            container.addEventListener('keyup', this.onKeyUp);
            container.addEventListener('keydown', this.onKeyDown);
          }

          showIntro() {
            this.clear();
            const writer = new TextWriter(this.ctx);
            writer.writeLine(t('invadersTitle'));
            writer.writeLine('');
            writer.writeLine(t('invadersStart'));
          }

          gameOver(score) {
            this.acceptStart = true;
            this.game = null;
            this.clear();
            const writer = new TextWriter(this.ctx);
            writer.writeLine(t('invadersOver'));
            writer.writeLine(t('invadersScore') + ': ' + score);
            writer.writeLine('');
            writer.writeLine(t('invadersRestart'));
          }

          onKeyUp(event) {
            if (event.key === 'Enter' && this.acceptStart) this.startGame();
          }

          onKeyDown(event) {
            if (!this.game) return;
            if (event.key === 'p' || event.key === 'P') {
              event.preventDefault();
              if (this.game.isPaused()) this.game.resume();
              else this.game.pause();
            }
          }

          startGame() {
            this.acceptStart = false;
            if (this.game) {
              this.game.destroy();
              this.game = null;
            }
            this.clear();
            this.game = new SpaceGame(this.canvas, (score) => this.gameOver(score), this.container);
            this.game.start();
          }

          pause() {
            if (this.game) this.game.pause();
          }

          resume() {
            if (this.game) this.game.resume();
          }

          clear() {
            this.ctx.clearRect(0, 0, W, H);
          }

          destroy() {
            this.acceptStart = false;
            this.container.removeEventListener('keyup', this.onKeyUp);
            this.container.removeEventListener('keydown', this.onKeyDown);
            if (this.game) this.game.destroy();
            this.game = null;
          }
        }

        let root = null;
        let canvas = null;
        let app = null;
        let container = null;

        function layout() {
          if (!canvas || !container) return;
          const rect = container.getBoundingClientRect();
          const size = Math.max(120, Math.floor(Math.min(rect.width, rect.height)));
          canvas.style.width = size + 'px';
          canvas.style.height = size + 'px';
        }

        return {
          mount(target) {
            container = target;
            root = document.createElement('div');
            root.className = 'invaders-game';
            canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            root.appendChild(canvas);
            target.appendChild(root);
            target.tabIndex = 0;
            target.style.outline = 'none';
            app = new App(canvas, target);
            app.showIntro();
            layout();
            if (target.focus) target.focus({ preventScroll: true });
          },
          resize() {
            layout();
          },
          pause() {
            if (app) app.pause();
          },
          resume() {
            if (app) app.resume();
          },
          destroy() {
            if (app) app.destroy();
            if (root) root.remove();
            root = null;
            canvas = null;
            app = null;
            container = null;
          },
        };
      },
    };

    // Ported from taniarascia/sokoban (MIT, Copyright (c) 2021 Tania Rascia).
    // Adapted for DSH: canvas inside the game container, scoped keyboard input,
    // restart control, localized win text. Level and rules are unchanged.
    const sokobanGame = {
      id: 'sokoban',
      titleKey: 'sokobanTitle',
      descKey: 'sokobanDesc',
      tagKey: 'sokobanTag',
      adapter: 'native',
      minSize: { w: 320, h: 380 },
      create(host) {
        const EMPTY = 'empty';
        const WALL = 'wall';
        const BLOCK = 'block';
        const SUCCESS_BLOCK = 'success_block';
        const VOID = 'void';
        const PLAYER = 'player';
        const W = 600;
        const H = 675;
        const CELL = 75;
        const COLORS = {
          empty: { fill: '#ded7b3', stroke: '#ded7b3' },
          wall: { fill: '#868687', stroke: '#505051' },
          block: { fill: '#d9ae0a', stroke: '#C79300' },
          success_block: { fill: '#4ccd5a', stroke: '#3ca448' },
          void: { fill: '#dfbbb1', stroke: '#ca8e7d' },
          player: { fill: '#4f99e8', stroke: '#3f7ab9' },
        };
        const LEVEL_ONE = [
          [EMPTY, EMPTY, WALL, WALL, WALL, WALL, WALL, EMPTY],
          [WALL, WALL, WALL, EMPTY, EMPTY, EMPTY, WALL, EMPTY],
          [WALL, VOID, PLAYER, BLOCK, EMPTY, EMPTY, WALL, EMPTY],
          [WALL, WALL, WALL, EMPTY, BLOCK, VOID, WALL, EMPTY],
          [WALL, VOID, WALL, WALL, BLOCK, EMPTY, WALL, EMPTY],
          [WALL, EMPTY, WALL, EMPTY, VOID, EMPTY, WALL, WALL],
          [WALL, BLOCK, EMPTY, SUCCESS_BLOCK, BLOCK, BLOCK, VOID, WALL],
          [WALL, EMPTY, EMPTY, EMPTY, VOID, EMPTY, EMPTY, WALL],
          [WALL, WALL, WALL, WALL, WALL, WALL, WALL, WALL],
        ];
        const DIRECTIONS = { up: 'up', down: 'down', left: 'left', right: 'right' };

        const isBlock = (cell) => cell === BLOCK || cell === SUCCESS_BLOCK;
        const isTraversible = (cell) => cell === EMPTY || cell === VOID;
        const isWall = (cell) => cell === WALL;
        const isVoid = (cell) => cell === VOID || cell === SUCCESS_BLOCK;
        const getX = (x, direction, spaces) => {
          if (direction === DIRECTIONS.left) return x - (spaces || 1);
          if (direction === DIRECTIONS.right) return x + (spaces || 1);
          return x;
        };
        const getY = (y, direction, spaces) => {
          if (direction === DIRECTIONS.up) return y - (spaces || 1);
          if (direction === DIRECTIONS.down) return y + (spaces || 1);
          return y;
        };
        const cloneLevel = () => JSON.parse(JSON.stringify(LEVEL_ONE));

        let root = null;
        let frame = null;
        let canvas = null;
        let ctx = null;
        let container = null;
        let board = null;
        let restartButton = null;

        function generate() {
          board = cloneLevel();
        }

        function findPlayer() {
          for (let y = 0; y < board.length; y += 1) {
            const x = board[y].indexOf(PLAYER);
            if (x >= 0) {
              return {
                x,
                y,
                above: board[y - 1][x],
                below: board[y + 1][x],
                sideLeft: board[y][x - 1],
                sideRight: board[y][x + 1],
              };
            }
          }
          return null;
        }

        function paintCell(cell, x, y) {
          const px = x * CELL;
          const py = y * CELL;
          if (cell === VOID || cell === PLAYER) {
            const radius = cell === PLAYER ? 20 : 10;
            ctx.beginPath();
            ctx.rect(px, py, CELL, CELL);
            ctx.fillStyle = COLORS.empty.fill;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + CELL / 2, py + CELL / 2, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 10;
            ctx.strokeStyle = COLORS[cell].stroke;
            ctx.fillStyle = COLORS[cell].fill;
            ctx.fill();
            ctx.stroke();
          } else {
            const color = COLORS[cell] || COLORS.empty;
            ctx.beginPath();
            ctx.rect(px + 5, py + 5, CELL - 10, CELL - 10);
            ctx.fillStyle = color.fill;
            ctx.fill();
            ctx.beginPath();
            ctx.rect(px + 5, py + 5, CELL - 10, CELL - 10);
            ctx.lineWidth = 10;
            ctx.strokeStyle = color.stroke;
            ctx.stroke();
          }
        }

        function render() {
          ctx.fillStyle = COLORS.empty.fill;
          ctx.fillRect(0, 0, W, H);
          board.forEach((row, y) => row.forEach((cell, x) => paintCell(cell, x, y)));
          const onTarget = board.reduce(
            (sum, row) => sum + row.filter((cell) => cell === SUCCESS_BLOCK).length,
            0,
          );
          if (onTarget === 6) {
            ctx.fillStyle = 'rgba(17,17,17,.86)';
            ctx.fillRect(0, 0, W, H);
            ctx.font = 'bold 44px ui-sans-serif, system-ui, sans-serif';
            ctx.fillStyle = COLORS.success_block.fill;
            ctx.textAlign = 'center';
            ctx.fillText(t('sokobanWin'), W / 2, H / 2);
            ctx.textAlign = 'left';
          }
        }

        function movePlayer(playerCoords, direction) {
          board[playerCoords.y][playerCoords.x] = isVoid(LEVEL_ONE[playerCoords.y][playerCoords.x])
            ? VOID
            : EMPTY;
          board[getY(playerCoords.y, direction, 1)][getX(playerCoords.x, direction, 1)] = PLAYER;
        }

        function movePlayerAndBoxes(playerCoords, direction) {
          const newPlayerY = getY(playerCoords.y, direction, 1);
          const newPlayerX = getX(playerCoords.x, direction, 1);
          const newBoxY = getY(playerCoords.y, direction, 2);
          const newBoxX = getX(playerCoords.x, direction, 2);
          if (isWall(board[newBoxY][newBoxX])) return;

          if (isBlock(board[newBoxY][newBoxX])) {
            let blocksInARow = 1;
            let offset = 0;
            while (isBlock(board[getY(newBoxY, direction, offset)][getX(newBoxX, direction, offset)])) {
              blocksInARow += 1;
              offset += 1;
            }
            const nextBlock =
              board[getY(newPlayerY, direction, blocksInARow)][getX(newPlayerX, direction, blocksInARow)];
            if (isTraversible(nextBlock)) {
              for (let i = 0; i < blocksInARow; i += 1) {
                const y = getY(newBoxY, direction, i);
                const x = getX(newBoxX, direction, i);
                board[y][x] = isVoid(LEVEL_ONE[y][x]) ? SUCCESS_BLOCK : BLOCK;
              }
              movePlayer(playerCoords, direction);
            }
          } else {
            board[newBoxY][newBoxX] = isVoid(LEVEL_ONE[newBoxY][newBoxX]) ? SUCCESS_BLOCK : BLOCK;
            movePlayer(playerCoords, direction);
          }
        }

        function move(direction) {
          const player = findPlayer();
          if (!player) return;
          const adjacent = {
            [DIRECTIONS.up]: player.above,
            [DIRECTIONS.down]: player.below,
            [DIRECTIONS.left]: player.sideLeft,
            [DIRECTIONS.right]: player.sideRight,
          }[direction];
          if (isTraversible(adjacent)) movePlayer(player, direction);
          else if (isBlock(adjacent)) movePlayerAndBoxes(player, direction);
          render();
        }

        function restart() {
          generate();
          render();
        }

        function keydown(event) {
          const key = event.key;
          if (key === 'ArrowUp' || key === 'w' || key === 'W') {
            event.preventDefault();
            move(DIRECTIONS.up);
          } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
            event.preventDefault();
            move(DIRECTIONS.down);
          } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            event.preventDefault();
            move(DIRECTIONS.left);
          } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            event.preventDefault();
            move(DIRECTIONS.right);
          } else if (key === 'r' || key === 'R') {
            restart();
          }
        }

        function layout() {
          if (!frame || !container || !canvas) return;
          const rect = container.getBoundingClientRect();
          const scale = Math.min(rect.width / W, rect.height / H);
          const width = Math.max(120, Math.floor(W * scale));
          const height = Math.max(135, Math.floor(H * scale));
          frame.style.width = width + 'px';
          frame.style.height = height + 'px';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }

        return {
          mount(target) {
            container = target;
            root = document.createElement('div');
            root.className = 'sokoban-game';
            frame = document.createElement('div');
            frame.className = 'sokoban-frame';
            canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            ctx = canvas.getContext('2d');
            restartButton = document.createElement('button');
            restartButton.type = 'button';
            restartButton.className = 'sokoban-restart';
            restartButton.textContent = t('sokobanRestart');
            restartButton.addEventListener('click', restart);
            frame.appendChild(canvas);
            frame.appendChild(restartButton);
            root.appendChild(frame);
            target.appendChild(root);
            target.tabIndex = 0;
            target.style.outline = 'none';
            target.addEventListener('keydown', keydown);
            if (target.focus) target.focus({ preventScroll: true });
            generate();
            render();
            layout();
          },
          resize() {
            layout();
          },
          pause() {},
          resume() {},
          destroy() {
            if (container) container.removeEventListener('keydown', keydown);
            if (restartButton) restartButton.removeEventListener('click', restart);
            if (root) root.remove();
            root = null;
            frame = null;
            canvas = null;
            ctx = null;
            container = null;
          },
        };
      },
    };

    const GAMES = [snakeGame, breakoutGame, game2048, pongGame, invadersGame, sokobanGame];

    function gameById(id) {
      for (const game of GAMES) if (game.id === id) return game;
      return GAMES[0];
    }

    // ---------------------------------------------------------------- store
    const state = {
      view: 'hub', // hub | game
      gameId: null,
      drawer: true,
      windows: [], // { id, gameId, mode, rect, z }
      zCounter: 0,
      notice: null,
      winMode: 'dock-right',
      rect: { ...DEFAULT_RECT },
      avoidComposer: true,
      background: null,
    };
    const listeners = new Set();
    const themeListeners = new Set();
    let saveTimer = 0;
    let winSeq = 0;
    let noticeSeq = 0;
    let noticeTimer = 0;
    let desktopWindows = null;

    function emit() {
      for (const listener of listeners) listener();
    }

    function subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }

    function viewport() {
      return { w: window.innerWidth || 1280, h: window.innerHeight || 800 };
    }

    function persist() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        saveTimer = 0;
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              winMode: state.winMode,
              rect: state.rect,
              avoidComposer: state.avoidComposer,
              drawer: state.drawer,
            }),
          );
        } catch (error) {
          // Private mode or a full quota: keep working in memory.
        }
      }, 200);
    }

    function restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;
        if (WIN_MODES.indexOf(saved.winMode) >= 0) state.winMode = saved.winMode;
        const rect = saved.rect;
        if (
          rect &&
          [rect.x, rect.y, rect.w, rect.h].every((value) => typeof value === 'number' && isFinite(value))
        ) {
          state.rect = { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
        }
        if (typeof saved.avoidComposer === 'boolean') state.avoidComposer = saved.avoidComposer;
        if (typeof saved.drawer === 'boolean') state.drawer = saved.drawer;
      } catch (error) {
        // Malformed saved state is not worth failing the page for.
      }
    }

    const BG_DB = 'dsh-games-assets';
    const BG_STORE = 'background';
    const BG_MAX_BYTES = 60 * 1024 * 1024;
    let backgroundUrl = null;

    function openAssetDb() {
      return new Promise((resolve, reject) => {
        let request;
        try {
          request = indexedDB.open(BG_DB, 1);
        } catch (error) {
          reject(error);
          return;
        }
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(BG_STORE)) request.result.createObjectStore(BG_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    function readBackgroundRecord() {
      return openAssetDb().then(
        (db) =>
          new Promise((resolve) => {
            const tx = db.transaction(BG_STORE, 'readonly');
            const request = tx.objectStore(BG_STORE).get('bg');
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
          }),
      );
    }

    function writeBackgroundRecord(record) {
      return openAssetDb().then(
        (db) =>
          new Promise((resolve, reject) => {
            const tx = db.transaction(BG_STORE, 'readwrite');
            tx.objectStore(BG_STORE).put(record, 'bg');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          }),
      );
    }

    function deleteBackgroundRecord() {
      return openAssetDb().then(
        (db) =>
          new Promise((resolve) => {
            const tx = db.transaction(BG_STORE, 'readwrite');
            tx.objectStore(BG_STORE).delete('bg');
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve();
          }),
      );
    }

    function releaseBackgroundUrl() {
      if (backgroundUrl) {
        URL.revokeObjectURL(backgroundUrl);
        backgroundUrl = null;
      }
    }

    function setBackgroundRecord(record) {
      releaseBackgroundUrl();
      if (!record || !record.blob) {
        state.background = null;
        emit();
        return;
      }
      backgroundUrl = URL.createObjectURL(record.blob);
      state.background = {
        url: backgroundUrl,
        kind: record.kind === 'video' ? 'video' : 'image',
        name: record.name || '',
      };
      emit();
    }

    function clampRect(rect, box) {
      const maxW = Math.max(MIN_W, box.w - 16);
      const maxH = Math.max(MIN_H, box.h - 16);
      const w = Math.min(Math.max(rect.w, MIN_W), maxW);
      const h = Math.min(Math.max(rect.h, MIN_H), maxH);
      const x = Math.min(Math.max(rect.x, 8), Math.max(8, box.w - w - 8));
      const y = Math.min(Math.max(rect.y, 8), Math.max(8, box.h - h - 8));
      return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    }

    function winGeometry(win, box) {
      if (win.mode === 'full') {
        return clampRect({ x: 12, y: 12, w: box.w - 24, h: box.h - 24 }, box);
      }
      if (win.mode === 'dock-left' || win.mode === 'dock-right') {
        const rect = { ...win.rect };
        rect.x = win.mode === 'dock-left' ? 12 : box.w - rect.w - 12;
        return clampRect(rect, box);
      }
      return clampRect(win.rect, box);
    }

    function cascadeRect() {
      const box = viewport();
      const index = state.windows.filter((win) => win.mode === 'float').length;
      const w = Math.min(560, box.w - 48);
      const h = Math.min(440, box.h - 48);
      const x = Math.min(Math.max(96 + index * 28, 12), Math.max(12, box.w - w - 12));
      const y = Math.min(Math.max(96 + index * 28, 12), Math.max(12, box.h - h - 12));
      return clampRect({ x, y, w, h }, box);
    }

    function winModeRect(win, mode) {
      const box = viewport();
      if (mode === 'full') {
        return clampRect({ x: 12, y: 12, w: box.w - 24, h: box.h - 24 }, box);
      }
      if (mode === 'dock-left' || mode === 'dock-right') {
        const w = Math.max(MIN_W, Math.min(Math.round(box.w * 0.46), box.w - 24));
        const reserve = state.avoidComposer ? 84 : 0;
        return clampRect(
          { x: mode === 'dock-left' ? 12 : box.w - w - 12, y: 12, w, h: Math.max(MIN_H, box.h - 24 - reserve) },
          box,
        );
      }
      const from = winGeometry(win, box);
      const w = Math.min(from.w, Math.max(MIN_W, Math.round(box.w * 0.62)));
      const h = Math.min(from.h, Math.max(MIN_H, Math.round(box.h * 0.68)));
      return clampRect({ x: Math.round((box.w - w) / 2), y: 84, w, h }, box);
    }

    function setWinMode(mode) {
      if (WIN_MODES.indexOf(mode) < 0) return;
      state.rect = winModeRect({ mode: state.winMode, rect: state.rect }, mode);
      state.winMode = mode;
      emit();
      persist();
    }

    function notify(text) {
      state.notice = { id: ++noticeSeq, text };
      emit();
      if (noticeTimer) clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => {
        noticeTimer = 0;
        state.notice = null;
        emit();
      }, 4200);
    }

    async function applyBackground(file) {
      if (!file) return;
      const kind = file.type.indexOf('video/') === 0 ? 'video' : file.type.indexOf('image/') === 0 ? 'image' : null;
      if (!kind) {
        notify(t('bgUnsupported'));
        return;
      }
      if (file.size > BG_MAX_BYTES) {
        notify(t('bgTooLarge'));
        return;
      }
      try {
        await writeBackgroundRecord({ blob: file, kind: kind, name: file.name });
        setBackgroundRecord({ blob: file, kind: kind, name: file.name });
      } catch (error) {
        console.error('[dsh-games] background save failed', error);
        notify(t('bgFailed'));
      }
    }

    async function clearBackground() {
      releaseBackgroundUrl();
      state.background = null;
      emit();
      try {
        await deleteBackgroundRecord();
      } catch (error) {
        // Nothing to clean up.
      }
    }

    function selectGame(id) {
      state.gameId = id;
      state.view = 'game';
      emit();
      persist();
    }

    function openWindow(gameId, mode) {
      const id = gameId || state.gameId || GAMES[0].id;
      const first = state.windows.length === 0;
      const chosen = mode || (first ? 'dock-right' : 'float');
      const rect = chosen === 'float' && !first ? cascadeRect() : winModeRect({ mode: chosen, rect: state.rect }, chosen);
      const win = { id: 'w' + ++winSeq, gameId: id, mode: chosen, rect, z: ++state.zCounter };
      state.windows.push(win);
      state.gameId = id;
      state.view = 'game';
      state.winMode = chosen;
      state.rect = rect;
      emit();
      persist();
      return win;
    }

    function openDetached() {
      if (desktopWindows && typeof desktopWindows.openPanel === 'function') {
        try {
          const result = desktopWindows.openPanel({
            panelId: 'games',
            title: t('title'),
            width: 760,
            height: 560,
            resizable: true,
          });
          if (result && typeof result.catch === 'function') {
            result.catch((error) => {
              console.error('[dsh-games] independent window failed', error);
              notify(t('detachFallback'));
            });
          }
          return;
        } catch (error) {
          console.error('[dsh-games] independent window failed', error);
        }
      }
      openWindow(state.gameId || GAMES[0].id, 'float');
      notify(t('detachFallback'));
    }

    function closeWindow(id) {
      const win = state.windows.filter((item) => item.id === id)[0];
      if (!win || win.closing) return;
      win.closing = true;
      emit();
      setTimeout(() => {
        state.windows = state.windows.filter((item) => item.id !== id);
        emit();
        persist();
      }, 180);
    }

    function embedAll() {
      const open = state.windows.filter((item) => !item.closing);
      if (open.length === 0) return;
      for (const win of open) win.closing = true;
      emit();
      setTimeout(() => {
        state.windows = state.windows.filter((item) => !item.closing);
        emit();
        persist();
      }, 180);
    }

    function focusWindow(id) {
      const win = state.windows.filter((item) => item.id === id)[0];
      if (!win || win.z === state.zCounter) return;
      win.z = ++state.zCounter;
      emit();
    }

    function setWindowMode(id, mode) {
      const win = state.windows.filter((item) => item.id === id)[0];
      if (!win || WIN_MODES.indexOf(mode) < 0) return;
      win.mode = mode;
      win.rect = winModeRect(win, mode);
      state.winMode = mode;
      state.rect = win.rect;
      emit();
      persist();
    }

    function updateWindowRect(id, rect) {
      const win = state.windows.filter((item) => item.id === id)[0];
      if (!win) return;
      win.rect = rect;
      state.rect = rect;
      state.winMode = win.mode;
      emit();
    }

    function closeGame() {
      embedAll();
      state.view = 'hub';
      state.gameId = null;
      emit();
      persist();
    }

    function backToHub() {
      closeGame();
    }

    function toggleDrawer() {
      state.drawer = !state.drawer;
      emit();
      persist();
    }

    function setSize(w, h) {
      const box = viewport();
      const base = winGeometry({ mode: state.winMode, rect: state.rect }, box);
      const width = typeof w === 'number' && isFinite(w) && w > 0 ? w : base.w;
      const height = typeof h === 'number' && isFinite(h) && h > 0 ? h : base.h;
      if (state.winMode === 'full') state.winMode = 'float';
      state.rect = clampRect({ ...base, w: width, h: height }, box);
      emit();
      persist();
    }

    function resetWindow() {
      const box = viewport();
      const w = Math.min(DEFAULT_RECT.w, box.w - 24);
      const h = Math.min(DEFAULT_RECT.h, box.h - 24);
      state.winMode = 'float';
      state.rect = clampRect({ x: Math.round((box.w - w) / 2), y: 84, w, h }, box);
      emit();
      persist();
    }

    function toggleAvoidComposer() {
      state.avoidComposer = !state.avoidComposer;
      if (state.winMode === 'dock-left' || state.winMode === 'dock-right') {
        const box = viewport();
        const reserve = state.avoidComposer ? 84 : 0;
        state.rect = clampRect({ ...state.rect, h: box.h - 24 - reserve }, box);
      }
      emit();
      persist();
    }

    function resized(start, dx, dy, dir) {
      let x = start.x;
      let y = start.y;
      let w = start.w;
      let h = start.h;
      if (dir.indexOf('e') >= 0) w = start.w + dx;
      if (dir.indexOf('s') >= 0) h = start.h + dy;
      if (dir.indexOf('w') >= 0) {
        x = start.x + dx;
        w = start.w - dx;
      }
      if (dir.indexOf('n') >= 0) {
        y = start.y + dy;
        h = start.h - dy;
      }
      if (w < MIN_W) {
        if (dir.indexOf('w') >= 0) x = start.x + (start.w - MIN_W);
        w = MIN_W;
      }
      if (h < MIN_H) {
        if (dir.indexOf('n') >= 0) y = start.y + (start.h - MIN_H);
        h = MIN_H;
      }
      return { x, y, w, h };
    }

    function useStore() {
      const [, force] = React.useState(0);
      React.useEffect(() => subscribe(() => force((count) => count + 1)), []);
      return state;
    }

    function useViewport() {
      const [box, setBox] = React.useState(viewport);
      React.useEffect(() => {
        const onChange = () => setBox(viewport());
        window.addEventListener('resize', onChange);
        return () => window.removeEventListener('resize', onChange);
      }, []);
      return box;
    }

    // ----------------------------------------------------------------- icons
    function GamepadIcon(props) {
      const size = (props && props.size) || 16;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        h('path', {
          d: 'M7 8.5h10a4.5 4.5 0 0 1 4.5 4.5v.6a3.4 3.4 0 0 1-5.9 2.3l-1.2-1.3h-4.8l-1.2 1.3A3.4 3.4 0 0 1 2.5 13.6V13A4.5 4.5 0 0 1 7 8.5Z',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M7.5 10.8v3M6 12.3h3',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 15.6, cy: 11.6, r: 1.05, fill: 'currentColor' }),
        h('circle', { cx: 17.6, cy: 13.6, r: 1.05, fill: 'currentColor' }),
      );
    }

    function CloseIcon(props) {
      const size = (props && props.size) || 14;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block' },
        },
        h('path', {
          d: 'M4 4l8 8M12 4l-8 8',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }),
      );
    }

    function MoreIcon() {
      return h(
        'svg',
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          fill: 'currentColor',
          'aria-hidden': true,
          style: { display: 'block' },
        },
        h('circle', { cx: 3.5, cy: 8, r: 1.3 }),
        h('circle', { cx: 8, cy: 8, r: 1.3 }),
        h('circle', { cx: 12.5, cy: 8, r: 1.3 }),
      );
    }

    function ChevronIcon(props) {
      const dir = (props && props.dir) || 'left';
      const rotate = dir === 'left' ? 0 : 180;
      return h(
        'svg',
        {
          width: 16,
          height: 16,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', transform: 'rotate(' + rotate + 'deg)' },
        },
        h('path', {
          d: 'M10 3.5 5.5 8l4.5 4.5',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    // ------------------------------------------------------------- components
    function Styles() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } });
    }

    function Aurora() {
      return h('div', { className: 'dsh-games-aurora', 'aria-hidden': true }, h('i'), h('i'), h('i'));
    }

    function BackgroundLayer() {
      const snapshot = useStore();
      const bg = snapshot.background;
      if (!bg) return h(Aurora);
      return h(
        'div',
        { className: 'dsh-games-bg', 'aria-hidden': true },
        bg.kind === 'video'
          ? h('video', {
              className: 'dsh-games-bg-media',
              src: bg.url,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
            })
          : h('img', { className: 'dsh-games-bg-media', src: bg.url, alt: '' }),
        h('div', { className: 'dsh-games-bg-veil' }),
      );
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
        this.retry = this.retry.bind(this);
      }

      static getDerivedStateFromError(error) {
        return { error };
      }

      componentDidCatch(error) {
        console.error('[dsh-games] game crashed', error);
      }

      retry() {
        this.setState({ error: null });
      }

      render() {
        if (this.state.error) {
          return h(
            'div',
            { className: 'dsh-games-crash' },
            h('strong', null, t('crashTitle')),
            h('p', null, t('crashHint')),
            h('button', { className: 'dsh-games-btn', type: 'button', onClick: this.retry }, t('crashRetry')),
          );
        }
        return this.props.children;
      }
    }

    function MenuButton(props) {
      const [open, setOpen] = React.useState(false);
      const ref = React.useRef(null);
      React.useEffect(() => {
        if (!open) return undefined;
        const onDoc = (event) => {
          if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onDoc, true);
        return () => document.removeEventListener('pointerdown', onDoc, true);
      }, [open]);
      return h(
        'div',
        { className: 'dsh-games-menubox', ref: ref },
        h(
          'button',
          {
            className: 'dsh-games-iconbtn',
            type: 'button',
            title: t('more'),
            'aria-label': t('more'),
            'aria-haspopup': 'menu',
            'aria-expanded': open,
            onPointerDown: (event) => event.stopPropagation(),
            onClick: (event) => {
              event.stopPropagation();
              setOpen((value) => !value);
            },
          },
          h(MoreIcon),
        ),
        open
          ? h(
              'div',
              { className: 'dsh-games-menu', role: 'menu' },
              props.items.map((item, index) =>
                item.divider
                  ? h('div', { key: 'divider-' + index, className: 'dsh-games-menudivider' })
                  : h(
                      'button',
                      {
                        key: item.key,
                        type: 'button',
                        role: 'menuitemradio',
                        'aria-checked': item.active ? 'true' : 'false',
                        className: 'dsh-games-menuitem',
                        onClick: (event) => {
                          event.stopPropagation();
                          setOpen(false);
                          item.onClick();
                        },
                      },
                      h('span', null, item.label),
                      item.active ? h('span', { className: 'dsh-games-menuitem-dot' }) : null,
                    ),
              ),
            )
          : null,
      );
    }

    function SizeInput(props) {
      const [text, setText] = React.useState(String(props.value));
      React.useEffect(() => {
        setText(String(props.value));
      }, [props.value]);
      const commit = () => {
        const value = Number(text);
        if (isFinite(value) && value > 0) props.onCommit(value);
        else setText(String(props.value));
      };
      return h('input', {
        type: 'number',
        min: props.min,
        step: 20,
        value: text,
        onChange: (event) => setText(event.target.value),
        onBlur: commit,
        onKeyDown: (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
            event.currentTarget.blur();
          }
        },
      });
    }

    function readSave(gameId, key) {
      try {
        return localStorage.getItem('dsh-games.save.' + gameId + '.' + key);
      } catch (error) {
        return null;
      }
    }

    function writeSave(gameId, key, value) {
      try {
        localStorage.setItem('dsh-games.save.' + gameId + '.' + key, String(value));
      } catch (error) {
        // Storage unavailable: keep playing without persistence.
      }
    }

    function readThemeTokens(element) {
      const styles = getComputedStyle(element);
      const names = [
        '--dsw-alias-bg-base',
        '--dsw-alias-label-primary',
        '--dsw-alias-label-secondary',
        '--dsw-alias-brand-primary',
        '--dsw-alias-state-success-primary',
        '--dsw-alias-state-warn-primary',
        '--dsw-alias-state-error-primary',
        '--dsw-alias-border-l1',
      ];
      const tokens = {};
      for (const name of names) tokens[name] = (styles.getPropertyValue(name) || '').trim();
      return tokens;
    }

    function createHost(definition, container, exit) {
      return {
        apiVersion: 1,
        theme: {
          tokens: readThemeTokens(container),
          subscribe(listener) {
            const wrapped = () => listener(readThemeTokens(container));
            themeListeners.add(wrapped);
            return () => {
              themeListeners.delete(wrapped);
            };
          },
        },
        locale: { t: t, language: 'zh' },
        audio: {
          unlock() {},
          mute() {},
        },
        get size() {
          const rect = container.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            dpr: Math.min(window.devicePixelRatio || 1, 2),
          };
        },
        save: {
          get: (key) => readSave(definition.id, key),
          set: (key, value) => writeSave(definition.id, key, value),
        },
        log: (...args) => console.log('[dsh-games:' + definition.id + ']', ...args),
        exit: () => {
          if (exit) exit();
        },
      };
    }

    // `web` games are ordinary canvas scripts: they get a canvas and a
    // container, and the adapter promotes them to the runtime contract.
    function createWebRuntime(definition, host) {
      let canvas = null;
      let game = null;
      return {
        mount(container) {
          canvas = document.createElement('canvas');
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          container.appendChild(canvas);
          game = definition.createGame(host);
          game.start(canvas, container);
        },
        resize() {
          if (game) game.resize();
        },
        pause() {
          if (game) game.pause();
        },
        resume() {
          if (game) game.resume();
        },
        destroy() {
          if (game) game.destroy();
          if (canvas) canvas.remove();
          canvas = null;
          game = null;
        },
      };
    }

    function GameRuntimeView(props) {
      const containerRef = React.useRef(null);
      const runtimeRef = React.useRef(null);
      const activeRef = React.useRef(props.active !== false);
      const exitRef = React.useRef(props.onExit);
      const [error, setError] = React.useState(null);
      const [nonce, setNonce] = React.useState(0);

      React.useEffect(() => {
        exitRef.current = props.onExit;
      });

      React.useEffect(() => {
        activeRef.current = props.active !== false;
      }, [props.active]);

      React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        let runtime = null;
        let observer = null;
        let raf = 0;
        let visibleHandler = null;
        let disposed = false;
        try {
          const host = createHost(props.definition, container, () => {
            if (exitRef.current) exitRef.current();
          });
          runtime =
            props.definition.adapter === 'web'
              ? createWebRuntime(props.definition, host)
              : props.definition.create(host);
          runtime.mount(container);
          runtimeRef.current = runtime;
          if (!activeRef.current) runtime.pause();
          const applySize = () => {
            if (disposed || !runtime) return;
            const rect = container.getBoundingClientRect();
            if (rect.width < 2 || rect.height < 2) return;
            runtime.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2));
          };
          observer = new ResizeObserver(() => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(applySize);
          });
          observer.observe(container);
          applySize();
          visibleHandler = () => {
            if (!runtime) return;
            if (document.hidden || !activeRef.current) runtime.pause();
            else runtime.resume();
          };
          document.addEventListener('visibilitychange', visibleHandler);
          setError(null);
        } catch (failure) {
          console.error('[dsh-games] runtime failed', failure);
          setError(failure);
        }
        return () => {
          disposed = true;
          if (visibleHandler) document.removeEventListener('visibilitychange', visibleHandler);
          if (observer) observer.disconnect();
          if (raf) cancelAnimationFrame(raf);
          runtimeRef.current = null;
          if (runtime) {
            try {
              runtime.destroy();
            } catch (failure) {
              console.error('[dsh-games] runtime cleanup failed', failure);
            }
          }
        };
      }, [props.definition, nonce]);

      React.useEffect(() => {
        const runtime = runtimeRef.current;
        if (!runtime) return;
        if (props.active === false) runtime.pause();
        else if (!document.hidden) runtime.resume();
      }, [props.active]);

      return h(
        'div',
        { className: 'dsh-games-runtime' },
        h('div', { className: 'dsh-games-runtime-host', ref: containerRef, key: nonce }),
        error
          ? h(
              'div',
              { className: 'dsh-games-runtime-error' },
              h('strong', null, t('crashTitle')),
              h('p', null, t('crashHint')),
              h(
                'button',
                { className: 'dsh-games-btn', type: 'button', onClick: () => setNonce((value) => value + 1) },
                t('crashRetry'),
              ),
            )
          : null,
      );
    }

    function Drawer() {
      const snapshot = useStore();
      return h(
        'aside',
        { className: 'dsh-games-drawer', 'aria-label': t('gamesList') },
        h('div', { className: 'dsh-games-drawerhead' }, t('gamesList')),
        h(
          'div',
          { className: 'dsh-games-drawerlist' },
          GAMES.map((game) =>
            h(
              'button',
              {
                key: game.id,
                type: 'button',
                className: 'dsh-games-draweritem' + (snapshot.gameId === game.id ? ' is-active' : ''),
                onClick: () => selectGame(game.id),
              },
              h('span', { className: 'dsh-games-draweritem-icon' }, h(GamepadIcon, { size: 15 })),
              h('span', null, h('b', null, t(game.titleKey)), h('small', null, t(game.tagKey))),
            ),
          ),
        ),
        h('div', { className: 'dsh-games-drawer-empty' }, t('moreGames')),
      );
    }

    function StageView() {
      const snapshot = useStore();
      const game = gameById(snapshot.gameId);
      const count = snapshot.windows.length;
      const menuItems = [
        { key: 'float', label: t('menuFloat'), onClick: () => openWindow(snapshot.gameId, 'float') },
        { key: 'detach', label: t('menuDetach'), onClick: openDetached },
        { key: 'embed', label: t('menuEmbed'), onClick: embedAll },
        { key: 'divider', divider: true },
        { key: 'close', label: t('menuClose'), onClick: closeGame },
      ];
      return h(
        'div',
        { className: 'dsh-games-stagewrap', 'data-drawer': snapshot.drawer ? 'open' : 'closed' },
        h(Drawer),
        h(
          'section',
          { className: 'dsh-games-stage', 'aria-label': t(game.titleKey) },
          h(
            'header',
            {
              className: 'dsh-games-stagehead',
              onDoubleClick: (event) => {
                if (event.target.closest('button')) return;
                openWindow(snapshot.gameId, snapshot.windows.length ? 'float' : 'dock-right');
              },
            },
            h(
              'button',
              {
                className: 'dsh-games-iconbtn',
                type: 'button',
                title: t('drawerToggle'),
                'aria-label': t('drawerToggle'),
                'aria-pressed': snapshot.drawer,
                onClick: toggleDrawer,
              },
              h(ChevronIcon, { dir: snapshot.drawer ? 'left' : 'right' }),
            ),
            h('span', { className: 'dsh-games-stagetitle' }, t(game.titleKey)),
            h(
              'span',
              { className: 'dsh-games-stagetag' },
              count > 0 ? count + ' ' + t('windowsRunning') : t('embedded'),
            ),
            h('span', { className: 'dsh-games-grow' }),
            h(
              'button',
              {
                className: 'dsh-games-btn dsh-games-btn--soft',
                type: 'button',
                onClick: () => openWindow(snapshot.gameId, snapshot.windows.length ? 'float' : 'dock-right'),
              },
              t('floatIt'),
            ),
            h(MenuButton, { items: menuItems }),
            h(
              'button',
              { className: 'dsh-games-iconbtn', type: 'button', title: t('close'), 'aria-label': t('close'), onClick: closeGame },
              h(CloseIcon),
            ),
          ),
          h(
            'div',
            { className: 'dsh-games-stagebody' },
            h(
              'div',
              { className: 'dsh-games-swap', key: snapshot.gameId || 'embedded' },
              h(
                'div',
                { className: 'dsh-games-embed', hidden: count > 0 },
                h(Boundary, null, h(GameRuntimeView, { definition: game, active: count === 0, onExit: backToHub })),
              ),
              count > 0
                ? h(
                    'div',
                    { className: 'dsh-games-placeholder' },
                    h('div', { className: 'dsh-games-placeholder-badge' }, h(GamepadIcon, { size: 22 })),
                    h('strong', null, count + ' ' + t('windowsRunning')),
                    h('p', null, t('floatingHint')),
                    h('button', { className: 'dsh-games-btn', type: 'button', onClick: embedAll }, t('bringBack')),
                  )
                : null,
            ),
          ),
        ),
      );
    }

    function WindowSettings() {
      const snapshot = useStore();
      const box = useViewport();
      const rect = winGeometry({ mode: snapshot.winMode, rect: snapshot.rect }, box);
      return h(
        'section',
        { className: 'dsh-games-panel' },
        h(
          'div',
          { className: 'dsh-games-panelhead' },
          h('h2', null, t('windowSection')),
          h(
            'div',
            { className: 'dsh-games-modes' },
            WIN_MODES.map((mode) =>
              h(
                'button',
                {
                  key: mode,
                  type: 'button',
                  className: 'dsh-games-pill',
                  'aria-pressed': snapshot.winMode === mode,
                  onClick: () => setWinMode(mode),
                },
                t(WIN_MODE_KEYS[mode]),
              ),
            ),
            h(
              'button',
              { className: 'dsh-games-btn dsh-games-btn--ghost', type: 'button', onClick: resetWindow },
              t('reset'),
            ),
          ),
        ),
        h(
          'div',
          { className: 'dsh-games-size' },
          h('label', null, t('width'), h(SizeInput, { min: MIN_W, value: rect.w, onCommit: (v) => setSize(v, rect.h) })),
          h('label', null, t('height'), h(SizeInput, { min: MIN_H, value: rect.h, onCommit: (v) => setSize(rect.w, v) })),
          h(
            'label',
            { className: 'dsh-games-check' },
            h('input', { type: 'checkbox', checked: snapshot.avoidComposer, onChange: toggleAvoidComposer }),
            t('avoidComposer'),
          ),
          h('span', { className: 'dsh-games-note' }, t(WIN_MODE_KEYS[snapshot.winMode]) + ' · ' + rect.w + ' × ' + rect.h),
        ),
      );
    }

    function Notice() {
      const snapshot = useStore();
      if (!snapshot.notice) return null;
      return h('div', { className: 'dsh-games-notice', role: 'status' }, snapshot.notice.text);
    }

    function AppearancePanel() {
      const snapshot = useStore();
      const inputRef = React.useRef(null);
      return h(
        'section',
        { className: 'dsh-games-panel' },
        h(
          'div',
          { className: 'dsh-games-panelhead' },
          h('h2', null, t('background')),
          h('span', { className: 'dsh-games-note' }, snapshot.background ? snapshot.background.name : t('bgNone')),
        ),
        h(
          'div',
          { className: 'dsh-games-size' },
          h('input', {
            ref: inputRef,
            type: 'file',
            accept: 'image/*,video/*',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.target.files && event.target.files[0];
              if (file) applyBackground(file);
              event.target.value = '';
            },
          }),
          h(
            'button',
            { className: 'dsh-games-btn', type: 'button', onClick: () => inputRef.current && inputRef.current.click() },
            t('bgChoose'),
          ),
          snapshot.background
            ? h('button', { className: 'dsh-games-btn dsh-games-btn--ghost', type: 'button', onClick: clearBackground }, t('bgReset'))
            : null,
          h('span', { className: 'dsh-games-note' }, t('bgHint')),
        ),
      );
    }

    function GamesPage() {
      const snapshot = useStore();
      const game = gameById(snapshot.gameId);
      return h(
        'div',
        { className: 'dsh-games-page' + (snapshot.view === 'game' ? ' dsh-games-page--game' : '') },
        h(Styles),
        h(BackgroundLayer),
        h(
          'div',
          { className: 'dsh-games-wrap' },
          h(
            'header',
            { className: 'dsh-games-head' },
            h(
              'div',
              null,
              h('h1', { className: 'dsh-games-title' }, t('title')),
              h('p', { className: 'dsh-games-sub' }, t('subtitle')),
            ),
            h(
              'div',
              { className: 'dsh-games-actions' },
              snapshot.view === 'game'
                ? h('button', { className: 'dsh-games-btn dsh-games-btn--ghost', type: 'button', onClick: backToHub }, t('back'))
                : null,
              h(
                'button',
                {
                  className: 'dsh-games-btn dsh-games-btn--primary',
                  type: 'button',
                  onClick: () =>
                    snapshot.view !== 'game'
                      ? selectGame(game.id)
                      : openWindow(snapshot.gameId, snapshot.windows.length ? 'float' : 'dock-right'),
                },
                snapshot.view !== 'game' ? t('openDemo') : t('newWindow'),
              ),
            ),
          ),
          h(Notice),
          snapshot.view === 'game'
            ? h(StageView)
            : h(
                React.Fragment,
                null,
                h(
                  'section',
                  { className: 'dsh-games-grid' },
                  GAMES.map((item) =>
                    h(
                      'article',
                      { className: 'dsh-games-card', key: item.id },
                      h('div', { className: 'dsh-games-thumb' }, h(GamepadIcon, { size: 32 })),
                      h('h3', { className: 'dsh-games-cardtitle' }, t(item.titleKey)),
                      h('p', { className: 'dsh-games-carddesc' }, t(item.descKey)),
                      h(
                        'div',
                        { className: 'dsh-games-cardrow' },
                        h(
                          'button',
                          {
                            className: 'dsh-games-btn dsh-games-btn--primary',
                            type: 'button',
                            onClick: () => selectGame(item.id),
                          },
                          t('openEmbedded'),
                        ),
                        h(
                          'button',
                          {
                            className: 'dsh-games-btn',
                            type: 'button',
                            onClick: () => openWindow(item.id, 'dock-right'),
                          },
                          t('openFloating'),
                        ),
                      ),
                    ),
                  ),
                  h(
                    'article',
                    { className: 'dsh-games-card dsh-games-card--empty' },
                    h('h3', { className: 'dsh-games-cardtitle' }, t('comingSoon')),
                    h('p', { className: 'dsh-games-carddesc' }, t('adapterDesc')),
                  ),
                  h(
                    'article',
                    { className: 'dsh-games-card dsh-games-card--empty' },
                    h('h3', { className: 'dsh-games-cardtitle' }, t('adapterFlash')),
                    h('p', { className: 'dsh-games-carddesc' }, t('adapterFlashDesc')),
                  ),
                ),
                h(WindowSettings),
                h(AppearancePanel),
                h(
                  'section',
                  { className: 'dsh-games-adapters' },
                  h('h2', null, t('adaptersTitle')),
                  h(
                    'div',
                    { className: 'dsh-games-adapterlist' },
                    [
                      ['adapterNative', 'adapterNativeDesc'],
                      ['adapterHtml5', 'adapterHtml5Desc'],
                      ['adapterFlash', 'adapterFlashDesc'],
                    ].map((pair) =>
                      h(
                        'div',
                        { className: 'dsh-games-adapter', key: pair[0] },
                        h('b', null, t(pair[0])),
                        h('span', null, t(pair[1])),
                      ),
                    ),
                  ),
                ),
              ),
        ),
      );
    }

    function FloatingWindow(props) {
      const win = props.win;
      const box = props.box;
      const game = gameById(win.gameId);
      const rect = winGeometry(win, box);

      const begin = (event, dir) => {
        if (win.closing) return;
        if (event.button !== 0) return;
        if (!dir && event.target.closest && event.target.closest('button')) return;
        event.preventDefault();
        event.stopPropagation();
        focusWindow(win.id);
        const base = winGeometry(win, viewport());
        if (!dir && win.mode !== 'float') {
          win.mode = 'float';
          win.rect = base;
          emit();
        }
        const startX = event.clientX;
        const startY = event.clientY;
        const startRect = base;
        const move = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          const next = dir
            ? resized(startRect, dx, dy, dir)
            : { x: startRect.x + dx, y: startRect.y + dy, w: startRect.w, h: startRect.h };
          updateWindowRect(win.id, clampRect(next, viewport()));
        };
        const end = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', end);
          window.removeEventListener('pointercancel', end);
          persist();
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
      };

      const menuItems = [
        { key: 'float', label: t('menuFloat'), onClick: () => setWindowMode(win.id, 'float'), active: win.mode === 'float' },
        { key: 'left', label: t('menuLeft'), onClick: () => setWindowMode(win.id, 'dock-left'), active: win.mode === 'dock-left' },
        { key: 'right', label: t('menuRight'), onClick: () => setWindowMode(win.id, 'dock-right'), active: win.mode === 'dock-right' },
        { key: 'full', label: t('menuFull'), onClick: () => setWindowMode(win.id, 'full'), active: win.mode === 'full' },
        { key: 'divider', divider: true },
        { key: 'close', label: t('closeWindow'), onClick: () => closeWindow(win.id) },
      ];

      return h(
        'section',
        {
          className: 'dsh-games-win' + (win.closing ? ' is-closing' : ''),
          role: 'dialog',
          'aria-modal': 'false',
          'aria-label': t(game.titleKey),
          tabIndex: -1,
          style: {
            left: rect.x + 'px',
            top: rect.y + 'px',
            width: rect.w + 'px',
            height: rect.h + 'px',
            zIndex: 40 + win.z,
          },
          onPointerDownCapture: () => {
            if (!win.closing) focusWindow(win.id);
          },
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeWindow(win.id);
            }
          },
        },
        h(Styles),
        h(
          'header',
          {
            className: 'dsh-games-winbar',
            onPointerDown: (event) => begin(event, ''),
            onDoubleClick: (event) => {
              if (event.target.closest('button')) return;
              embedAll();
            },
          },
          h('span', { className: 'dsh-games-windot', 'aria-hidden': true }),
          h('span', { className: 'dsh-games-wintitle' }, t(game.titleKey)),
          h('span', { className: 'dsh-games-wintag' }, t('running')),
          h('span', { className: 'dsh-games-grow' }),
          h('button', { className: 'dsh-games-pill', type: 'button', onClick: embedAll, title: t('embed') }, t('embed')),
          h(MenuButton, { items: menuItems }),
          h(
            'button',
            {
              className: 'dsh-games-iconbtn',
              type: 'button',
              title: t('close'),
              'aria-label': t('close'),
              onClick: () => closeWindow(win.id),
            },
            h(CloseIcon),
          ),
        ),
        h('div', { className: 'dsh-games-winbody' }, h(Boundary, null, h(GameRuntimeView, { definition: game, onExit: () => closeWindow(win.id) }))),
        h(
          'footer',
          { className: 'dsh-games-foot' },
          h('span', null, t(WIN_MODE_KEYS[win.mode])),
          h('span', null, '·'),
          h('span', null, rect.w + ' × ' + rect.h),
          h('span', { className: 'dsh-games-grow' }),
          h('span', { className: 'dsh-games-hint' }, t('hintDrag')),
        ),
        HANDLES.map((dir) =>
          h('div', {
            key: dir,
            className: 'dsh-games-handle',
            'data-dir': dir,
            onPointerDown: (event) => begin(event, dir),
          }),
        ),
      );
    }

    function WindowsLayer() {
      const snapshot = useStore();
      const box = useViewport();
      if (snapshot.windows.length === 0) return null;
      return h(
        React.Fragment,
        null,
        snapshot.windows.map((win) => h(FloatingWindow, { key: win.id, win: win, box: box })),
      );
    }

    // ------------------------------------------------------------------ wire
    function detectDesktopWindows(ctx) {
      try {
        if (!ctx || typeof ctx.get !== 'function') return;
        const service = ctx.get('desktopWindows');
        if (service && typeof service.openPanel === 'function') desktopWindows = service;
      } catch (error) {
        desktopWindows = null;
      }
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-games: dictionaries');
      ctx.effect(
        () =>
          ctx.on('theme/change', () => {
            for (const listener of themeListeners) {
              try {
                listener();
              } catch (failure) {
                console.error('[dsh-games] theme listener failed', failure);
              }
            }
          }),
        'dsh-games: theme',
      );
      translate = ctx.locale.bind(NS);
      restore();
      detectDesktopWindows(ctx);
      readBackgroundRecord()
        .then((record) => {
          if (record) setBackgroundRecord(record);
        })
        .catch(() => {
          // No stored background: keep the aurora.
        });

      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'games' }, GamesPage));
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'games', order: 30, label: () => t('nav') },
          (owner) => h(GamepadIcon, { size: (owner && owner.size) || 16 }),
        ),
      );
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register({ name: 'shell.overlay', id: 'dsh-games-windows' }, WindowsLayer),
      );
    }

    const CSS = `
.dsh-games-page{position:relative;box-sizing:border-box;min-height:100%;overflow-y:auto;padding:28px 32px 64px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;-webkit-app-region:no-drag}
.dsh-games-page *,.dsh-games-win *{box-sizing:border-box}
.dsh-games-aurora{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.dsh-games-aurora i{position:absolute;display:block;border-radius:50%;filter:blur(64px);opacity:.5;animation:dsh-games-drift 18s ease-in-out infinite alternate}
.dsh-games-aurora i:nth-child(1){width:46%;height:38%;left:-6%;top:-8%;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 26%,transparent)}
.dsh-games-aurora i:nth-child(2){width:40%;height:34%;right:-4%;top:4%;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);animation-delay:-6s}
.dsh-games-aurora i:nth-child(3){width:52%;height:40%;left:24%;bottom:-14%;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 20%,transparent);animation-delay:-11s}
.dsh-games-wrap{position:relative;z-index:1;max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
.dsh-games-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.dsh-games-title{margin:0 0 6px;font-size:24px;font-weight:650;letter-spacing:.01em}
.dsh-games-sub{margin:0;font-size:13px;line-height:1.7;color:var(--dsw-alias-label-secondary);max-width:640px}
.dsh-games-actions{display:flex;align-items:center;gap:10px;flex:none;padding-top:2px}
.dsh-games-grow{flex:1}
.dsh-games-notice{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 40%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:1.5;animation:dsh-games-rise .2s ease}
.dsh-games-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:34px;padding:0 14px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1;cursor:pointer;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.08);transition:transform .14s ease,box-shadow .14s ease,background .14s ease}
.dsh-games-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.14);background:var(--dsw-alias-bg-layer-2)}
.dsh-games-btn:active{transform:translateY(0) scale(.99)}
.dsh-games-btn--primary{background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 86%,#fff),var(--dsw-alias-brand-primary));border-color:transparent;color:var(--dsw-alias-bg-base);box-shadow:0 6px 20px color-mix(in srgb,var(--dsw-alias-brand-primary) 36%,transparent)}
.dsh-games-btn--primary:hover{background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 80%,#fff),var(--dsw-alias-brand-primary));box-shadow:0 10px 26px color-mix(in srgb,var(--dsw-alias-brand-primary) 44%,transparent)}
.dsh-games-btn--soft{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,var(--dsw-alias-bg-layer-1));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 26%,var(--dsw-alias-border-l1))}
.dsh-games-btn--ghost{background:transparent;border-color:transparent;box-shadow:none;color:var(--dsw-alias-label-secondary);padding:0 8px}
.dsh-games-btn--ghost:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:none;transform:none}
.dsh-games-pill{height:26px;padding:0 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1;cursor:pointer;white-space:nowrap;transition:background .14s ease,color .14s ease,border-color .14s ease}
.dsh-games-pill:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-games-pill[aria-pressed="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-primary)}
.dsh-games-iconbtn{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;transition:background .14s ease,color .14s ease}
.dsh-games-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-games-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.dsh-games-card{position:relative;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:212px;box-shadow:0 1px 2px rgba(0,0,0,.06);transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;animation:dsh-games-rise .32s both}
.dsh-games-card:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(0,0,0,.14);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 30%,var(--dsw-alias-border-l1))}
.dsh-games-card--empty{border-style:dashed;justify-content:center;color:var(--dsw-alias-label-secondary)}
.dsh-games-card--empty:hover{transform:none;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.dsh-games-card--empty .dsh-games-cardtitle{color:var(--dsw-alias-label-secondary)}
.dsh-games-thumb{height:84px;border-radius:11px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,var(--dsw-alias-bg-layer-2)),color-mix(in srgb,var(--dsw-alias-state-warn-primary) 20%,var(--dsw-alias-bg-layer-2)));display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-primary);box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
.dsh-games-cardtitle{margin:0;font-size:14px;font-weight:600}
.dsh-games-carddesc{margin:0;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.dsh-games-cardrow{display:flex;gap:8px;margin-top:auto;flex-wrap:wrap}
.dsh-games-panel{border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);padding:14px 16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.dsh-games-panelhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dsh-games-panelhead h2{margin:0;font-size:14px;font-weight:600}
.dsh-games-modes{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dsh-games-size{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsh-games-size label{display:inline-flex;align-items:center;gap:6px}
.dsh-games-size input[type="number"]{width:74px;height:28px;padding:0 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
.dsh-games-check{cursor:pointer}
.dsh-games-note{margin-left:auto;white-space:nowrap}
.dsh-games-adapters{border-top:1px solid var(--dsw-alias-border-l1);padding-top:18px;display:flex;flex-direction:column;gap:12px}
.dsh-games-adapters h2{margin:0;font-size:14px;font-weight:600}
.dsh-games-adapterlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.dsh-games-adapter{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:12px 14px;background:var(--dsw-alias-bg-layer-1)}
.dsh-games-adapter b{display:block;font-size:13px;margin-bottom:4px}
.dsh-games-adapter span{display:block;font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary)}

.dsh-games-stagewrap{display:flex;gap:14px;align-items:stretch;min-height:480px}
.dsh-games-drawer{width:210px;flex:none;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 82%,transparent);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.10);padding:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden;transition:width .2s ease,padding .2s ease,opacity .2s ease}
.dsh-games-stagewrap[data-drawer="closed"] .dsh-games-drawer{width:0;padding:0;border-width:0;opacity:0}
.dsh-games-drawerhead{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dsw-alias-label-secondary);padding:2px 4px 6px;white-space:nowrap}
.dsh-games-drawerlist{display:flex;flex-direction:column;gap:4px;overflow:auto}
.dsh-games-draweritem{display:flex;align-items:center;gap:8px;width:100%;padding:7px;border-radius:10px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;font:inherit;transition:background .14s ease,border-color .14s ease}
.dsh-games-draweritem:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-games-draweritem.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 28%,transparent)}
.dsh-games-draweritem-icon{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-state-success-primary) 30%,var(--dsw-alias-bg-layer-2)),color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,var(--dsw-alias-bg-layer-2)));color:var(--dsw-alias-label-primary);flex:none}
.dsh-games-draweritem b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-games-draweritem small{display:block;font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.dsh-games-drawer-empty{margin-top:auto;padding:10px;border:1px dashed var(--dsw-alias-border-l1);border-radius:10px;font-size:11px;color:var(--dsw-alias-label-secondary);text-align:center}
.dsh-games-stage{flex:1;min-width:0;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);box-shadow:0 10px 30px rgba(0,0,0,.10);overflow:hidden}
.dsh-games-stagehead{display:flex;align-items:center;gap:8px;height:48px;flex:none;padding:0 8px 0 10px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1))}
.dsh-games-stagetitle{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-games-stagetag{font-size:10px;padding:2px 7px;border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary);white-space:nowrap}
.dsh-games-stagebody{position:relative;flex:1;min-height:380px;background:var(--dsw-alias-bg-base)}
.dsh-games-runtime{position:absolute;inset:0;overflow:hidden;background:var(--dsw-alias-bg-base)}
.dsh-games-runtime-host{position:absolute;inset:0;outline:none;touch-action:none}
.dsh-games-runtime-host canvas{display:block}
.dsh-games-runtime-error{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent)}
.dsh-games-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;color:var(--dsw-alias-label-secondary);background:radial-gradient(60% 60% at 50% 38%,color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent),transparent 72%)}
.dsh-games-placeholder strong{font-size:14px;color:var(--dsw-alias-label-primary)}
.dsh-games-placeholder p{margin:0;font-size:12px;line-height:1.6;max-width:360px}
.dsh-games-placeholder-badge{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,var(--dsw-alias-bg-layer-2));border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 24%,var(--dsw-alias-border-l1));box-shadow:0 10px 26px rgba(0,0,0,.18)}
.dsh-games-crash{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;color:var(--dsw-alias-label-secondary)}
.dsh-games-crash strong{color:var(--dsw-alias-state-error-primary);font-size:14px}
.dsh-games-crash p{margin:0;font-size:12px;max-width:320px;line-height:1.6}

.dsh-games-win{position:fixed;z-index:40;display:flex;flex-direction:column;min-width:320px;min-height:240px;border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 94%,transparent);backdrop-filter:blur(18px);border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,var(--dsw-alias-border-l2));box-shadow:0 24px 80px rgba(0,0,0,.32),0 2px 8px rgba(0,0,0,.18);overflow:hidden;pointer-events:auto;outline:none;animation:dsh-games-slide .24s cubic-bezier(.22,.61,.36,1);-webkit-app-region:no-drag}
.dsh-games-winbar{display:flex;align-items:center;gap:6px;height:46px;flex:none;padding:0 8px 0 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 9%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1));cursor:grab;user-select:none;touch-action:none}
.dsh-games-winbar:active{cursor:grabbing}
.dsh-games-windot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-brand-primary);flex:none;box-shadow:0 0 0 4px color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent)}
.dsh-games-wintitle{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38%}
.dsh-games-wintag{font-size:10px;padding:2px 6px;border-radius:5px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 16%,transparent);color:var(--dsw-alias-state-success-primary);white-space:nowrap}
.dsh-games-winbody{position:relative;flex:1;min-height:0;background:var(--dsw-alias-bg-base)}
.dsh-games-foot{display:flex;align-items:center;gap:8px;height:30px;flex:none;padding:0 12px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden}
.dsh-games-hint{overflow:hidden;text-overflow:ellipsis;min-width:0}
.dsh-games-handle{position:absolute;z-index:3;touch-action:none}
.dsh-games-handle[data-dir="n"]{top:0;left:10px;right:10px;height:6px;cursor:ns-resize}
.dsh-games-handle[data-dir="s"]{bottom:0;left:10px;right:10px;height:6px;cursor:ns-resize}
.dsh-games-handle[data-dir="e"]{right:0;top:10px;bottom:10px;width:6px;cursor:ew-resize}
.dsh-games-handle[data-dir="w"]{left:0;top:10px;bottom:10px;width:6px;cursor:ew-resize}
.dsh-games-handle[data-dir="ne"]{right:0;top:0;width:14px;height:14px;cursor:nesw-resize}
.dsh-games-handle[data-dir="nw"]{left:0;top:0;width:14px;height:14px;cursor:nwse-resize}
.dsh-games-handle[data-dir="se"]{right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize}
.dsh-games-handle[data-dir="sw"]{left:0;bottom:0;width:14px;height:14px;cursor:nesw-resize}

.dsh-games-menubox{position:relative;display:inline-flex}
.dsh-games-menu{position:absolute;top:34px;right:0;min-width:176px;padding:6px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);box-shadow:0 12px 32px rgba(0,0,0,.22);z-index:6;display:flex;flex-direction:column;gap:2px;animation:dsh-games-rise .14s ease}
.dsh-games-menuitem{display:flex;align-items:center;justify-content:space-between;gap:12px;height:32px;padding:0 10px;border-radius:8px;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;cursor:pointer;text-align:left;white-space:nowrap}
.dsh-games-menuitem:hover{background:var(--dsw-alias-bg-layer-2)}
.dsh-games-menuitem[aria-checked="true"]{color:var(--dsw-alias-brand-primary)}
.dsh-games-menuitem-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary)}
.dsh-games-menudivider{height:1px;margin:4px 6px;background:var(--dsw-alias-border-l1)}

.dsh-games-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.dsh-games-bg-media{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(1.08);transform:scale(1.02)}
.dsh-games-bg-veil{position:absolute;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-base) 56%,transparent)}
.dsh-games-swap{position:absolute;inset:0;animation:dsh-games-fade .22s ease}
.dsh-games-embed{position:absolute;inset:0}
.dsh-games-embed[hidden]{display:none}
.dsh-games-page--game{padding:16px 20px 20px}
.dsh-games-page--game .dsh-games-wrap{max-width:none;gap:10px}
.dsh-games-page--game .dsh-games-head{align-items:center}
.dsh-games-page--game .dsh-games-title{font-size:18px;margin:0}
.dsh-games-page--game .dsh-games-sub{display:none}
.dsh-games-page--game .dsh-games-stagewrap{height:calc(100vh - 96px);min-height:420px;animation:dsh-games-enter-right .3s cubic-bezier(.22,.61,.36,1)}
.dsh-games-page--game .dsh-games-drawer{width:232px}
.dsh-games-win.is-closing{animation:dsh-games-out .18s ease forwards;pointer-events:none}


.g2048{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:16px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);overflow:hidden}
.g2048-top{width:100%;max-width:520px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
.g2048-title{font-size:22px;font-weight:700;letter-spacing:.02em}
.g2048-scores{display:flex;gap:8px}
.g2048-score{min-width:62px;padding:5px 9px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);display:flex;flex-direction:column;align-items:center;gap:2px}
.g2048-score span{font-size:10px;color:var(--dsw-alias-label-secondary)}
.g2048-score b{font-size:15px;font-variant-numeric:tabular-nums}
.g2048-board{position:relative;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:8px;padding:8px;border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 16%,var(--dsw-alias-bg-layer-1));box-shadow:0 10px 30px rgba(0,0,0,.12);touch-action:none}
.g2048-cell{display:flex;align-items:center;justify-content:center;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 8%,transparent);font-weight:700;font-size:clamp(14px,4vmin,30px);color:#4a4038;transition:background .12s ease}
.g2048-cell.is-pop{animation:g2048-pop .16s ease}
.g2048-cell.v2{background:#eee4da}
.g2048-cell.v4{background:#ede0c8}
.g2048-cell.v8{background:#f2b179;color:#fff}
.g2048-cell.v16{background:#f59563;color:#fff}
.g2048-cell.v32{background:#f67c5f;color:#fff}
.g2048-cell.v64{background:#f65e3b;color:#fff}
.g2048-cell.v128{background:#edcf72;color:#fff}
.g2048-cell.v256{background:#edcc61;color:#fff}
.g2048-cell.v512{background:#edc850;color:#fff}
.g2048-cell.v1024{background:#edc53f;color:#fff}
.g2048-cell.v2048{background:#edc22e;color:#fff}
.g2048-cell.v4096{background:#3c3a32;color:#fff}
.g2048-foot{width:100%;max-width:520px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.g2048-foot button{height:28px;padding:0 10px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}
.g2048-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 72%,transparent);z-index:2}
.g2048-overlay[hidden]{display:none}
.g2048-overlay strong{font-size:20px}
.g2048-overlay span{font-size:12px;color:var(--dsw-alias-label-secondary)}
.pong-game{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-base);overflow:hidden}
.pong-game canvas{display:block;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);background:#0b0d10;touch-action:none}
.invaders-game{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-base);overflow:hidden}
.invaders-game canvas{display:block;background:#000;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35)}
.sokoban-game{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--dsw-alias-bg-base);overflow:hidden}
.sokoban-frame{position:relative;display:block}
.sokoban-frame canvas{display:block;width:100%;height:100%;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.35);background:#ded7b3}
.sokoban-restart{position:absolute;top:10px;right:10px;height:28px;padding:0 10px;border-radius:7px;border:1px solid rgba(0,0,0,.2);background:rgba(255,255,255,.82);color:#2a2a2a;font:inherit;font-size:12px;cursor:pointer}
.sokoban-restart:hover{background:#fff}

@keyframes dsh-games-enter-right{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:none}}
@keyframes dsh-games-fade{from{opacity:0}to{opacity:1}}
@keyframes dsh-games-out{to{opacity:0;transform:translateX(18px) scale(.97)}}
@keyframes g2048-pop{0%{transform:scale(.86)}100%{transform:scale(1)}}
@keyframes dsh-games-drift{0%{transform:translate3d(-2%,-1%,0) scale(1)}100%{transform:translate3d(2%,1.5%,0) scale(1.08)}}
@keyframes dsh-games-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes dsh-games-slide{from{opacity:0;transform:translateX(28px) scale(.985)}to{opacity:1;transform:none}}

@media (max-width:760px){.dsh-games-page{padding:20px 16px 48px}.dsh-games-drawer{display:none}.dsh-games-stagebody{min-height:320px}.dsh-games-page--game{padding:12px 12px 12px}.dsh-games-page--game .dsh-games-stagewrap{height:calc(100vh - 84px)}}
@media (prefers-reduced-motion:reduce){.dsh-games-aurora i,.dsh-games-win,.dsh-games-win.is-closing,.dsh-games-swap,.dsh-games-card,.dsh-games-menu,.dsh-games-btn,.dsh-games-pill,.dsh-games-draweritem,.dsh-games-page--game .dsh-games-stagewrap{animation:none!important;transition:none!important}}
`;

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
