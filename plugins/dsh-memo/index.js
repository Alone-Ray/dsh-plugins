/**
 * Host half of @local/dsh-memo.
 *
 * 每个会话一份独立的「备忘 / 需求列表」，唯一真相在这里：
 *   1. 持久化到本机 profile 目录下的 `.dsh-memo/memos.json`，重启不丢；
 *   2. 通过同源 HTTP 路由 `/dsh-memo/api?session=<id>` 给浏览器半读写；
 *   3. 注册 `memo` 工具，按调用它的 Agent 所属会话读写同一份列表。
 *
 * 浏览器半只负责渲染与动画，所有校验、排序、持久化都在这里完成，
 * 因此 UI 操作与 AI 工具走的是同一条写路径。
 */
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const ROUTE = '/dsh-memo/api'
const SETTINGS_ROUTE = '/dsh-memo/settings'
const BACKGROUND_ROUTE = '/dsh-memo/background'
const STORE_VERSION = 4
const MAX_ITEMS = 200
const MAX_SESSIONS = 100
const MAX_TITLE = 200
const MAX_DETAIL = 4000
const MAX_BODY_BYTES = 64 * 1024
const MAX_SETTINGS_BODY_BYTES = 8 * 1024 * 1024
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_SESSION_KEY = 100
const MAX_TEXTS = 120
const MAX_TEXT_VALUE = 400

const COLOR_RE = /^#[0-9a-fA-F]{6}$/
const IMAGE_FILE_RE = /^background\.(png|jpg|jpeg|webp|gif)$/
const IMAGE_DATA_RE = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/i
const TEXT_KEY_RE = /^[a-zA-Z0-9._-]{1,64}$/

const IMAGE_EXTENSIONS = { png: 'png', jpeg: 'jpg', webp: 'webp', gif: 'gif' }
const IMAGE_CONTENT_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' }
const LANGUAGE_VALUES = ['auto', 'zh', 'en']

export const inject = ['tools', 'systemPrompt']

/** 弹窗外观的默认值。 */
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
  }
}

/** 插件设置：文案覆盖 + 弹窗背景 + 字号 / 语言。 */
function defaultSettings() {
  return { texts: {}, background: defaultBackground(), language: 'auto', fontSize: 13 }
}

/** 列表里的一条需求；字段都是 JSON 安全的原始值。 */
function emptyState() {
  return { version: STORE_VERSION, sessions: {}, settings: defaultSettings() }
}

/**
 * 数据目录：优先当前 profile，其次 DSH home，最后 `~/.dsh`。
 * @returns 存放 memos.json 的绝对目录。
 */
function storeDirectory() {
  const profile = process.env.DSH_PROFILE_DIR
  if (profile) return join(profile, '.dsh-memo')
  const home = process.env.DSH_HOME
  if (home) return join(home, '.dsh-memo')
  return join(homedir(), '.dsh', '.dsh-memo')
}

let storeFile = ''
let state = emptyState()
/** v1 的全局条目：第一次有会话读列表时认领到该会话，然后清空。 */
let legacyItems = null
let idCounter = 0

function now() {
  return Date.now()
}

function nextId() {
  idCounter += 1
  return `m-${now().toString(36)}-${idCounter.toString(36)}`
}

/**
 * 把任意标题压成合法文本。
 * @param value - 原始输入。
 * @param max - 上限字符数。
 * @returns 去掉首尾空白并截断后的文本。
 */
