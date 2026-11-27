/**
 * Client half of @local/dsh-memo.
 *
 * 两处渲染：
 *   1. `conversation.session.header.utilities` —— 右上角工具行的小图标（小红点提示有未完成项）；
 *   2. `shell.overlay` —— 会话右侧的悬浮备忘面板：可拖动、可调整大小、可折叠，
 *      需求列表单独滚动，“添加 / 编辑需求”从底部抽屉滑出。
 *
 * 数据来自 Host 的同源接口 `/dsh-memo/api`，面板轮询保持与 AI 写入同步。
 * 所有文案走 Client locale 服务，找不到字典时退回内置中英文文本。
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-memo',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-memo';
    const API = 'dsh-memo/api';
    const OPEN_KEY = 'dsh-memo.open';
    const GEOMETRY_KEY = 'dsh-memo.geometry';
    const SESSION_KEY = 'dsh-memo.session';
    const SEEN_KEY = 'dsh-memo.seen';
    const POLL_MS = 4000;

    const EDGE = 12;
    const MIN_WIDTH = 260;
    const MIN_HEIGHT = 240;
    const MAX_WIDTH = 640;
    const DEFAULT_WIDTH = 300;
    const DEFAULT_HEIGHT = 420;

    // ---------------------------------------------------------------- 文案
    const zh = {
      'toggle.label': '备忘 / 需求列表',
      'toggle.title': '备忘 / 需求列表：{n} 条进行中',
      'toggle.emptyTitle': '备忘 / 需求列表（空）',
      'toggle.unread': '有新内容',
      'panel.title': '备忘 · 需求',
      'panel.subtitle': '进行中 {open} · AI 挂起 {ai}',
      'panel.subtitlePlain': '进行中 {open}',
      'panel.subtitleEmpty': '把想做、暂时不做的记在这里',
      'panel.subtitleDone': '全部完成',
      'panel.add': '添加需求',
      'panel.collapse': '收起面板',
      'panel.settings': '插件设置',
      'panel.dragHint': '拖动标题栏移动，双击复位',
      'panel.footDone': '{n} 条已完成',
      'panel.clearDone': '清除',
      'panel.loading': '正在读取…',
      'panel.empty': '还没有需求。\n把想做的、以后再做的东西记下来；AI 也会把对话里暂时搁置的需求挂到这里。',
      'panel.noSession': '打开一个会话后就有独立的一份备忘列表。',
      'panel.error': '读取失败：{message}',
      'panel.retry': '重试',
      'item.toggleDone': '标记完成',
      'item.toggleOpen': '标记未完成',
      'item.edit': '编辑',
      'item.delete': '删除',
      'item.editHint': '点击编辑需求名与详情',
      'item.ai': 'AI',
      'item.aiHint': 'AI 从对话里挂起的需求',
      'drawer.add': '添加需求',
      'drawer.edit': '编辑需求',
      'drawer.close': '关闭',
      'drawer.submit': '添加',
      'drawer.hint': 'Enter 添加 · Shift+Enter 换行',
      'editor.save': '保存',
      'editor.cancel': '取消',
      'field.title': '需求名…',
      'field.detail': '详细信息（可选）：要做什么、边界、验收标准…',
      'time.just': '刚刚',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'settings.title': '备忘设置',
      'settings.texts': '文本文案',
      'settings.background': '弹窗背景',
      'settings.search': '搜索文案…',
      'settings.reset': '恢复默认',
      'settings.resetAll': '全部恢复默认',
      'settings.save': '保存',
      'settings.saving': '保存中…',
      'settings.mode.theme': '跟随主题',
      'settings.mode.color': '纯色',
      'settings.mode.gradient': '渐变',
      'settings.appearance': '外观',
      'settings.mode.image': '图片',
      'settings.color': '颜色',
      'settings.opacity': '不透明度',
      'settings.from': '起始色',
      'settings.to': '结束色',
      'settings.angle': '角度',
      'settings.shade': '遮罩强度',
      'settings.group.background': '弹窗背景',
      'settings.group.font': '文字大小',
      'settings.group.language': '界面语言',
      'settings.backgroundHint': '只作用于备忘面板',
      'settings.fontSize': '字号',
      'settings.fontHint': '同时作用于面板与设置窗',
      'settings.fontSample': '示例：记下一条以后要做的需求',
      'settings.language': '语言',
      'settings.lang.auto': '跟随系统',
      'settings.lang.zh': '中文',
      'settings.lang.en': 'English',
      'settings.upload': '选择本机图片',
      'settings.removeImage': '移除图片',
      'settings.imageHint': 'PNG / JPEG / WebP / GIF，最大 5MB；保存在本机，不上传。',
      'settings.imageEmpty': '还没有选择图片',
      'settings.imageTypeError': '只支持 PNG / JPEG / WebP / GIF',
      'settings.imageSizeError': '图片太大（上限 5MB）',
      'settings.imageReadError': '读取图片失败',
      'settings.blur': '背景模糊',
      'settings.preview': '预览',
      'settings.placeholderHint': '留空即用默认文案；{n} 这类占位符请保留。',
      'settings.dragHint': '拖动标题栏移动设置窗口',
      'settings.noMatch': '没有匹配的文案',
    };

    const en = {
      'toggle.label': 'Memo / requirement list',
      'toggle.title': 'Memo / requirement list: {n} open',
      'toggle.emptyTitle': 'Memo / requirement list (empty)',
      'toggle.unread': 'new items',
      'panel.title': 'Memo · requirements',
      'panel.subtitle': 'Open {open} · AI parked {ai}',
      'panel.subtitlePlain': 'Open {open}',
      'panel.subtitleEmpty': 'Park what you want to do later',
      'panel.subtitleDone': 'All done',
      'panel.add': 'Add requirement',
      'panel.collapse': 'Collapse panel',
      'panel.settings': 'Plugin settings',
      'panel.dragHint': 'Drag the header to move; double-click to reset',
      'panel.footDone': '{n} done',
      'panel.clearDone': 'Clear',
      'panel.loading': 'Loading…',
      'panel.empty': 'Nothing here yet.\nWrite down what you want to do later; the agent also parks requirements it heard but should not do now.',
      'panel.noSession': 'Open a conversation; each one has its own memo list.',
      'panel.error': 'Could not load: {message}',
      'panel.retry': 'Retry',
      'item.toggleDone': 'Mark done',
      'item.toggleOpen': 'Mark open',
      'item.edit': 'Edit',
      'item.delete': 'Delete',
      'item.editHint': 'Click to edit the name and details',
      'item.ai': 'AI',
      'item.aiHint': 'Parked by the agent from the conversation',
      'drawer.add': 'Add requirement',
      'drawer.edit': 'Edit requirement',
      'drawer.close': 'Close',
      'drawer.submit': 'Add',
      'drawer.hint': 'Enter adds · Shift+Enter for a new line',
      'editor.save': 'Save',
      'editor.cancel': 'Cancel',
      'field.title': 'Requirement name…',
      'field.detail': 'Details (optional): what to build, boundaries, acceptance…',
      'time.just': 'just now',
      'time.minutes': '{n} min ago',
      'time.hours': '{n} h ago',
      'settings.title': 'Memo settings',
      'settings.texts': 'Labels',
      'settings.background': 'Panel background',
      'settings.search': 'Search labels…',
      'settings.reset': 'Reset',
      'settings.resetAll': 'Reset all',
      'settings.save': 'Save',
      'settings.saving': 'Saving…',
      'settings.mode.theme': 'Theme',
      'settings.mode.color': 'Solid',
      'settings.mode.gradient': 'Gradient',
      'settings.appearance': 'Appearance',
      'settings.mode.image': 'Image',
      'settings.color': 'Color',
      'settings.opacity': 'Opacity',
      'settings.from': 'From',
      'settings.to': 'To',
      'settings.angle': 'Angle',
      'settings.shade': 'Shade',
      'settings.group.background': 'Panel background',
      'settings.group.font': 'Text size',
      'settings.group.language': 'Interface language',
      'settings.backgroundHint': 'Applies to the memo panel only',
      'settings.fontSize': 'Size',
      'settings.fontHint': 'Scales the panel and this window',
      'settings.fontSample': 'Sample: park one requirement for later',
      'settings.language': 'Language',
      'settings.lang.auto': 'Follow system',
      'settings.lang.zh': '中文',
      'settings.lang.en': 'English',
      'settings.upload': 'Choose a local image',
      'settings.removeImage': 'Remove image',
      'settings.imageHint': 'PNG / JPEG / WebP / GIF, up to 5MB; stored on this machine, never uploaded.',
      'settings.imageEmpty': 'No image chosen',
      'settings.imageTypeError': 'Only PNG / JPEG / WebP / GIF are supported',
      'settings.imageSizeError': 'Image is too large (5MB max)',
      'settings.imageReadError': 'Could not read that image',
      'settings.blur': 'Backdrop blur',
      'settings.preview': 'Preview',
      'settings.placeholderHint': 'Leave empty to use the default; keep placeholders like {n}.',
      'settings.dragHint': 'Drag the header to move this window',
      'settings.noMatch': 'No matching labels',
    };

    /** 设置窗口里可编辑的文案目录：分组标题 + [键, 中文说明]。 */
    const TEXT_GROUPS = [
      {
        title: '图标与提示',
        items: [
          ['toggle.label', '图标说明'],
          ['toggle.title', '图标提示（进行中 N 条）'],
          ['toggle.emptyTitle', '图标提示（空列表）'],
          ['toggle.unread', '有新内容'],
        ],
      },
      {
        title: '面板',
        items: [
          ['panel.title', '面板标题'],
          ['panel.subtitle', '副标题（进行中 + AI）'],
          ['panel.subtitlePlain', '副标题（仅进行中）'],
          ['panel.subtitleEmpty', '副标题（空列表）'],
          ['panel.subtitleDone', '副标题（全部完成）'],
          ['panel.add', '添加按钮'],
          ['panel.collapse', '收起按钮提示'],
          ['panel.dragHint', '拖动提示'],
          ['panel.footDone', '已完成 N 条'],
          ['panel.clearDone', '清除已完成'],
          ['panel.loading', '读取中'],
          ['panel.empty', '空列表说明'],
          ['panel.noSession', '没有会话时的说明'],
          ['panel.error', '读取失败'],
          ['panel.retry', '重试'],
        ],
      },
      {
        title: '条目',
        items: [
          ['item.toggleDone', '标记完成'],
          ['item.toggleOpen', '标记未完成'],
          ['item.edit', '编辑'],
          ['item.delete', '删除'],
          ['item.editHint', '编辑提示'],
          ['item.ai', 'AI 角标'],
          ['item.aiHint', 'AI 角标提示'],
        ],
      },
      {
        title: '抽屉与表单',
        items: [
          ['drawer.add', '抽屉标题（添加）'],
          ['drawer.edit', '抽屉标题（编辑）'],
          ['drawer.close', '关闭按钮'],
          ['drawer.submit', '抽屉添加按钮'],
          ['drawer.hint', '抽屉提示'],
          ['editor.save', '保存'],
          ['editor.cancel', '取消'],
          ['field.title', '需求名占位'],
          ['field.detail', '详细信息占位'],
        ],
      },
      {
        title: '时间',
        items: [
          ['time.just', '刚刚'],
          ['time.minutes', 'N 分钟前'],
          ['time.hours', 'N 小时前'],
        ],
      },
    ];

    function defaultBackground() {
      return {
        mode: 'theme',
        color: '#1b2a33',
        opacity: 0.9,
        blur: 24,
        gradientFrom: '#0f2027',
        gradientTo: '#2c5364',
        gradientAngle: 135,
        imageShade: 55,
        imageFile: '',
        imageVersion: 0,
      };
    }

    function defaultSettings() {
      return { texts: {}, background: defaultBackground(), language: 'auto', fontSize: 13 };
    }

    function cloneSettings(settings) {
      try {
        return JSON.parse(JSON.stringify(settings));
      } catch {
        return defaultSettings();
      }
    }

    let localeService = null;
    let translate = null;

    /** 当前语言：设置里强制优先，否则只区分中文 / 其它，避免区域标签（zh-CN）失配。 */
    function activeLanguage() {
      try {
        const forced = store && store.settings && store.settings.language;
        if (forced === 'zh' || forced === 'en') return forced;
      } catch {
        // store 还没初始化，继续用宿主语言。
      }
      let tag = '';
      try {
        const snapshot = localeService && localeService.getLocale();
        tag = snapshot && typeof snapshot.active === 'string' ? snapshot.active : '';
      } catch {
        tag = '';
      }
      if (!tag && typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
        tag = navigator.language;
      }
      return tag.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }

    /** 用户自定义的文案覆盖表（Host 设置）；没有就返回 null。 */
    function textOverrides() {
      const settings = store && store.settings;
      return settings && settings.texts ? settings.texts : null;
    }

    /** 内置默认文案，用于设置窗口的占位符。 */
    function defaultText(key) {
      const own = activeLanguage() === 'zh' ? zh : en;
      return own[key] || zh[key] || key;
    }

    /**
     * 取一条文案：用户覆盖 > locale 服务 > 内置字典。
     * @param key - 文案键。
     * @param params - `{name}` 占位符替换值。
     * @returns 文案。
     */
    function t(key, params) {
      let value;
      const overrides = textOverrides();
      if (overrides && typeof overrides[key] === 'string' && overrides[key]) {
        value = overrides[key];
      } else if (store && store.settings && (store.settings.language === 'zh' || store.settings.language === 'en')) {
        // 用户在设置里锁定了语言：不经过宿主 locale，直接用内置字典。
        value = defaultText(key);
      } else {
        try {
          value = translate ? translate(key, params) : key;
        } catch {
          value = key;
        }
        if (!value || value === key) value = defaultText(key);
      }
      if (params && typeof value === 'string') {
        for (const name of Object.keys(params)) {
          value = value.split(`{${name}}`).join(String(params[name]));
        }
      }
      return value;
    }

    // ---------------------------------------------------------------- 状态
    const store = {
      sessionId: readSessionId(),
      items: [],
      loaded: false,
      loading: false,
      busy: false,
      error: '',
      open: readOpen(),
      settings: null,
    };

    const listeners = new Set();

    /** 右上角图标的 DOM 引用：面板收起后把焦点还回去。 */
    let toggleElement = null;

    /** 写操作代次：丢弃写之前发出的 GET 响应，避免旧数据回滚。 */
    let writeEpoch = 0;

    function readOpen() {
      try {
        const stored = window.localStorage.getItem(OPEN_KEY);
        // 第一次安装时默认展开一次，让用户先看见列表；之后记住自己的选择。
        return stored === null ? true : stored === '1';
      } catch {
        return true;
      }
    }

    /** 上次用过的会话 id：header 图标还没上报时先顶一下，避免首屏空白。 */
    function readSessionId() {
      try {
        const stored = window.localStorage.getItem(SESSION_KEY);
        return typeof stored === 'string' && stored ? stored : null;
      } catch {
        return null;
      }
    }

    function writeSessionId(sessionId) {
      try {
        window.localStorage.setItem(SESSION_KEY, sessionId);
      } catch {
        // 隐私模式下不可写。
      }
    }

    /** 每个会话“看到过”的最新时间戳：小红点只看这个，与条目是否完成无关。 */
    let seenBySession = readSeen();

    function readSeen() {
      try {
        const raw = JSON.parse(window.localStorage.getItem(SEEN_KEY) || '{}');
        if (!raw || typeof raw !== 'object') return {};
        const next = {};
        for (const [key, value] of Object.entries(raw)) {
          if (typeof key === 'string' && typeof value === 'number' && Number.isFinite(value)) next[key] = value;
        }
        return next;
      } catch {
        return {};
      }
    }

    function writeSeen() {
      try {
        const entries = Object.entries(seenBySession)
          .sort((left, right) => right[1] - left[1])
          .slice(0, 200);
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(Object.fromEntries(entries)));
      } catch {
        // 隐私模式下不可写。
      }
    }

    function lastSeenOf(sessionId) {
      return sessionId ? seenBySession[sessionId] || 0 : 0;
    }

    /**
     * 面板打开且可见时，把当前会话标记为已读：小红点在看过后立刻消失。
     * @param sessionId - 当前会话。
     * @param items - 当前会话的条目。
     */
    function markSessionSeen(sessionId, items) {
      if (!sessionId) return;
      const latest = items.reduce((max, item) => Math.max(max, typeof item.updatedAt === 'number' ? item.updatedAt : 0), 0);
      if (latest <= lastSeenOf(sessionId)) return;
      seenBySession[sessionId] = latest;
      writeSeen();
      emit();
    }

    function emit() {
      for (const listener of listeners) listener();
    }

    function set(patch) {
      Object.assign(store, patch);
      emit();
    }

    function subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }

    function useStore() {
      const [, bump] = React.useState(0);
      React.useEffect(() => subscribe(() => bump((value) => value + 1)), []);
      return store;
    }

    function setOpen(next) {
      store.open = next;
      try {
        window.localStorage.setItem(OPEN_KEY, next ? '1' : '0');
      } catch {
        // 隐私模式下不可写，仅本次会话生效。
      }
      emit();
    }

    /**
     * 跟随当前会话切换列表：清掉上一个会话的条目，再读新的那一份。
     * 由 header 图标（会话作用域）在每次渲染时上报 sessionId。
     * @param next - 当前会话 id。
     */
    function publishSession(next) {
      if (!next || store.sessionId === next) return;
      writeSessionId(next);
      writeEpoch += 1;
      store.sessionId = next;
      store.items = [];
      store.loaded = false;
      store.loading = false;
      store.error = '';
      emit();
      void refresh();
    }

    // ---------------------------------------------------------------- 面板几何
    function viewport() {
      return {
        width: window.innerWidth || 1280,
        height: window.innerHeight || 800,
      };
    }

    function clampNumber(value, min, max, fallback) {
      const number = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
      if (!Number.isFinite(number)) return min;
      return Math.min(max, Math.max(min, number));
    }

    /** 把任意几何收进当前视口：既用于恢复上次位置，也用于窗口尺寸变化。 */
    function fitGeometry(raw) {
      const view = viewport();
      const widthLimit = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, view.width - EDGE * 2));
      const heightLimit = Math.max(MIN_HEIGHT, view.height - EDGE * 2);
      const width = clampNumber(raw && raw.w, MIN_WIDTH, widthLimit, Math.min(DEFAULT_WIDTH, widthLimit));
      const height = clampNumber(raw && raw.h, MIN_HEIGHT, heightLimit, Math.min(DEFAULT_HEIGHT, heightLimit));
      const x = clampNumber(raw && raw.x, EDGE, Math.max(EDGE, view.width - width - EDGE), view.width - width - 20);
      const y = clampNumber(raw && raw.y, EDGE, Math.max(EDGE, view.height - height - EDGE), 96);
      return { x, y, w: width, h: height };
    }

    function defaultGeometry() {
      const view = viewport();
      const width = Math.min(DEFAULT_WIDTH, view.width - EDGE * 2);
      const height = Math.min(DEFAULT_HEIGHT, view.height - EDGE * 2);
      return fitGeometry({ x: view.width - width - 20, y: 96, w: width, h: height });
    }

    function loadGeometry() {
      const fallback = defaultGeometry();
      try {
        const raw = JSON.parse(window.localStorage.getItem(GEOMETRY_KEY) || 'null');
        if (!raw || typeof raw !== 'object') return fallback;
        return fitGeometry(raw);
      } catch {
        return fallback;
      }
    }

    function saveGeometry(geometry) {
      try {
        window.localStorage.setItem(GEOMETRY_KEY, JSON.stringify(geometry));
      } catch {
        // 隐私模式下不可写。
      }
    }

    /** 八个缩放方向的顺序，用于渲染把手。 */
    const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    /**
     * 按拖动方向计算新的面板几何：边和角都能拉，且始终留在视口内。
     * @param origin - 开始拖动时的几何。
     * @param direction - n / s / e / w / ne / nw / se / sw。
     * @param dx - 指针横向位移。
     * @param dy - 指针纵向位移。
     * @returns 新的几何。
     */
    function resizedGeometry(origin, direction, dx, dy) {
      const view = viewport();
      const maxRight = view.width - EDGE;
      const maxBottom = view.height - EDGE;
      const right = origin.x + origin.w;
      const bottom = origin.y + origin.h;
      let x = origin.x;
      let y = origin.y;
      let w = origin.w;
      let h = origin.h;

      if (direction.includes('e')) {
        w = Math.min(Math.max(origin.w + dx, MIN_WIDTH), Math.min(MAX_WIDTH, maxRight - x));
      }
      if (direction.includes('s')) {
        h = Math.min(Math.max(origin.h + dy, MIN_HEIGHT), maxBottom - y);
      }
      if (direction.includes('w')) {
        const nextX = Math.min(Math.max(origin.x + dx, EDGE), right - MIN_WIDTH);
        x = nextX;
        w = right - nextX;
        if (w > MAX_WIDTH) {
          w = MAX_WIDTH;
          x = right - MAX_WIDTH;
        }
      }
      if (direction.includes('n')) {
        const nextY = Math.min(Math.max(origin.y + dy, EDGE), bottom - MIN_HEIGHT);
        y = nextY;
        h = bottom - nextY;
      }
      return { x, y, w: Math.max(MIN_WIDTH, w), h: Math.max(MIN_HEIGHT, h) };
    }

    // ---------------------------------------------------------------- 网络
    function apiUrl(sessionId) {
      try {
        const url = new URL(API, document.baseURI);
        if (sessionId) url.searchParams.set('session', sessionId);
        return url.toString();
      } catch {
        return sessionId ? `/${API}?session=${encodeURIComponent(sessionId)}` : `/${API}`;
      }
    }

    async function call(method, sessionId, body) {
      const response = await fetch(apiUrl(sessionId), {
        method,
        cache: 'no-store',
        headers: body === undefined ? undefined : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: 'same-origin',
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok || !data || data.ok !== true) {
        throw new Error((data && data.error) || `HTTP ${response.status}`);
      }
      return data;
    }

    async function refresh() {
      if (store.loading || store.busy) return;
      const sessionId = store.sessionId;
      if (!sessionId) {
        set({ loaded: true, loading: false, items: [], error: '' });
        return;
      }
      const epoch = writeEpoch;
      set({ loading: true });
      try {
        const data = await call('GET', sessionId);
        if (epoch !== writeEpoch || sessionId !== store.sessionId) {
          set({ loading: false });
          return;
        }
        set({
          items: Array.isArray(data.items) ? data.items : [],
          loaded: true,
          loading: false,
          error: '',
        });
      } catch (error) {
        if (epoch !== writeEpoch || sessionId !== store.sessionId) {
          set({ loading: false });
          return;
        }
        set({ loaded: true, loading: false, error: String((error && error.message) || error) });
      }
    }

    async function mutate(payload) {      const sessionId = store.sessionId;
      if (!sessionId) {
        set({ error: t('panel.noSession') });
        return false;
      }
      if (store.busy) return false;
      writeEpoch += 1;
      set({ busy: true });
      try {
        const data = await call('POST', sessionId, { ...payload, sessionId });
        if (sessionId !== store.sessionId) {
          set({ busy: false });
          return false;
        }
        set({
          items: Array.isArray(data.items) ? data.items : store.items,
          loaded: true,
          busy: false,
          error: '',
        });
        return true;
      } catch (error) {
        set({ busy: false, error: String((error && error.message) || error) });
        return false;
      }
    }

    // ---------------------------------------------------------------- 设置
    function settingsUrl() {
      try {
        return new URL('dsh-memo/settings', document.baseURI).toString();
      } catch {
        return '/dsh-memo/settings';
      }
    }

    async function loadSettings() {
      try {
        const response = await fetch(settingsUrl(), { cache: 'no-store', credentials: 'same-origin' });
        const data = await response.json();
        if (response.ok && data && data.ok === true && data.settings) {
          set({ settings: data.settings });
        }
      } catch {
        // 拿不到设置就按默认样式渲染。
      }
    }

    async function saveSettings(next) {
      const response = await fetch(settingsUrl(), {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ settings: next }),
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok || !data || data.ok !== true || !data.settings) {
        throw new Error((data && data.error) || `HTTP ${response.status}`);
      }
      set({ settings: data.settings });
      return data.settings;
    }

    function hexToRgba(hex, alpha) {
      const value = typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.slice(1) : '1b2a33';
      const red = parseInt(value.slice(0, 2), 16);
      const green = parseInt(value.slice(2, 4), 16);
      const blue = parseInt(value.slice(4, 6), 16);
      const opacity = Math.min(1, Math.max(0, typeof alpha === 'number' ? alpha : 1));
      return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }

    /** 已保存背景图片的同源地址（带版本号做缓存失效）。 */
    function backgroundImageUrl(settings) {
      const background = settings && settings.background;
      if (!background || !background.imageFile) return '';
      const version = background.imageVersion || 0;
      try {
        const url = new URL('dsh-memo/background', document.baseURI);
        url.searchParams.set('v', String(version));
        return url.toString();
      } catch {
        return `/dsh-memo/background?v=${version}`;
      }
    }

    /**
     * 把自定义背景设置翻译成面板的内联样式；theme 模式返回 null（走 CSS 默认）。
     * @param settings - 插件设置。
     * @param imageOverride - 预览用的 data URL（上传后尚未保存时）。
     * @returns 样式对象或 null。
     */
    function backgroundStyle(settings, imageOverride) {
      const background = settings && settings.background;
      if (!background || background.mode === 'theme') return null;
      const blur = `blur(${typeof background.blur === 'number' ? background.blur : 24}px) saturate(1.35)`;
      const style = { backdropFilter: blur, WebkitBackdropFilter: blur };
      if (background.mode === 'color') {
        style.backgroundColor = hexToRgba(background.color, background.opacity);
        style.backgroundImage = 'none';
        return style;
      }
      if (background.mode === 'gradient') {
        style.backgroundColor = 'transparent';
        style.backgroundImage = `linear-gradient(${background.gradientAngle}deg, ${hexToRgba(background.gradientFrom, background.opacity)}, ${hexToRgba(background.gradientTo, background.opacity)})`;
        return style;
      }
      if (background.mode === 'image') {
        const source = imageOverride || backgroundImageUrl(settings);
        if (!source) return null;
        const shade = `color-mix(in srgb, var(--dsw-alias-bg-base) ${background.imageShade}%, transparent)`;
        style.backgroundColor = 'transparent';
        style.backgroundImage = `linear-gradient(${shade}, ${shade}), url(${JSON.stringify(source)})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        return style;
      }
      return null;
    }

    // ---------------------------------------------------------------- 图形
    function ListGlyph() {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { x: 2.4, y: 2.8, width: 11.2, height: 10.4, rx: 2.4, stroke: 'currentColor', strokeWidth: 1.3 }),
        h('path', {
          d: 'M5.1 6.1h5.8M5.1 9.3h4.1',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
        }));
    }

    function MarkGlyph() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M3.6 1.9h7.1l2.7 2.7v9.5H3.6z',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M5.9 6.1h4.4M5.9 8.7h4.4M5.9 11.3h2.9',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
        }));
    }

    function CheckGlyph() {
      return h('svg', { width: 10, height: 10, viewBox: '0 0 12 12', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M2.2 6.4 4.7 8.9 9.8 3.2',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }));
    }

    function ChevronRight() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M6.2 3.6 10.6 8l-4.4 4.4',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }));
    }

    function PlusGlyph() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M8 3.4v9.2M3.4 8h9.2',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }));
    }

    function CloseGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M4 4l8 8M12 4l-8 8',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }));
    }

    function PencilGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M10.9 2.6 13.4 5.1 5.6 12.9 2.4 13.6 3.1 10.4z',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinejoin: 'round',
        }));
    }

    function TrashGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M2.8 4.3h10.4M6.2 4.3V3.1h3.6v1.2M4.3 4.3l.7 9h6l.7-9',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }));
    }

    function GripGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M13 4 4 13M13 8.5 8.5 13',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
        }));
    }

    function SettingsGlyph() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M2.6 4.6h10.8M2.6 8h10.8M2.6 11.4h10.8',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 6, cy: 4.6, r: 1.7, fill: 'currentColor' }),
        h('circle', { cx: 10.4, cy: 8, r: 1.7, fill: 'currentColor' }),
        h('circle', { cx: 5.2, cy: 11.4, r: 1.7, fill: 'currentColor' }));
    }

    function ResetGlyph() {
      return h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true, style: { display: 'block' } },
        h('path', {
          d: 'M3.2 7.2a4.8 4.8 0 1 1 1.4 3.4M3.2 7.2V3.6M3.2 7.2h3.6',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }));
    }

    // ---------------------------------------------------------------- 工具
    function openCountOf(items) {
      return items.filter((item) => item.status === 'open').length;
    }

    function aiOpenCountOf(items) {
      return items.filter((item) => item.status === 'open' && item.source === 'ai').length;
    }

    function doneCountOf(items) {
      return items.filter((item) => item.status === 'done').length;
    }

    function timeLabel(stamp) {
      const value = typeof stamp === 'number' ? stamp : 0;
      const diff = Date.now() - value;
      if (!Number.isFinite(diff) || diff < 60_000) return t('time.just');
      if (diff < 3_600_000) return t('time.minutes', { n: Math.floor(diff / 60_000) });
      if (diff < 86_400_000) return t('time.hours', { n: Math.floor(diff / 3_600_000) });
      const date = new Date(value);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    /**
     * 从 slot props 里取当前会话 id；不同 slot 暴露的字段形状略有差异。
     * @param props - slot 注入的属性。
     * @returns 会话 id，或空串。
     */
    function sessionIdOf(props) {
      if (!props) return '';
      const candidates = [
        props.sessionId,
        props.session && props.session.sessionId,
        props.session && props.session.id,
      ];
      for (const value of candidates) {
        if (typeof value === 'string' && value) return value;
      }
      return '';
    }

    // ---------------------------------------------------------------- header 图标
    function MemoToggle(props) {
      const view = useStore();
      const sessionId = sessionIdOf(props);
      const openCount = openCountOf(view.items);
      const [pulse, setPulse] = React.useState(false);
      const previous = React.useRef(null);

      // header 图标是会话作用域的：跟随当前会话上报 id，面板据此切换列表。
      React.useEffect(() => {
        if (sessionId) publishSession(sessionId);
      }, [sessionId]);

      // 换会话时重置脉冲基线，避免新会话的首屏加载被当成「新增条目」。
      React.useEffect(() => {
        previous.current = null;
      }, [sessionId]);

      // 只在首次加载完成后记录基线，之后「变多」才脉冲；首屏拉取不算新条目。
      React.useEffect(() => {
        if (!view.loaded) return undefined;
        if (previous.current === null) {
          previous.current = openCount;
          return undefined;
        }
        const added = openCount - previous.current;
        previous.current = openCount;
        if (added <= 0 || view.open) return undefined;
        setPulse(true);
        const timer = window.setTimeout(() => setPulse(false), 1500);
        return () => window.clearTimeout(timer);
      }, [openCount, view.loaded, view.open]);

      const label = openCount > 0 ? t('toggle.title', { n: openCount }) : t('toggle.emptyTitle');
      const unread = Boolean(view.sessionId) && view.items.some(
        (item) => (typeof item.updatedAt === 'number' ? item.updatedAt : 0) > lastSeenOf(view.sessionId),
      );

      return h('button', {
        type: 'button',
        ref: (node) => {
          toggleElement = node;
        },
        className: 'dshm-toggle',
        'data-open': view.open ? 'true' : 'false',
        'data-pulse': pulse ? 'true' : 'false',
        'aria-label': unread ? `${t('toggle.label')} · ${t('toggle.unread')}` : t('toggle.label'),
        'aria-expanded': view.open ? 'true' : 'false',
        'aria-controls': 'dshm-panel',
        title: unread ? `${label} · ${t('toggle.unread')}` : label,
        onClick: () => setOpen(!store.open),
      },
        h(ListGlyph),
        unread ? h('span', { className: 'dshm-dot', 'aria-hidden': true }) : null);
    }

    // ---------------------------------------------------------------- 列表项
    function MemoItem(props) {
      const { item, expanded, setExpanded, busy, onEdit } = props;
      const isDone = item.status === 'done';
      const isExpanded = Boolean(expanded[item.id]);

      return h('div', {
        className: 'dshm-item',
        role: 'listitem',
        'data-done': isDone ? 'true' : 'false',
      },
        h('button', {
          type: 'button',
          className: 'dshm-check',
          role: 'checkbox',
          'aria-checked': isDone ? 'true' : 'false',
          'data-done': isDone ? 'true' : 'false',
          disabled: busy,
          title: isDone ? t('item.toggleOpen') : t('item.toggleDone'),
          'aria-label': isDone ? t('item.toggleOpen') : t('item.toggleDone'),
          onClick: () => { void mutate({ op: 'toggle', id: item.id }); },
        }, isDone ? h(CheckGlyph) : null),
        h('div', { className: 'dshm-body' },
          h('div', { className: 'dshm-item-head' },
            h('span', {
              className: 'dshm-item-title',
              role: 'button',
              tabIndex: 0,
              title: t('item.editHint'),
              onClick: () => onEdit(item),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onEdit(item);
                }
              },
            }, item.title),
            item.source === 'ai' ? h('span', { className: 'dshm-src', title: t('item.aiHint') }, t('item.ai')) : null),
          item.detail
            ? h('p', {
              className: 'dshm-item-detail',
              'data-expanded': isExpanded ? 'true' : 'false',
              role: 'button',
              tabIndex: 0,
              'aria-expanded': isExpanded ? 'true' : 'false',
              title: isExpanded ? undefined : item.detail,
              onClick: () => setExpanded({ ...expanded, [item.id]: !isExpanded }),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setExpanded({ ...expanded, [item.id]: !isExpanded });
                }
              },
            }, item.detail)
            : null,
          h('div', { className: 'dshm-item-meta' },
            h('span', { className: 'dshm-time' }, timeLabel(item.updatedAt)),
            h('div', { className: 'dshm-item-actions' },
              h('button', {
                type: 'button',
                className: 'dshm-mini',
                disabled: busy,
                title: t('item.edit'),
                'aria-label': t('item.edit'),
                onClick: () => onEdit(item),
              }, h(PencilGlyph)),
              h('button', {
                type: 'button',
                className: 'dshm-mini',
                'data-danger': 'true',
                disabled: busy,
                title: t('item.delete'),
                'aria-label': t('item.delete'),
                onClick: () => { void mutate({ op: 'remove', id: item.id }); },
              }, h(TrashGlyph))))));
    }

    // ---------------------------------------------------------------- 悬浮面板
    function MemoPanel() {
      const view = useStore();
      const panelRef = React.useRef(null);
      const titleInputRef = React.useRef(null);
      const [geometry, setGeometry] = React.useState(loadGeometry);
      const [dragging, setDragging] = React.useState(false);
      const [resizing, setResizing] = React.useState(false);
      const [drawer, setDrawer] = React.useState(null);
      const [expanded, setExpanded] = React.useState({});
      const [settingsOpen, setSettingsOpen] = React.useState(false);
      const [draft, setDraft] = React.useState(null);
      const [tab, setTab] = React.useState('texts');
      const [query, setQuery] = React.useState('');
      const [winBox, setWinBox] = React.useState(null);
      const [saving, setSaving] = React.useState(false);
      const [saveError, setSaveError] = React.useState('');
      const winRef = React.useRef(null);
      const winDragRef = React.useRef(null);

      const geometryRef = React.useRef(geometry);
      const dragRef = React.useRef(null);
      const resizeRef = React.useRef(null);
      const firstOpen = React.useRef(true);

      React.useEffect(() => {
        geometryRef.current = geometry;
      }, [geometry]);

      // 自定义文案与弹窗背景：打开页面时读一次 Host 设置。
      React.useEffect(() => {
        void loadSettings();
      }, []);

      const openCount = openCountOf(view.items);
      const aiOpen = aiOpenCountOf(view.items);
      const doneCount = doneCountOf(view.items);
      const drawerKey = drawer ? `${drawer.mode}:${drawer.id || ''}` : '';

      function closePanel() {
        setOpen(false);
        setDrawer(null);
        const node = toggleElement;
        if (node && typeof node.focus === 'function') node.focus({ preventScroll: true });
      }

      // 打开时把焦点交给面板本身（不抢输入框），Esc 才有落点；关闭时关掉抽屉。
      React.useEffect(() => {
        if (firstOpen.current) {
          firstOpen.current = false;
          return undefined;
        }
        if (!view.open) {
          setDrawer(null);
          return undefined;
        }
        const node = panelRef.current;
        if (!node) return undefined;
        const timer = window.setTimeout(() => {
          try {
            node.focus({ preventScroll: true });
          } catch {
            node.focus();
          }
        }, 60);
        return () => window.clearTimeout(timer);
      }, [view.open]);

      // 挂载即读一次，之后轮询 + 回到页面时刷新，保持与 AI 写入同步。
      React.useEffect(() => {
        void refresh();
        const timer = window.setInterval(() => {
          if (!document.hidden && !store.busy) void refresh();
        }, POLL_MS);
        const onVisible = () => {
          if (!document.hidden) void refresh();
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);
        return () => {
          window.clearInterval(timer);
          document.removeEventListener('visibilitychange', onVisible);
          window.removeEventListener('focus', onVisible);
        };
      }, []);

      // 窗口变化时把面板收回可视区。
      React.useEffect(() => {
        const onResize = () => {
          const next = fitGeometry(geometryRef.current);
          geometryRef.current = next;
          setGeometry(next);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);

      // 会话切换：清掉上一个会话的展开 / 抽屉状态，立刻读新会话的列表。
      React.useEffect(() => {
        setExpanded({});
        setDrawer(null);
        if (view.sessionId) void refresh();
      }, [view.sessionId]);

      // 面板可见即视为“已看过”：小红点看过后消失，和条目是否完成无关。
      React.useEffect(() => {
        if (!view.open || !view.sessionId || document.hidden) return;
        markSessionSeen(view.sessionId, view.items);
      }, [view.open, view.sessionId, view.items]);

      // 从后台切回页面、面板仍开着时，同样补一次“已看过”。
      React.useEffect(() => {
        const onVisible = () => {
          if (document.hidden || !store.open || !store.sessionId) return;
          markSessionSeen(store.sessionId, store.items);
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
      }, []);

      // 抽屉打开时聚焦需求名输入框。
      React.useEffect(() => {
        if (!drawerKey) return undefined;
        const timer = window.setTimeout(() => {
          const node = titleInputRef.current;
          if (!node) return;
          try {
            node.focus({ preventScroll: true });
          } catch {
            node.focus();
          }
        }, 40);
        return () => window.clearTimeout(timer);
      }, [drawerKey]);

      // 面板内的 Esc：先关抽屉，再收面板；不会干扰外面的输入框。
      function onPanelKeyDown(event) {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        if (drawer) {
          setDrawer(null);
          return;
        }
        closePanel();
      }

      // ---- 拖动 ----
      function beginDrag(event) {
        if (event.button !== 0) return;
        const target = event.target;
        if (target instanceof Element && target.closest('button, input, textarea, a')) return;
        event.preventDefault();
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: geometry.x,
          originY: geometry.y,
        };
        setDragging(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 指针捕获不可用时仍靠 move/up 事件工作。
        }
      }

      function moveDrag(event) {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        const next = fitGeometry({
          ...geometryRef.current,
          x: drag.originX + event.clientX - drag.startX,
          y: drag.originY + event.clientY - drag.startY,
        });
        geometryRef.current = next;
        setGeometry(next);
      }

      function endDrag(event) {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;
        setDragging(false);
        saveGeometry(geometryRef.current);
      }

      // ---- 调整大小：八个方向都行 ----
      function beginResize(event, direction) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        resizeRef.current = {
          pointerId: event.pointerId,
          direction,
          startX: event.clientX,
          startY: event.clientY,
          origin: { ...geometryRef.current },
        };
        setResizing(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 同上。
        }
      }

      function moveResize(event) {
        const resize = resizeRef.current;
        if (!resize || resize.pointerId !== event.pointerId) return;
        const next = resizedGeometry(
          resize.origin,
          resize.direction,
          event.clientX - resize.startX,
          event.clientY - resize.startY,
        );
        geometryRef.current = next;
        setGeometry(next);
      }

      function endResize(event) {
        const resize = resizeRef.current;
        if (!resize || resize.pointerId !== event.pointerId) return;
        resizeRef.current = null;
        setResizing(false);
        saveGeometry(geometryRef.current);
      }

      function resetGeometry() {
        const next = defaultGeometry();
        geometryRef.current = next;
        setGeometry(next);
        saveGeometry(next);
      }

      // ---- 抽屉 ----
      function openAdd() {
        if (!store.sessionId) return;
        setDrawer({ mode: 'add', title: '', detail: '' });
      }

      function openEdit(item) {
        setDrawer({ mode: 'edit', id: item.id, title: item.title, detail: item.detail });
      }

      async function submitDrawer() {
        if (!drawer || store.busy) return;
        const title = drawer.title.trim();
        if (!title) {
          titleInputRef.current?.focus();
          return;
        }
        const ok = drawer.mode === 'edit'
          ? await mutate({ op: 'update', id: drawer.id, title, detail: drawer.detail })
          : await mutate({ op: 'add', title, detail: drawer.detail });
        if (ok) {
          setDrawer(null);
          const node = panelRef.current;
          if (node) node.focus({ preventScroll: true });
        }
      }

      function subtitle() {
        if (openCount === 0 && doneCount > 0) return t('panel.subtitleDone');
        if (openCount === 0) return t('panel.subtitleEmpty');
        if (aiOpen > 0) return t('panel.subtitle', { open: openCount, ai: aiOpen });
        return t('panel.subtitlePlain', { open: openCount });
      }

      // ---- 设置窗口 ----
      function openSettings() {
        const vw = window.innerWidth || 1280;
        const vh = window.innerHeight || 800;
        const width = Math.min(860, vw - 24);
        const height = Math.min(600, vh - 80);
        setDraft(cloneSettings(store.settings || defaultSettings()));
        setTab('texts');
        setQuery('');
        setSaveError('');
        setSaving(false);
        setWinBox({ x: Math.max(12, (vw - width) / 2), y: Math.max(12, (vh - height) / 2), w: width, h: height });
        setSettingsOpen(true);
      }

      function closeSettings() {
        setSettingsOpen(false);
        setDraft(null);
        setSaveError('');
      }

      async function submitSettings() {
        if (!draft || saving) return;
        setSaving(true);
        setSaveError('');
        try {
          const saved = await saveSettings(draft);
          setDraft(cloneSettings(saved));
          setSettingsOpen(false);
        } catch (error) {
          setSaveError(String((error && error.message) || error));
        } finally {
          setSaving(false);
        }
      }

      function resetDraft() {
        setDraft(defaultSettings());
      }

      function setText(key, value) {
        setDraft((current) => {
          if (!current) return current;
          const texts = { ...current.texts };
          if (value.trim()) texts[key] = value;
          else delete texts[key];
          return { ...current, texts };
        });
      }

      function resetText(key) {
        setDraft((current) => {
          if (!current) return current;
          const texts = { ...current.texts };
          delete texts[key];
          return { ...current, texts };
        });
      }

      function setBackground(patch) {
        setDraft((current) => (current ? { ...current, background: { ...current.background, ...patch } } : current));
      }

      function beginWinDrag(event) {
        if (event.button !== 0 || !winBox) return;
        const target = event.target;
        if (target instanceof Element && target.closest('button, input, textarea, select')) return;
        event.preventDefault();
        winDragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: winBox.x,
          originY: winBox.y,
        };
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 指针捕获不可用时仍靠 move/up 事件工作。
        }
      }

      function moveWinDrag(event) {
        const drag = winDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId || !winBox) return;
        const vw = window.innerWidth || 1280;
        const vh = window.innerHeight || 800;
        setWinBox({
          ...winBox,
          x: Math.min(Math.max(drag.originX + event.clientX - drag.startX, 8), Math.max(8, vw - winBox.w - 8)),
          y: Math.min(Math.max(drag.originY + event.clientY - drag.startY, 8), Math.max(8, vh - winBox.h - 8)),
        });
      }

      function endWinDrag() {
        winDragRef.current = null;
      }

      React.useEffect(() => {
        if (!settingsOpen) return undefined;
        const timer = window.setTimeout(() => {
          const node = winRef.current;
          if (!node) return;
          try {
            node.focus({ preventScroll: true });
          } catch {
            node.focus();
          }
        }, 40);
        return () => window.clearTimeout(timer);
      }, [settingsOpen]);

      function onSettingsKeyDown(event) {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        closeSettings();
      }

      function colorRow(labelKey, value, onChange) {
        return h('label', { className: 'dshm-win-rowfield' },
          h('span', { className: 'dshm-win-fieldlabel' }, t(labelKey)),
          h('input', {
            type: 'color',
            className: 'dshm-win-color',
            value,
            onChange: (event) => onChange(event.target.value),
          }));
      }

      function rangeRow(labelKey, value, min, max, step, onChange, text) {
        return h('label', { className: 'dshm-win-rowfield' },
          h('span', { className: 'dshm-win-fieldlabel' }, t(labelKey)),
          h('input', {
            type: 'range',
            className: 'dshm-win-range',
            min,
            max,
            step,
            value,
            onChange: (event) => onChange(Number(event.target.value)),
          }),
          h('span', { className: 'dshm-win-value' }, text));
      }

      function renderTextsTab() {
        const needle = query.trim().toLowerCase();
        const matches = ([key, label]) => !needle
          || key.toLowerCase().includes(needle)
          || label.toLowerCase().includes(needle)
          || String((draft.texts && draft.texts[key]) || '').toLowerCase().includes(needle);
        const cards = TEXT_GROUPS.map((group) => {
          const items = group.items.filter(matches);
          if (!items.length) return null;
          return h('section', { className: 'dshm-card', key: group.title },
            h('div', { className: 'dshm-card-head' },
              h('span', { className: 'dshm-card-title' }, group.title),
              h('span', { className: 'dshm-card-hint' }, String(items.length))),
            h('div', { className: 'dshm-card-body' },
              items.map(([key, label]) => h('div', { className: 'dshm-win-row', key },
                h('div', { className: 'dshm-win-rowtext' },
                  h('span', { className: 'dshm-win-rowlabel' }, label),
                  h('span', { className: 'dshm-win-rowkey' }, key)),
                h('input', {
                  className: 'dshm-field dshm-win-input',
                  value: (draft.texts && draft.texts[key]) || '',
                  placeholder: defaultText(key),
                  maxLength: 400,
                  'aria-label': label,
                  onChange: (event) => setText(key, event.target.value),
                }),
                h('button', {
                  type: 'button',
                  className: 'dshm-mini',
                  disabled: !(draft.texts && draft.texts[key]),
                  title: t('settings.reset'),
                  'aria-label': t('settings.reset'),
                  onClick: () => resetText(key),
                }, h(ResetGlyph))))));
        }).filter(Boolean);
        return h(React.Fragment, null,
          h('div', { className: 'dshm-win-toolbar' },
            h('input', {
              className: 'dshm-field',
              value: query,
              placeholder: t('settings.search'),
              'aria-label': t('settings.search'),
              onChange: (event) => setQuery(event.target.value),
            })),
          h('div', { className: 'dshm-win-hintline' }, t('settings.placeholderHint')),
          cards.length ? cards : h('div', { className: 'dshm-win-empty' }, t('settings.noMatch')));
      }

      function cardSection(title, hint, children) {
        return h('section', { className: 'dshm-card' },
          h('div', { className: 'dshm-card-head' },
            h('span', { className: 'dshm-card-title' }, title),
            hint ? h('span', { className: 'dshm-card-hint' }, hint) : null),
          h('div', { className: 'dshm-card-body' }, children));
      }

      function pickImage(event) {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
          setSaveError(t('settings.imageTypeError'));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setSaveError(t('settings.imageSizeError'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setSaveError('');
          setDraft((current) => (current
            ? { ...current, background: { ...current.background, imageData: String(reader.result || ''), removeImage: false } }
            : current));
        };
        reader.onerror = () => setSaveError(t('settings.imageReadError'));
        reader.readAsDataURL(file);
      }

      function removeImage() {
        setDraft((current) => (current
          ? {
            ...current,
            background: { ...current.background, mode: 'theme', imageData: '', imageFile: '', imageVersion: 0, removeImage: true },
          }
          : current));
      }

      function renderAppearanceTab() {
        const background = draft.background;
        const preview = backgroundStyle({ background }, background.imageData || '');
        const hasImage = Boolean(background.imageData || background.imageFile);
        const modes = [
          ['theme', t('settings.mode.theme')],
          ['color', t('settings.mode.color')],
          ['gradient', t('settings.mode.gradient')],
          ['image', t('settings.mode.image')],
        ];
        return h(React.Fragment, null,
          cardSection(t('settings.group.background'), t('settings.backgroundHint'),
            h(React.Fragment, null,
              h('div', { className: 'dshm-win-modes', role: 'group' },
                modes.map(([id, label]) => h('button', {
                  key: id,
                  type: 'button',
                  className: 'dshm-win-mode',
                  'data-active': background.mode === id ? 'true' : 'false',
                  onClick: () => setBackground({ mode: id }),
                }, label))),
              h('div', { className: 'dshm-win-rows' },
                background.mode === 'color'
                  ? colorRow('settings.color', background.color, (value) => setBackground({ color: value }))
                  : null,
                background.mode === 'gradient'
                  ? colorRow('settings.from', background.gradientFrom, (value) => setBackground({ gradientFrom: value }))
                  : null,
                background.mode === 'gradient'
                  ? colorRow('settings.to', background.gradientTo, (value) => setBackground({ gradientTo: value }))
                  : null,
                background.mode === 'gradient'
                  ? rangeRow('settings.angle', background.gradientAngle, 0, 360, 1, (value) => setBackground({ gradientAngle: value }), `${Math.round(background.gradientAngle)}°`)
                  : null,
                background.mode === 'image'
                  ? rangeRow('settings.shade', background.imageShade, 0, 90, 1, (value) => setBackground({ imageShade: value }), `${Math.round(background.imageShade)}%`)
                  : null,
                background.mode !== 'theme'
                  ? rangeRow('settings.opacity', Math.round(background.opacity * 100), 50, 100, 1, (value) => setBackground({ opacity: value / 100 }), `${Math.round(background.opacity * 100)}%`)
                  : null,
                background.mode !== 'theme'
                  ? rangeRow('settings.blur', background.blur, 0, 40, 1, (value) => setBackground({ blur: value }), `${Math.round(background.blur)}px`)
                  : null),
              background.mode === 'image'
                ? h('div', { className: 'dshm-win-image' },
                  h('div', { className: 'dshm-win-image-actions' },
                    h('label', { className: 'dshm-filebtn' },
                      h('input', {
                        type: 'file',
                        accept: 'image/png,image/jpeg,image/webp,image/gif',
                        onChange: pickImage,
                      }),
                      t('settings.upload')),
                    hasImage
                      ? h('button', { type: 'button', className: 'dshm-ghost', onClick: removeImage }, t('settings.removeImage'))
                      : h('span', { className: 'dshm-win-hintline' }, t('settings.imageEmpty'))),
                  h('div', { className: 'dshm-win-hintline' }, t('settings.imageHint')))
                : null,
              h('div', { className: 'dshm-win-preview' },
                h('span', { className: 'dshm-win-preview-label' }, t('settings.preview')),
                h('div', {
                  className: 'dshm-win-preview-box',
                  'data-theme': background.mode === 'theme' ? 'true' : 'false',
                  style: preview || undefined,
                })))),
          cardSection(t('settings.group.font'), t('settings.fontHint'),
            h(React.Fragment, null,
              rangeRow('settings.fontSize', draft.fontSize, 11, 17, 1, (value) => setDraft((current) => (current ? { ...current, fontSize: value } : current)), `${Math.round(draft.fontSize)}px`),
              h('div', { className: 'dshm-font-sample', style: { fontSize: `${draft.fontSize}px` } }, t('settings.fontSample')))),
          cardSection(t('settings.group.language'), null,
            h('div', { className: 'dshm-win-rowfield' },
              h('span', { className: 'dshm-win-fieldlabel' }, t('settings.language')),
              h('select', {
                className: 'dshm-win-select',
                value: draft.language,
                onChange: (event) => setDraft((current) => (current ? { ...current, language: event.target.value } : current)),
              },
                h('option', { value: 'auto' }, t('settings.lang.auto')),
                h('option', { value: 'zh' }, t('settings.lang.zh')),
                h('option', { value: 'en' }, t('settings.lang.en'))))));
      }

      function renderSettingsWindow() {
        if (!settingsOpen || !draft || !winBox) return null;
        return h(React.Fragment, null,
          h('div', { className: 'dshm-win-scrim', onClick: closeSettings }),
          h('div', {
            ref: winRef,
            className: 'dshm-win',
            style: {
              left: winBox.x,
              top: winBox.y,
              width: winBox.w,
              height: winBox.h,
              '--dshm-fs': String(Math.min(1.35, Math.max(0.8, (draft.fontSize || 13) / 13))),
            },
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('settings.title'),
            tabIndex: -1,
            onKeyDown: onSettingsKeyDown,
          },
            h('div', {
              className: 'dshm-win-head',
              title: t('settings.dragHint'),
              onPointerDown: beginWinDrag,
              onPointerMove: moveWinDrag,
              onPointerUp: endWinDrag,
              onPointerCancel: endWinDrag,
            },
              h('span', { className: 'dshm-win-mark' }, h(SettingsGlyph)),
              h('span', { className: 'dshm-win-title' }, t('settings.title')),
              h('button', {
                type: 'button',
                className: 'dshm-iconbtn',
                title: t('drawer.close'),
                'aria-label': t('drawer.close'),
                onClick: closeSettings,
              }, h(CloseGlyph))),
            h('div', { className: 'dshm-win-body' },
              h('div', { className: 'dshm-win-nav', role: 'tablist' },
                ['texts', 'appearance'].map((id) => h('button', {
                  key: id,
                  type: 'button',
                  role: 'tab',
                  className: 'dshm-win-navitem',
                  'aria-selected': tab === id ? 'true' : 'false',
                  'data-active': tab === id ? 'true' : 'false',
                  onClick: () => setTab(id),
                }, id === 'texts' ? t('settings.texts') : t('settings.appearance')))),
              h('div', { className: 'dshm-win-content' }, tab === 'texts' ? renderTextsTab() : renderAppearanceTab())),
            h('div', { className: 'dshm-win-foot' },
              h('button', { type: 'button', className: 'dshm-link', onClick: resetDraft }, t('settings.resetAll')),
              saveError ? h('span', { className: 'dshm-win-error' }, saveError) : h('span', { className: 'dshm-hint' }),
              h('button', { type: 'button', className: 'dshm-ghost', onClick: closeSettings }, t('editor.cancel')),
              h('button', {
                type: 'button',
                className: 'dshm-primary',
                disabled: saving,
                onClick: () => { void submitSettings(); },
              }, saving ? t('settings.saving') : t('settings.save')))));
      }

      const list = !view.sessionId
        ? h('div', { className: 'dshm-empty' }, t('panel.noSession'))
        : view.items.length === 0
          ? (view.error
            ? null
            : h('div', { className: 'dshm-empty' }, view.loaded ? t('panel.empty') : t('panel.loading')))
          : view.items.map((item) => h(MemoItem, {
            key: item.id,
            item,
            expanded,
            setExpanded,
            busy: view.busy,
            onEdit: openEdit,
          }));

      const panel = h('aside', {
        ref: panelRef,
        id: 'dshm-panel',
        className: 'dshm-panel',
        tabIndex: -1,
        'data-open': view.open ? 'true' : 'false',
        'data-dragging': dragging ? 'true' : 'false',
        'data-resizing': resizing ? 'true' : 'false',
        style: {
          left: geometry.x,
          top: geometry.y,
          width: geometry.w,
          height: geometry.h,
          '--dshm-fs': String(Math.min(1.35, Math.max(0.8, (view.settings && view.settings.fontSize ? view.settings.fontSize : 13) / 13))),
          ...(backgroundStyle(view.settings) || {}),
        },
        'aria-hidden': view.open ? 'false' : 'true',
        'aria-label': t('panel.title'),
        role: 'complementary',
        onKeyDown: onPanelKeyDown,
      },
        h('div', {
          className: 'dshm-head',
          title: t('panel.dragHint'),
          onPointerDown: beginDrag,
          onPointerMove: moveDrag,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
          onDoubleClick: resetGeometry,
        },
          h('span', { className: 'dshm-mark' }, h(MarkGlyph)),
          h('div', { className: 'dshm-headtext' },
            h('div', { className: 'dshm-title' }, t('panel.title')),
            h('div', { className: 'dshm-sub' }, subtitle())),
          h('button', {
            type: 'button',
            className: 'dshm-iconbtn',
            title: t('panel.settings'),
            'aria-label': t('panel.settings'),
            onClick: openSettings,
          }, h(SettingsGlyph)),
          h('button', {
            type: 'button',
            className: 'dshm-iconbtn',
            disabled: !view.sessionId,
            title: t('panel.add'),
            'aria-label': t('panel.add'),
            onClick: openAdd,
          }, h(PlusGlyph)),
          h('button', {
            type: 'button',
            className: 'dshm-iconbtn',
            title: t('panel.collapse'),
            'aria-label': t('panel.collapse'),
            onClick: closePanel,
          }, h(ChevronRight))),
        h('div', { className: 'dshm-rule' }),
        h('div', { className: 'dshm-list', role: 'list' }, list),
        view.error
          ? h('div', { className: 'dshm-error' },
            h('span', null, t('panel.error', { message: view.error })),
            h('button', { type: 'button', className: 'dshm-link', onClick: () => { void refresh(); } }, ` ${t('panel.retry')}`))
          : null,
        h('div', { className: 'dshm-foot' },
          doneCount > 0
            ? h('div', { className: 'dshm-foot-done' },
              h('span', null, t('panel.footDone', { n: doneCount })),
              h('button', {
                type: 'button',
                className: 'dshm-link',
                disabled: view.busy,
                onClick: () => { void mutate({ op: 'clearDone' }); },
              }, t('panel.clearDone')))
            : null,
          h('button', {
            type: 'button',
            className: 'dshm-addbtn',
            disabled: !view.sessionId || view.busy,
            title: t('panel.add'),
            onClick: openAdd,
          }, h(PlusGlyph), h('span', { className: 'dshm-addbtn-label' }, t('panel.add')))),
        RESIZE_DIRECTIONS.map((direction) => h('div', {
          key: direction,
          className: `dshm-handle dshm-handle-${direction}`,
          'aria-hidden': 'true',
          onPointerDown: (event) => beginResize(event, direction),
          onPointerMove: moveResize,
          onPointerUp: endResize,
          onPointerCancel: endResize,
        }, direction === 'se' ? h('span', { className: 'dshm-grip' }, h(GripGlyph)) : null)),
        h('div', {
          className: 'dshm-scrim',
          'data-open': drawer ? 'true' : 'false',
          onClick: () => setDrawer(null),
        }),
        h('div', {
          className: 'dshm-drawer',
          'data-open': drawer ? 'true' : 'false',
          role: 'dialog',
          'aria-label': drawer && drawer.mode === 'edit' ? t('drawer.edit') : t('drawer.add'),
        },
          h('div', { className: 'dshm-drawer-head' },
            h('span', { className: 'dshm-drawer-title' },
              drawer && drawer.mode === 'edit' ? t('drawer.edit') : t('drawer.add')),
            h('button', {
              type: 'button',
              className: 'dshm-iconbtn',
              title: t('drawer.close'),
              'aria-label': t('drawer.close'),
              onClick: () => setDrawer(null),
            }, h(CloseGlyph))),
          h('input', {
            ref: titleInputRef,
            className: 'dshm-field',
            value: drawer ? drawer.title : '',
            maxLength: 200,
            placeholder: t('field.title'),
            'aria-label': t('field.title'),
            onChange: (event) => setDrawer((current) => (current ? { ...current, title: event.target.value } : current)),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submitDrawer();
              }
            },
          }),
          h('textarea', {
            className: 'dshm-field dshm-field-area',
            value: drawer ? drawer.detail : '',
            maxLength: 4000,
            rows: 3,
            placeholder: t('field.detail'),
            'aria-label': t('field.detail'),
            onChange: (event) => setDrawer((current) => (current ? { ...current, detail: event.target.value } : current)),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void submitDrawer();
              }
            },
          }),
          h('div', { className: 'dshm-drawer-foot' },
            h('span', { className: 'dshm-hint' }, t('drawer.hint')),
            h('button', { type: 'button', className: 'dshm-ghost', onClick: () => setDrawer(null) }, t('editor.cancel')),
            h('button', {
              type: 'button',
              className: 'dshm-primary',
              disabled: !drawer || view.busy || !drawer.title.trim(),
              onClick: () => { void submitDrawer(); },
            }, drawer && drawer.mode === 'edit' ? t('editor.save') : t('drawer.submit')))));

      return h(React.Fragment, null, panel, renderSettingsWindow());
    }

    // ---------------------------------------------------------------- 样式
    const CSS = `
.dshm-toggle{position:relative;--dshm-accent:var(--dsw-alias-state-success-primary);display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:none;padding:0;margin:0;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;cursor:pointer;outline:none;transition:background 160ms ease,color 160ms ease,transform 120ms ease}
.dshm-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshm-toggle:active{transform:scale(.93)}
.dshm-toggle[data-open="true"]{color:var(--dshm-accent);background:color-mix(in srgb,var(--dshm-accent) 13%,transparent)}
.dshm-toggle:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dshm-accent) 55%,transparent)}
.dshm-dot{position:absolute;top:3px;right:3px;width:5px;height:5px;border-radius:50%;background:var(--dshm-accent);box-shadow:0 0 0 1.5px var(--dsw-alias-bg-base),0 0 7px color-mix(in srgb,var(--dshm-accent) 55%,transparent);pointer-events:none}
.dshm-toggle[data-pulse="true"]::after{content:"";position:absolute;inset:-4px;border-radius:11px;border:1.5px solid color-mix(in srgb,var(--dshm-accent) 70%,transparent);animation:dshm-ring 1.5s ease-out 2;pointer-events:none}
@keyframes dshm-ring{0%{opacity:.9;transform:scale(.84)}70%{opacity:0;transform:scale(1.12)}100%{opacity:0}}
.dshm-panel{position:fixed;z-index:60;--dshm-accent:var(--dsw-alias-state-success-primary);--dshm-fs:1;display:flex;flex-direction:column;box-sizing:border-box;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);border-radius:16px;background:var(--dsw-alias-bg-layer-1);background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 87%,transparent);background-image:radial-gradient(130% 90% at 100% 0%,color-mix(in srgb,var(--dshm-accent) 7%,transparent),transparent 58%);-webkit-backdrop-filter:blur(24px) saturate(1.35);backdrop-filter:blur(24px) saturate(1.35);box-shadow:0 1px 2px rgba(0,0,0,.28),0 14px 36px -16px rgba(0,0,0,.55),0 44px 96px -40px rgba(0,0,0,.62);color:var(--dsw-alias-label-primary);font-family:inherit;text-align:left;overflow:hidden;visibility:hidden;opacity:0;transform:translate(calc(100% + 44px),0) scale(.985);transform-origin:right center;pointer-events:none;transition:transform 380ms cubic-bezier(.22,.9,.26,1),opacity 260ms ease,visibility 0s linear 380ms;will-change:transform,opacity}
.dshm-panel::before{content:"";position:absolute;top:0;left:18px;right:18px;height:1px;z-index:1;pointer-events:none;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent) 28%,color-mix(in srgb,var(--dsw-alias-label-primary) 14%,transparent) 72%,transparent)}
.dshm-panel[data-open="true"]{visibility:visible;opacity:1;transform:translate(0,0) scale(1);pointer-events:auto;transition:transform 380ms cubic-bezier(.22,.9,.26,1),opacity 260ms ease,visibility 0s linear 0s}
.dshm-panel:focus{outline:none}
.dshm-panel[data-dragging="true"],.dshm-panel[data-resizing="true"]{user-select:none}
.dshm-panel *{box-sizing:border-box}
.dshm-head{display:flex;align-items:center;gap:7px;flex:none;padding:13px 12px 11px 15px;cursor:grab;touch-action:none}
.dshm-panel[data-dragging="true"] .dshm-head{cursor:grabbing}
.dshm-mark{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;border-radius:8px;background:color-mix(in srgb,var(--dshm-accent) 13%,transparent);color:var(--dshm-accent)}
.dshm-headtext{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.dshm-title{font-size:calc(13px * var(--dshm-fs,1));line-height:calc(18px * var(--dshm-fs,1));font-weight:600;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshm-sub{font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshm-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;padding:0;border:none;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background 150ms ease,color 150ms ease,transform 150ms ease}
.dshm-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshm-iconbtn:active{transform:scale(.92)}
.dshm-iconbtn:disabled{opacity:.4;cursor:default}
.dshm-iconbtn:disabled:hover{background:transparent;color:var(--dsw-alias-label-tertiary)}
.dshm-iconbtn:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dshm-accent) 50%,transparent);outline:none}
.dshm-rule{flex:none;height:1px;margin:0 14px;background:linear-gradient(90deg,transparent,var(--dsw-alias-border-l1) 16%,var(--dsw-alias-border-l1) 84%,transparent)}
.dshm-list{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;margin-right:5px;padding:8px 9px 7px;display:flex;flex-direction:column;gap:2px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.dshm-list::-webkit-scrollbar{width:8px}
.dshm-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px;border:2px solid transparent;background-clip:content-box}
.dshm-list::-webkit-scrollbar-track{background:transparent}
.dshm-item{display:flex;gap:10px;padding:8px 9px;border-radius:10px;transition:background 140ms ease,box-shadow 140ms ease}
.dshm-item:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 62%,transparent);box-shadow:inset 2px 0 0 color-mix(in srgb,var(--dshm-accent) 40%,transparent)}
.dshm-check{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;flex:none;margin-top:2px;padding:0;border:1.5px solid var(--dsw-alias-border-l2);border-radius:50%;background:transparent;color:transparent;cursor:pointer;outline:none;transition:border-color 150ms ease,background 150ms ease,color 150ms ease,transform 120ms ease}
.dshm-check:hover{border-color:var(--dsw-alias-state-success-primary)}
.dshm-check:active{transform:scale(.88)}
.dshm-check[data-done="true"]{background:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-bg-base)}
.dshm-check:focus-visible{box-shadow:0 0 0 2.5px color-mix(in srgb,var(--dsw-alias-state-success-primary) 32%,transparent)}
.dshm-check:disabled{opacity:.45;cursor:default}
.dshm-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
.dshm-item-head{display:flex;align-items:flex-start;gap:6px}
.dshm-item-title{flex:1 1 auto;min-width:0;font-size:calc(12.5px * var(--dshm-fs,1));line-height:calc(18px * var(--dshm-fs,1));font-weight:500;word-break:break-word;cursor:pointer;border-radius:4px;outline:none}
.dshm-item-title:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dshm-accent) 42%,transparent)}
.dshm-item[data-done="true"] .dshm-item-title{color:var(--dsw-alias-label-tertiary);text-decoration:line-through;text-decoration-thickness:1px;font-weight:400}
.dshm-src{flex:none;margin-top:2px;height:14px;padding:0 5px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 85%,transparent);border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:calc(9px * var(--dshm-fs,1));line-height:calc(12px * var(--dshm-fs,1));font-weight:600;letter-spacing:.04em}
.dshm-item-detail{margin:0;font-size:calc(11.5px * var(--dshm-fs,1));line-height:calc(16.5px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer;border-radius:4px}
.dshm-item-detail:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--dshm-accent) 42%,transparent)}
.dshm-item-detail[data-expanded="true"]{display:block;-webkit-line-clamp:unset;overflow:visible}
.dshm-item[data-done="true"] .dshm-item-detail{opacity:.72}
.dshm-item-meta{display:flex;align-items:center;gap:8px;min-height:18px;margin-top:1px}
.dshm-time{font-size:calc(10px * var(--dshm-fs,1));line-height:calc(14px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dshm-item-actions{margin-left:auto;display:flex;align-items:center;gap:1px;opacity:0;transition:opacity 140ms ease}
.dshm-item:hover .dshm-item-actions,.dshm-item:focus-within .dshm-item-actions{opacity:1}
.dshm-mini{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:background 140ms ease,color 140ms ease}
.dshm-mini:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dshm-mini[data-danger="true"]:hover{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent);color:var(--dsw-alias-state-error-primary)}
.dshm-mini:disabled{opacity:.4;cursor:default}
.dshm-foot{flex:none;display:flex;flex-direction:column;gap:5px;padding:7px 10px 9px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 34%,transparent)}
.dshm-foot-done{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:calc(10px * var(--dshm-fs,1));line-height:calc(14px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary)}
.dshm-addbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:32px;padding:0 10px;border:1px dashed color-mix(in srgb,var(--dsw-alias-border-l2) 90%,transparent);border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:calc(11.5px * var(--dshm-fs,1));font-weight:500;cursor:pointer;transition:border-color 150ms ease,background 150ms ease,color 150ms ease,transform 120ms ease}
.dshm-addbtn svg{color:color-mix(in srgb,var(--dshm-accent) 72%,var(--dsw-alias-label-secondary))}
.dshm-addbtn:hover:not(:disabled){border-color:color-mix(in srgb,var(--dshm-accent) 48%,var(--dsw-alias-border-l2));background:color-mix(in srgb,var(--dshm-accent) 8%,transparent);color:var(--dsw-alias-label-primary)}
.dshm-addbtn:hover:not(:disabled) svg{color:var(--dshm-accent)}
.dshm-addbtn:active:not(:disabled){transform:scale(.99)}
.dshm-addbtn:disabled{opacity:.45;cursor:default}
.dshm-addbtn-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-field{width:100%;padding:6px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:calc(12.5px * var(--dshm-fs,1));line-height:calc(18px * var(--dshm-fs,1));outline:none;transition:border-color 150ms ease,box-shadow 150ms ease}
.dshm-field::placeholder{color:var(--dsw-alias-label-tertiary)}
.dshm-field:focus{border-color:color-mix(in srgb,var(--dshm-accent) 62%,var(--dsw-alias-border-l1));box-shadow:0 0 0 3px color-mix(in srgb,var(--dshm-accent) 15%,transparent)}
.dshm-field-area{min-height:56px;max-height:150px;resize:none}
.dshm-primary{height:26px;padding:0 12px;border:none;border-radius:8px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font-family:inherit;font-size:calc(11.5px * var(--dshm-fs,1));font-weight:600;letter-spacing:.01em;cursor:pointer;transition:filter 140ms ease,transform 120ms ease,opacity 140ms ease}
.dshm-primary:hover:not(:disabled){filter:brightness(1.1)}
.dshm-primary:active:not(:disabled){transform:scale(.97)}
.dshm-primary:disabled{opacity:.4;cursor:default}
.dshm-ghost{height:26px;padding:0 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:calc(11.5px * var(--dshm-fs,1));cursor:pointer}
.dshm-ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshm-link{padding:0;border:none;background:transparent;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:calc(10px * var(--dshm-fs,1));line-height:calc(14px * var(--dshm-fs,1));cursor:pointer;text-decoration:underline;text-underline-offset:2px}
.dshm-link:hover{color:var(--dsw-alias-label-secondary)}
.dshm-link:disabled{opacity:.5;cursor:default}
.dshm-empty{margin:12px 8px;padding:20px 16px;border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;text-align:center;font-size:calc(11.5px * var(--dshm-fs,1));line-height:calc(18px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);white-space:pre-line}
.dshm-error{display:flex;align-items:baseline;gap:4px;flex:none;margin:0 12px 8px;padding:6px 9px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));word-break:break-word}
.dshm-handle{position:absolute;z-index:1;touch-action:none}
.dshm-handle-n{top:0;left:14px;right:14px;height:5px;cursor:ns-resize}
.dshm-handle-s{bottom:0;left:14px;right:14px;height:5px;cursor:ns-resize}
.dshm-handle-e{top:14px;right:0;bottom:14px;width:5px;cursor:ew-resize}
.dshm-handle-w{top:14px;left:0;bottom:14px;width:5px;cursor:ew-resize}
.dshm-handle-ne{top:0;right:0;width:14px;height:14px;cursor:nesw-resize}
.dshm-handle-nw{top:0;left:0;width:14px;height:14px;cursor:nwse-resize}
.dshm-handle-se{right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize}
.dshm-handle-sw{left:0;bottom:0;width:14px;height:14px;cursor:nesw-resize}
.dshm-grip{display:flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--dsw-alias-label-tertiary);opacity:.5;pointer-events:none;transition:opacity 140ms ease}
.dshm-panel:hover .dshm-grip{opacity:.9}
.dshm-scrim{position:absolute;inset:0;z-index:2;border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 30%,transparent);opacity:0;pointer-events:none;transition:opacity 200ms ease}
.dshm-scrim[data-open="true"]{opacity:1;pointer-events:auto}
.dshm-drawer{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;flex-direction:column;gap:8px;max-height:88%;overflow-y:auto;padding:13px 14px 15px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 80%,transparent);border-radius:16px 16px 0 0;background:var(--dsw-alias-bg-layer-1);background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 93%,transparent);background-image:radial-gradient(120% 70% at 0% 0%,color-mix(in srgb,var(--dshm-accent) 5%,transparent),transparent 60%);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);box-shadow:0 -1px 0 color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent),0 -26px 60px -28px rgba(0,0,0,.65);visibility:hidden;transform:translateY(calc(100% + 10px));transition:transform 280ms cubic-bezier(.22,.9,.26,1),visibility 0s linear 280ms}
.dshm-drawer[data-open="true"]{visibility:visible;transform:translateY(0);transition:transform 280ms cubic-bezier(.22,.9,.26,1),visibility 0s linear 0s}
.dshm-drawer-head{display:flex;align-items:center;gap:8px}
.dshm-drawer-title{flex:1 1 auto;min-width:0;font-size:calc(12px * var(--dshm-fs,1));line-height:calc(18px * var(--dshm-fs,1));font-weight:600;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshm-drawer-foot{display:flex;align-items:center;gap:8px}
.dshm-hint{flex:1 1 auto;min-width:0;font-size:calc(10px * var(--dshm-fs,1));line-height:calc(14px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-win-scrim{position:fixed;inset:0;z-index:70;background:color-mix(in srgb,var(--dsw-alias-bg-base) 42%,transparent);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);pointer-events:auto}
.dshm-win{position:fixed;z-index:71;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);border-radius:16px;background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 90%,transparent);background-image:radial-gradient(120% 80% at 100% 0%,color-mix(in srgb,var(--dshm-accent) 6%,transparent),transparent 60%);-webkit-backdrop-filter:blur(26px) saturate(1.3);backdrop-filter:blur(26px) saturate(1.3);box-shadow:0 1px 2px rgba(0,0,0,.3),0 18px 44px -16px rgba(0,0,0,.6),0 60px 120px -50px rgba(0,0,0,.7);color:var(--dsw-alias-label-primary);font-family:inherit;outline:none;pointer-events:auto;--dshm-accent:var(--dsw-alias-state-success-primary)}
.dshm-win *{box-sizing:border-box}
.dshm-win-head{display:flex;align-items:center;gap:9px;flex:none;padding:12px 12px 11px 15px;cursor:grab;touch-action:none;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent)}
.dshm-win-head:active{cursor:grabbing}
.dshm-win-mark{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;border-radius:8px;background:color-mix(in srgb,var(--dshm-accent) 13%,transparent);color:var(--dshm-accent)}
.dshm-win-title{flex:1 1 auto;min-width:0;font-size:calc(14px * var(--dshm-fs,1));line-height:calc(20px * var(--dshm-fs,1));font-weight:600;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dshm-win-tabs{display:flex;gap:4px;flex:none;padding:8px 12px 0}
.dshm-win-tab{height:28px;padding:0 11px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:calc(11.5px * var(--dshm-fs,1));font-weight:500;cursor:pointer;transition:background 140ms ease,color 140ms ease}
.dshm-win-tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshm-win-tab[data-active="true"]{background:color-mix(in srgb,var(--dshm-accent) 12%,transparent);color:var(--dshm-accent)}
.dshm-win-body{flex:1 1 auto;min-height:0;display:flex;flex-direction:row}
.dshm-win-nav{flex:0 0 180px;display:flex;flex-direction:column;gap:2px;padding:10px;border-right:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);overflow-y:auto}
.dshm-win-navitem{display:flex;align-items:center;min-height:34px;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;line-height:1.35;font-size:calc(13px * var(--dshm-fs,1));text-align:left;cursor:pointer;transition:background 140ms ease,color 140ms ease}
.dshm-win-navitem:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dshm-win-navitem[data-active="true"]{background:color-mix(in srgb,var(--dshm-accent) 12%,transparent);color:var(--dshm-accent);font-weight:600}
.dshm-win-content{flex:1 1 auto;min-width:0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:12px 14px 14px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.dshm-win-content::-webkit-scrollbar{width:8px}
.dshm-win-content::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px;border:2px solid transparent;background-clip:content-box}
.dshm-card{display:flex;flex-direction:column;gap:8px;padding:10px 12px 12px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 46%,transparent);box-shadow:0 1px 2px rgba(0,0,0,.12),0 10px 24px -18px rgba(0,0,0,.38)}
.dshm-card-head{display:flex;align-items:baseline;gap:8px}
.dshm-card-title{font-size:calc(13px * var(--dshm-fs,1));line-height:calc(17px * var(--dshm-fs,1));font-weight:600;letter-spacing:.01em;color:var(--dsw-alias-label-primary)}
.dshm-card-hint{font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary)}
.dshm-card-body{display:flex;flex-direction:column;gap:8px}
.dshm-win-image{display:flex;flex-direction:column;gap:6px}
.dshm-win-image-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshm-filebtn{display:inline-flex;align-items:center;height:28px;padding:0 11px;border:1px dashed color-mix(in srgb,var(--dshm-accent) 45%,var(--dsw-alias-border-l2));border-radius:8px;color:var(--dsw-alias-label-secondary);font-size:calc(12px * var(--dshm-fs,1));cursor:pointer;transition:background 140ms ease,color 140ms ease}
.dshm-filebtn:hover{background:color-mix(in srgb,var(--dshm-accent) 8%,transparent);color:var(--dsw-alias-label-primary)}
.dshm-filebtn input{display:none}
.dshm-win-select{height:28px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:calc(12px * var(--dshm-fs,1));outline:none}
.dshm-win-select:focus{border-color:color-mix(in srgb,var(--dshm-accent) 60%,var(--dsw-alias-border-l1))}
.dshm-font-sample{margin-top:2px;padding:8px 10px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 45%,transparent);color:var(--dsw-alias-label-secondary);line-height:1.5}
.dshm-win-pane{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:8px}
.dshm-win-toolbar{flex:none}
.dshm-win-hintline{flex:none;font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary)}
.dshm-win-list{flex:1 1 auto;min-height:0;overflow-y:auto;padding-right:4px;margin-right:-4px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.dshm-win-list::-webkit-scrollbar{width:8px}
.dshm-win-list::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px;border:2px solid transparent;background-clip:content-box}
.dshm-win-group{display:flex;flex-direction:column;gap:5px}
.dshm-win-grouptitle{font-size:calc(10px * var(--dshm-fs,1));line-height:calc(14px * var(--dshm-fs,1));font-weight:600;letter-spacing:.06em;color:var(--dsw-alias-label-tertiary);text-transform:uppercase}
.dshm-win-row{display:flex;align-items:center;gap:8px}
.dshm-win-rowtext{flex:0 0 150px;min-width:0;display:flex;flex-direction:column;gap:0}
.dshm-win-rowlabel{font-size:calc(12.5px * var(--dshm-fs,1));line-height:calc(17px * var(--dshm-fs,1));color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-win-rowkey{font-size:calc(10px * var(--dshm-fs,1));line-height:calc(13px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-win-input{flex:1 1 auto;min-width:0}
.dshm-win-empty{padding:24px 16px;text-align:center;font-size:calc(12.5px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary)}
.dshm-win-modes{display:flex;gap:4px;flex-wrap:wrap}
.dshm-win-mode{height:28px;padding:0 11px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 90%,transparent);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:calc(12px * var(--dshm-fs,1));cursor:pointer;transition:border-color 140ms ease,background 140ms ease,color 140ms ease}
.dshm-win-mode:hover{border-color:color-mix(in srgb,var(--dshm-accent) 40%,var(--dsw-alias-border-l2));color:var(--dsw-alias-label-primary)}
.dshm-win-mode[data-active="true"]{border-color:color-mix(in srgb,var(--dshm-accent) 55%,transparent);background:color-mix(in srgb,var(--dshm-accent) 10%,transparent);color:var(--dsw-alias-label-primary)}
.dshm-win-rows{display:flex;flex-direction:column;gap:7px}
.dshm-win-rowfield{display:flex;align-items:center;gap:10px}
.dshm-win-rowfield-wide{flex-wrap:wrap}
.dshm-win-fieldlabel{flex:0 0 84px;font-size:calc(12px * var(--dshm-fs,1));line-height:calc(16px * var(--dshm-fs,1));color:var(--dsw-alias-label-secondary)}
.dshm-win-value{flex:0 0 48px;text-align:right;font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dshm-win-color{width:34px;height:24px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;cursor:pointer}
.dshm-win-range{flex:1 1 auto;min-width:0;accent-color:var(--dshm-accent)}
.dshm-win-rowfield-wide .dshm-field{flex:1 1 100%}
.dshm-win-preview{display:flex;align-items:center;gap:10px;padding-top:4px}
.dshm-win-preview-label{flex:0 0 76px;font-size:calc(11px * var(--dshm-fs,1));color:var(--dsw-alias-label-secondary)}
.dshm-win-preview-box{flex:1 1 auto;height:64px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 80%,transparent);border-radius:10px;background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 60%,transparent);background-image:radial-gradient(120% 90% at 100% 0%,color-mix(in srgb,var(--dshm-accent) 8%,transparent),transparent 60%);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}
.dshm-win-preview-box[data-theme="true"]{background-color:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 88%,transparent);background-image:radial-gradient(130% 90% at 100% 0%,color-mix(in srgb,var(--dshm-accent) 7%,transparent),transparent 58%)}
.dshm-win-foot{flex:none;display:flex;align-items:center;gap:8px;padding:10px 12px 12px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);margin-top:8px}
.dshm-win-foot .dshm-link{margin-right:auto;flex:none}
.dshm-win-error{flex:1 1 auto;min-width:0;font-size:calc(10.5px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1));color:var(--dsw-alias-state-error-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshm-win-foot .dshm-primary,.dshm-win-foot .dshm-ghost{height:30px;padding:0 14px;font-size:calc(12.5px * var(--dshm-fs,1))}
.dshm-win-foot .dshm-link{font-size:calc(11px * var(--dshm-fs,1));line-height:calc(15px * var(--dshm-fs,1))}
@media (hover:none){.dshm-item-actions{opacity:1}.dshm-grip{opacity:.8}}
@media (prefers-reduced-motion:reduce){.dshm-panel,.dshm-drawer,.dshm-scrim,.dshm-toggle[data-pulse="true"]::after{transition:none;animation:none}}
`;

    function Styles() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } });
    }

    // ---------------------------------------------------------------- 注册
    function apply(ctx) {
      try {
        localeService = ctx.locale || null;
        if (localeService) {
          ctx.effect(() => {
            const disposers = [
              localeService.register(NS, 'zh', zh),
              localeService.register(NS, 'en', en),
            ];
            return () => {
              for (const dispose of disposers) dispose();
            };
          }, 'dsh-memo: 文案字典');
          translate = localeService.bind(NS);
          ctx.effect(() => localeService.subscribe(() => emit()), 'dsh-memo: 语言切换');
        }
      } catch (error) {
        console.error('[dsh-memo] 注册语言字典失败：', error);
      }

      ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
        name: 'conversation.session.header.utilities',
        id: 'memo-toggle',
        order: 40,
        label: () => t('toggle.label'),
      }, (ownerProps) => h(React.Fragment, null, h(Styles), h(MemoToggle, ownerProps || {}))));

      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'memo-panel',
        order: 5,
      }, () => h(React.Fragment, null, h(Styles), h(MemoPanel))));
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