function text(value, max) {
  if (typeof value !== 'string') return ''
  const trimmed = value.replace(/\r\n/g, '\n').trim()
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

/**
 * 把数值夹在区间内；非数字退回默认值。
 * @param value - 原始值。
 * @param min - 下限。
 * @param max - 上限。
 * @param fallback - 非法值的回退。
 * @returns 合法数值。
 */
function clampValue(value, min, max, fallback) {
  const number = typeof value === 'number' && Number.isFinite(value) ? value : fallback
  return Math.min(max, Math.max(min, number))
}

/**
 * 规范化弹窗背景设置；非法值一律退回默认，保证渲染侧拿到的都是安全值。
 * @param raw - 用户提交的背景。
 * @returns 完整背景设置。
 */
function normalizeBackground(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const defaults = defaultBackground()
  const mode = ['theme', 'color', 'gradient', 'image'].includes(source.mode) ? source.mode : defaults.mode
  const color = typeof source.color === 'string' && COLOR_RE.test(source.color) ? source.color : defaults.color
  const gradientFrom = typeof source.gradientFrom === 'string' && COLOR_RE.test(source.gradientFrom)
    ? source.gradientFrom
    : defaults.gradientFrom
  const gradientTo = typeof source.gradientTo === 'string' && COLOR_RE.test(source.gradientTo)
    ? source.gradientTo
    : defaults.gradientTo
  const imageFile = typeof source.imageFile === 'string' && IMAGE_FILE_RE.test(source.imageFile)
    ? source.imageFile
    : ''
  const imageVersion = imageFile && Number.isFinite(source.imageVersion) ? source.imageVersion : 0
  return {
    mode,
    color,
    opacity: clampValue(source.opacity, 0.5, 1, defaults.opacity),
    blur: clampValue(source.blur, 0, 40, defaults.blur),
    gradientFrom,
    gradientTo,
    gradientAngle: clampValue(source.gradientAngle, 0, 360, defaults.gradientAngle),
    imageShade: clampValue(source.imageShade, 0, 90, defaults.imageShade),
    imageFile,
    imageVersion,
  }
}

/**
 * 规范化文案覆盖表：只接受短键与短值，空值视为“用回默认”。
 * @param raw - 用户提交的覆盖表。
 * @returns 干净的覆盖表。
 */
function normalizeTexts(raw) {
  const texts = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return texts
  let count = 0
  for (const [key, value] of Object.entries(raw)) {
    if (count >= MAX_TEXTS) break
    if (!TEXT_KEY_RE.test(key) || typeof value !== 'string') continue
    const trimmed = value.slice(0, MAX_TEXT_VALUE).trim()
    if (!trimmed) continue
    texts[key] = trimmed
    count += 1
  }
  return texts
}

/**
 * 规范化整份设置。
 * @param raw - 提交或已存的设置。
 * @returns 完整设置。
 */
function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return {
    texts: normalizeTexts(source.texts),
    background: normalizeBackground(source.background),
    language: LANGUAGE_VALUES.includes(source.language) ? source.language : 'auto',
    fontSize: clampValue(source.fontSize, 11, 17, 13),
  }
}

/**
 * 校验并规范化会话 id；id 会作为对象键使用，因此拒绝空值与控制字符。
 * @param value - 原始会话 id。
 * @returns 合法 id，或 undefined。
 */
function sessionKey(value) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_SESSION_KEY) return undefined
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return undefined
  return trimmed
}

const STATUSES = ['open', 'done']
const SOURCES = ['user', 'ai']

/**
 * 规范化一条已存条目；坏数据整条丢弃，不让它拖垮整个列表。
 * @param raw - 存储里的原始条目。
 * @returns 规范化条目，或 undefined。
 */
function normalizeItem(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const title = text(raw.title, MAX_TITLE)
  if (!title) return undefined
  const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : now()
  const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : createdAt
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : nextId(),
    title,
    detail: text(raw.detail, MAX_DETAIL),
    status: STATUSES.includes(raw.status) ? raw.status : 'open',
    source: SOURCES.includes(raw.source) ? raw.source : 'user',
    createdAt,
    updatedAt,
  }
}

/**
 * 从磁盘读入数据；文件缺失或损坏时退回空状态。
 * v1 的全局条目先收进内存，等第一个会话读列表时认领。
 * @returns 规范化后的状态。
 */
function loadState() {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(storeFile, 'utf8'))
  } catch {
    return emptyState()
  }
  if (parsed === null || typeof parsed !== 'object') return emptyState()

  // v1：{ version: 1, items: [...] } —— 全部条目暂存为 legacy。
  if (Array.isArray(parsed.items)) {
    legacyItems = parsed.items.map(normalizeItem).filter(Boolean).slice(0, MAX_ITEMS)
    return emptyState()
  }

  const fresh = emptyState()
  if (!parsed.sessions || typeof parsed.sessions !== 'object' || Array.isArray(parsed.sessions)) return fresh
  for (const [rawKey, rawBucket] of Object.entries(parsed.sessions)) {
    const key = sessionKey(rawKey)
    if (!key || !rawBucket || typeof rawBucket !== 'object') continue
    if (!Array.isArray(rawBucket.items)) continue
    const seen = new Set()
    const items = []
    for (const raw of rawBucket.items) {
      const item = normalizeItem(raw)
      if (!item || seen.has(item.id)) continue
      seen.add(item.id)
      items.push(item)
      if (items.length >= MAX_ITEMS) break
    }
    if (items.length > 0) fresh.sessions[key] = { items }
  }
  fresh.settings = normalizeSettings(parsed.settings)
  return fresh
}

/** 会话的条目数组；不存在时返回 undefined。 */
function itemsOf(sessionId) {
  const bucket = state.sessions[sessionId]
  return bucket ? bucket.items : undefined
}

/** 取会话的桶，不存在就建一个空桶（不落盘）。 */
function bucketOf(sessionId) {
  if (!state.sessions[sessionId]) state.sessions[sessionId] = { items: [] }
  return state.sessions[sessionId]
}

/** 把 v1 的全局条目认领到当前会话。 */
function claimLegacy(sessionId) {
  if (!legacyItems) return
  const bucket = bucketOf(sessionId)
  for (const item of legacyItems) {
    if (bucket.items.length >= MAX_ITEMS) break
    bucket.items.push(item)
  }
  legacyItems = null
  persist()
}

/**
 * 原子写盘：先写临时文件再替换，避免半截 JSON。
 * 同时丢掉空会话，并按最近更新时间把会话数量收在上限内。
 */
function persist() {
  try {
    const entries = Object.entries(state.sessions)
      .filter(([, bucket]) => bucket.items.length > 0)
      .map(([key, bucket]) => [key, bucket, bucket.items.reduce((max, item) => Math.max(max, item.updatedAt), 0)])
      .sort((left, right) => right[2] - left[2])
      .slice(0, MAX_SESSIONS)
    const sessions = {}
    for (const [key, bucket] of entries) sessions[key] = bucket
    state = { version: STORE_VERSION, sessions, settings: normalizeSettings(state.settings) }

    mkdirSync(dirname(storeFile), { recursive: true })
    const temporary = `${storeFile}.tmp`
    writeFileSync(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    renameSync(temporary, storeFile)
  } catch (error) {
    console.error('[dsh-memo] 保存备忘列表失败：', error)
  }
}

/** 打开 / 已完成的排序：进行中在前，各自按最近更新倒序。 */
function ordered(items) {
  return items.slice().sort((left, right) => {
    if (left.status !== right.status) return left.status === 'open' ? -1 : 1
    return right.updatedAt - left.updatedAt
  })
}

/** 工具与接口共同返回的条目视图。 */
function itemView(item) {
  return {
    id: item.id,
    title: item.title,
    detail: item.detail,
    status: item.status,
    source: item.source,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function itemsView(sessionId) {
  return ordered(itemsOf(sessionId) || []).map(itemView)
}

/** 参数错误：路由映射成 400，工具抛出让模型看到原因。 */
class MemoError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MemoError'
  }
}

/**
 * 新增一条需求。
 * @param sessionId - 所属会话。
 * @param input - title / detail / source。
 * @returns 新条目。
 */
function addItem(sessionId, input) {
  const title = text(input.title, MAX_TITLE)
  if (!title) throw new MemoError('需求名不能为空')
  const items = bucketOf(sessionId).items
  if (items.length >= MAX_ITEMS) throw new MemoError(`这个会话最多保存 ${MAX_ITEMS} 条，请先清理已完成的条目`)
  const stamp = now()
  const item = {
    id: nextId(),
    title,
    detail: text(input.detail, MAX_DETAIL),
    status: 'open',
    source: SOURCES.includes(input.source) ? input.source : 'user',
    createdAt: stamp,
    updatedAt: stamp,
  }
  items.push(item)
  persist()
  return item
}

/**
 * 就地修改一条需求。
 * @param sessionId - 所属会话。
 * @param input - id 加上要改的 title / detail / status。
 * @returns 修改后的条目。
 */
function updateItem(sessionId, input) {
  const id = typeof input.id === 'string' ? input.id : ''
  if (!id) throw new MemoError('id 不能为空')
  const item = (itemsOf(sessionId) || []).find((candidate) => candidate.id === id)
  if (!item) throw new MemoError(`找不到条目：${id}`)
  let touched = false
  if (input.title !== undefined) {
    const title = text(input.title, MAX_TITLE)
    if (!title) throw new MemoError('需求名不能为空')
    item.title = title
    touched = true
  }
  if (input.detail !== undefined) {
    item.detail = text(input.detail, MAX_DETAIL)
    touched = true
  }
  if (input.status !== undefined) {
    if (!STATUSES.includes(input.status)) throw new MemoError('status 只能是 open 或 done')
    item.status = input.status
    touched = true
  }
  if (!touched) throw new MemoError('update 至少需要 title、detail 或 status 之一')
  item.updatedAt = now()
  persist()
  return item
}

/**
 * 切换完成状态。
 * @param sessionId - 所属会话。
 * @param input - id。
 * @returns 切换后的条目。
 */
function toggleItem(sessionId, input) {
  const id = typeof input.id === 'string' ? input.id : ''
  if (!id) throw new MemoError('id 不能为空')
  const item = (itemsOf(sessionId) || []).find((candidate) => candidate.id === id)
  if (!item) throw new MemoError(`找不到条目：${id}`)
  item.status = item.status === 'open' ? 'done' : 'open'
  item.updatedAt = now()
  persist()
  return item
}

/**
 * 删除一条需求。
 * @param sessionId - 所属会话。
 * @param input - id。
 * @returns 被删除的条目 id。
 */
function removeItem(sessionId, input) {
  const id = typeof input.id === 'string' ? input.id : ''
  if (!id) throw new MemoError('id 不能为空')
  const items = itemsOf(sessionId) || []
  const index = items.findIndex((candidate) => candidate.id === id)
  if (index < 0) throw new MemoError(`找不到条目：${id}`)
  items.splice(index, 1)
  persist()
  return id
}

/** 清掉当前会话全部已完成条目。@returns 删除的条数。 */
function clearDone(sessionId) {
  const items = itemsOf(sessionId) || []
  const kept = items.filter((item) => item.status !== 'done')
  const removed = items.length - kept.length
  if (removed > 0) {
    state.sessions[sessionId] = { items: kept }
    persist()
  }
  return removed
}

/**
 * 执行一次列表操作；路由与工具共用。
 * @param sessionId - 所属会话。
 * @param op - add / update / toggle / remove / clearDone。
 * @param input - 操作参数。
 * @returns 操作结果。
 */
function applyOperation(sessionId, op, input) {
  switch (op) {
    case 'add': {
      const item = addItem(sessionId, input)
      return { changed: item, op }
    }
    case 'update': {
      const item = updateItem(sessionId, input)
      return { changed: item, op }
    }
    case 'toggle': {
      const item = toggleItem(sessionId, input)
      return { changed: item, op }
    }
    case 'remove': {
      const id = removeItem(sessionId, input)
      return { removed: id, op }
    }
    case 'clearDone': {
      const removed = clearDone(sessionId)
      return { removed, op }
    }
    default:
      throw new MemoError(`不支持的 op：${String(op)}`)
  }
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

function backgroundImagePath(file) {
  return join(storeDirectory(), file)
}

function backgroundContentType(file) {
  const ext = String(file).split('.').pop().toLowerCase()
  return IMAGE_CONTENT_TYPES[ext] || 'application/octet-stream'
}

function removeBackgroundFile(file) {
  if (!file || !IMAGE_FILE_RE.test(file)) return
  try {
    unlinkSync(backgroundImagePath(file))
  } catch {
    // 文件本来就不在。
  }
}

/**
 * 解出 data URL 并把图片落盘；返回新的 imageFile / imageVersion。
 * @param dataUrl - `data:image/...;base64,...`。
 * @returns 新的图片引用。
 */
function saveBackgroundImage(dataUrl) {
  const match = IMAGE_DATA_RE.exec(dataUrl || '')
  if (!match) throw new MemoError('图片格式不支持（PNG / JPEG / WebP / GIF）')
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length === 0) throw new MemoError('图片为空')
  if (buffer.length > MAX_IMAGE_BYTES) throw new MemoError('图片太大（上限 5MB）')
  const file = `background.${IMAGE_EXTENSIONS[match[1].toLowerCase()]}`
  const previous = state.settings.background.imageFile
  mkdirSync(storeDirectory(), { recursive: true })
  const target = backgroundImagePath(file)
  const temporary = `${target}.tmp`
  writeFileSync(temporary, buffer)
  renameSync(temporary, target)
  if (previous && previous !== file) removeBackgroundFile(previous)
  return { imageFile: file, imageVersion: now() }
}

/**
 * 读取一个不超过 MAX_BODY_BYTES 的 JSON 请求体。
 * @param req - HTTP 请求。
 * @returns 解析后的对象（空体返回 {}）。
 */
function readJson(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new MemoError('请求体过大'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new MemoError('请求体必须是 JSON'))
      }
    })
    req.on('error', reject)
  })
}

/** 工具输出：条目集合，附带操作说明。 */
const TOOL_OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    action: { type: 'string' },
    count: { type: 'integer' },
    open: { type: 'integer' },
    message: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' },
          status: { type: 'string', enum: ['open', 'done'] },
          source: { type: 'string', enum: ['user', 'ai'] },
          createdAt: { type: 'number' },
          updatedAt: { type: 'number' },
        },
        required: ['id', 'title', 'detail', 'status', 'source', 'createdAt', 'updatedAt'],
        additionalProperties: false,
      },
    },
  },
  required: ['ok', 'action', 'count', 'open', 'items'],
  additionalProperties: false,
}

/** 工具结果给模型看的正文：只列 id、需求名和一句详情。 */
function renderItems(value) {
  const lines = [`这个会话的备忘列表共 ${value.count} 条，进行中 ${value.open} 条。`]
  if (value.message) lines.push(value.message)
  if (value.items.length === 0) {
    lines.push('（列表为空）')
  } else {
    for (const item of value.items) {
      const mark = item.status === 'done' ? '✓' : '·'
      const source = item.source === 'ai' ? ' [AI 挂起]' : ''
      const detail = item.detail ? ` — ${item.detail.length > 120 ? `${item.detail.slice(0, 120)}…` : item.detail}` : ''
      lines.push(`${mark} [${item.id}] ${item.title}${source}${detail}`)
    }
  }
  return [{ type: 'text', text: lines.join('\n') }]
}

export function apply(ctx) {
  storeFile = join(storeDirectory(), 'memos.json')
  state = loadState()

  ctx.logger?.info?.(`[dsh-memo] 已载入 ${Object.keys(state.sessions).length} 个会话的备忘（${storeFile}）`)

  // ---- 提示词里的固定约定：让每个会话的 AI 都知道这份按会话隔离的列表 ----
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'dsh-memo',
    order: 460,
    text: [
      '## 备忘列表',
      '每个会话右侧都有一份独立的备忘 / 需求列表（面板可拖动、可缩放），用 memo 工具读写当前会话的列表。',
      '- 用户提到想做但暂时不做的事（“先记下来”“以后再说”“下次做”“先放着”）时，主动用 memo（action: "add"）把「需求名 + 关键细节」挂上去，不要只在回复里说“记下了”。',
      '- 一次提到多个需求就逐条 add；细节写用户原话里的约束和验收点。',
      '- 用户问“还有什么没做 / 我的需求”时用 memo（action: "list"）读出来，不要凭记忆回答。',
      '- 已在列表里的不要重复添加；完成状态由用户自己勾选。',
    ].join('\n'),
  }), 'dsh-memo: 系统提示词')

  // ---- 浏览器半的同源读写接口（按 session 查询参数区分会话） ----
  ctx.inject(['webServer'], (webCtx) => webCtx.effect(() => webCtx.webServer.register({
    kind: 'exact',
    path: ROUTE,
    handler: async (req, res) => {
      // 只服务本站页面：跨站请求直接拒绝。
      const connection = webCtx.get('connection')
      if (connection && typeof connection.requestRejection === 'function') {
        const rejection = connection.requestRejection(req)
        if (rejection !== undefined) {
          res.statusCode = rejection
          res.end()
          return
        }
      }

      try {
        if (req.method === 'GET') {
          const url = new URL(req.url || ROUTE, 'http://localhost')
          const sessionId = sessionKey(url.searchParams.get('session'))
          if (!sessionId) {
            sendJson(res, 400, { ok: false, error: '缺少 session 参数' })
            return
          }
          claimLegacy(sessionId)
          const items = itemsView(sessionId)
          sendJson(res, 200, {
            ok: true,
            version: STORE_VERSION,
            sessionId,
            items,
            open: items.filter((item) => item.status === 'open').length,
          })
          return
        }

        if (req.method === 'POST') {
          const body = await readJson(req)
          const sessionId = sessionKey(body.sessionId)
          if (!sessionId) {
            sendJson(res, 400, { ok: false, error: '缺少 sessionId' })
            return
          }
          claimLegacy(sessionId)
          const op = typeof body.op === 'string' ? body.op : ''
          const result = applyOperation(sessionId, op, body)
          const items = itemsView(sessionId)
          sendJson(res, 200, {
            ok: true,
            sessionId,
            op: result.op,
            removed: result.removed,
            changed: result.changed ? itemView(result.changed) : undefined,
            items,
            open: items.filter((item) => item.status === 'open').length,
          })
          return
        }

        res.statusCode = 405
        res.setHeader('allow', 'GET, POST')
        res.end()
      } catch (error) {
        if (error instanceof MemoError) {
          sendJson(res, 400, { ok: false, error: error.message })
          return
        }
        console.error('[dsh-memo] 请求失败：', error)
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'dsh-memo: HTTP 路由'))

  // ---- 设置：文案覆盖 + 弹窗背景（全局，不按会话） ----
  ctx.inject(['webServer'], (webCtx) => webCtx.effect(() => webCtx.webServer.register({
    kind: 'exact',
    path: SETTINGS_ROUTE,
    handler: async (req, res) => {
      // 只服务本站页面：跨站请求直接拒绝。
      const connection = webCtx.get('connection')
      if (connection && typeof connection.requestRejection === 'function') {
        const rejection = connection.requestRejection(req)
        if (rejection !== undefined) {
          res.statusCode = rejection
          res.end()
          return
        }
      }

      try {
        if (req.method === 'GET') {
          sendJson(res, 200, { ok: true, settings: state.settings })
          return
        }

        if (req.method === 'POST') {
          const body = await readJson(req, MAX_SETTINGS_BODY_BYTES)
          const incoming = body.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
            ? body.settings
            : {}
          const incomingBackground = incoming.background && typeof incoming.background === 'object' && !Array.isArray(incoming.background)
            ? incoming.background
            : {}
          let imageFile = state.settings.background.imageFile
          let imageVersion = state.settings.background.imageVersion
          if (typeof incomingBackground.imageData === 'string' && incomingBackground.imageData) {
            const savedImage = saveBackgroundImage(incomingBackground.imageData)
            imageFile = savedImage.imageFile
            imageVersion = savedImage.imageVersion
          } else if (incomingBackground.removeImage === true) {
            removeBackgroundFile(imageFile)
            imageFile = ''
            imageVersion = 0
          }
          state.settings = normalizeSettings({
            ...incoming,
            background: { ...incomingBackground, imageFile, imageVersion },
          })
          persist()
          sendJson(res, 200, { ok: true, settings: state.settings })
          return
        }

        res.statusCode = 405
        res.setHeader('allow', 'GET, POST')
        res.end()
      } catch (error) {
        if (error instanceof MemoError) {
          sendJson(res, 400, { ok: false, error: error.message })
          return
        }
        console.error('[dsh-memo] 保存设置失败：', error)
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'dsh-memo: 设置路由'))

  // ---- 自定义背景图片：本机文件，按版本号缓存 ----
  ctx.inject(['webServer'], (webCtx) => webCtx.effect(() => webCtx.webServer.register({
    kind: 'exact',
    path: BACKGROUND_ROUTE,
    handler: (req, res) => {
      // 只服务本站页面：跨站请求直接拒绝。
      const connection = webCtx.get('connection')
      if (connection && typeof connection.requestRejection === 'function') {
        const rejection = connection.requestRejection(req)
        if (rejection !== undefined) {
          res.statusCode = rejection
          res.end()
          return
        }
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405
        res.setHeader('allow', 'GET, HEAD')
        res.end()
        return
      }

      const file = state.settings.background.imageFile
      if (!file) {
        res.statusCode = 404
        res.end()
        return
      }

      try {
        const data = readFileSync(backgroundImagePath(file))
        res.statusCode = 200
        res.setHeader('content-type', backgroundContentType(file))
        res.setHeader('cache-control', 'private, max-age=31536000, immutable')
        if (req.method === 'HEAD') res.end()
        else res.end(data)
      } catch {
        res.statusCode = 404
        res.end()
      }
    },
  }), 'dsh-memo: 背景图片路由'))

  // ---- AI 侧工具：按调用它的会话读写同一份列表 ----
  ctx.effect(() => ctx.tools.register({
    name: 'memo',
    description: [
      'Read and change the memo pad of THIS conversation: a requirement list floating at the right side of the session.',
      'Use it whenever the user mentions a requirement, idea, or bug they want handled later ("先记下来", "以后再说", "下次做") — park it in this conversation\'s list instead of remembering it only in chat, and use it to answer "还有什么没做".',
      'The list belongs to the calling session; other conversations have their own. Items persist across restarts and are visible to the user in the panel. Items added by you are tagged AI.',
      'Actions: list; add (title, optional detail); update (id plus title/detail/status); remove (id).',
    ].join(' '),
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'add', 'update', 'remove'],
          description: 'list the whole pad, or add/update/remove one item.',
        },
        id: {
          type: 'string',
          description: 'Item id from list; required for update and remove.',
        },
        title: {
          type: 'string',
          description: 'Short requirement name; required for add. Up to 200 characters.',
        },
        detail: {
          type: 'string',
          description: 'Concrete details, acceptance notes, or the constraint the user stated; up to 4000 characters.',
        },
        status: {
          type: 'string',
          enum: ['open', 'done'],
          description: 'Set on update only: done closes the item.',
        },
      },
      required: ['action'],
      additionalProperties: false,
    },
    output: {
      schema: TOOL_OUTPUT_SCHEMA,
      render: (_args, value) => renderItems(value),
    },
    async execute(args, exec) {
      const sessionId = exec && exec.agent && typeof exec.agent.id === 'string' ? exec.agent.id : ''
      if (!sessionId) throw new MemoError('memo 需要一个会话上下文')
      claimLegacy(sessionId)
      const input = args && typeof args === 'object' ? args : {}
      const action = typeof input.action === 'string' ? input.action : ''
      let message = ''
      if (action === 'list') {
        // 只读
      } else if (action === 'add') {
        const item = addItem(sessionId, { title: input.title, detail: input.detail, source: 'ai' })
        message = `已挂到本会话的备忘列表：${item.title}（id: ${item.id}）`
      } else if (action === 'update') {
        const item = updateItem(sessionId, {
          id: input.id,
          title: input.title,
          detail: input.detail,
          status: input.status,
        })
        message = `已更新：${item.title}（id: ${item.id}）`
      } else if (action === 'remove') {
        const id = removeItem(sessionId, input)
        message = `已删除：${id}`
      } else {
        throw new MemoError('action 必须是 list / add / update / remove')
      }
      const items = itemsView(sessionId)
      return {
        ok: true,
        action,
        count: items.length,
        open: items.filter((item) => item.status === 'open').length,
        items,
        message,
      }
    },
  }), 'dsh-memo: memo 工具')
}
