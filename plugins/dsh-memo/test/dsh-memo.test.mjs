// Host-half checks for dsh-memo: per-session routes, the memo tool, settings,
// image upload, persistence and the v1 migration. Run with `node test/dsh-memo.test.mjs`.
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventEmitter } from 'node:events'

const profile = mkdtempSync(join(tmpdir(), 'dsh-memo-test-'))
process.env.DSH_PROFILE_DIR = profile

const moduleUrl = new URL('../index.js', import.meta.url).href

function fakeRequest(method, url, body) {
  const req = new EventEmitter()
  req.method = method
  req.url = url
  req.destroy = () => {}
  process.nextTick(() => {
    if (body !== undefined) req.emit('data', Buffer.from(JSON.stringify(body), 'utf8'))
    req.emit('end')
  })
  return req
}

function fakeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value },
    end(chunk) { if (chunk) this.body += chunk },
  }
}

function makeContext() {
  const ctx = {
    route: null,
    routes: {},
    tool: null,
    logger: { info: () => {} },
    effect: (callback) => callback(),
    inject: (_deps, callback) => callback(ctx),
    get: () => undefined,
    webServer: {
      register: (route) => {
        ctx.routes[route.path] = route
        if (route.path === '/dsh-memo/api') ctx.route = route
        return () => {}
      },
    },
    tools: {
      register: (definition) => { ctx.tool = definition; return () => {} },
    },
    systemPrompt: {
      section: () => () => {},
    },
  }
  return ctx
}

async function get(ctx, sessionId) {
  const res = fakeResponse()
  await ctx.route.handler(fakeRequest('GET', `/dsh-memo/api?session=${encodeURIComponent(sessionId)}`), res)
  return { status: res.statusCode, payload: JSON.parse(res.body) }
}

async function post(ctx, sessionId, body) {
  const res = fakeResponse()
  await ctx.route.handler(fakeRequest('POST', '/dsh-memo/api', { ...body, sessionId }), res)
  return { status: res.statusCode, payload: JSON.parse(res.body) }
}

async function getSettings(ctx) {
  const res = fakeResponse()
  await ctx.routes['/dsh-memo/settings'].handler(fakeRequest('GET', '/dsh-memo/settings'), res)
  return { status: res.statusCode, payload: JSON.parse(res.body) }
}

async function postSettings(ctx, settings) {
  const res = fakeResponse()
  await ctx.routes['/dsh-memo/settings'].handler(fakeRequest('POST', '/dsh-memo/settings', { settings }), res)
  return { status: res.statusCode, payload: JSON.parse(res.body) }
}

const first = await import(`${moduleUrl}?case=1`)
const ctx = makeContext()
first.apply(ctx)
assert.ok(ctx.route, 'memo route registered')
assert.ok(ctx.tool, 'memo tool registered')
assert.ok(ctx.routes['/dsh-memo/settings'], 'settings route registered')
assert.ok(ctx.routes['/dsh-memo/background'], 'background route registered')

// Lists are per conversation.
let reply = await get(ctx, 'session-a')
assert.equal(reply.status, 200)
assert.deepEqual(reply.payload.items, [])

reply = await post(ctx, 'session-a', { op: 'add', title: '  需求甲  ', detail: '详情一' })
assert.equal(reply.status, 200)
assert.equal(reply.payload.items.length, 1)
assert.equal(reply.payload.items[0].title, '需求甲')
assert.equal(reply.payload.items[0].source, 'user')
assert.equal(reply.payload.changed.detail, '详情一')
const userId = reply.payload.items[0].id

reply = await get(ctx, 'session-b')
assert.equal(reply.payload.items.length, 0)

// The tool writes into the calling agent's session.
const toolAgent = { agent: { id: 'session-a' } }
const toolResult = await ctx.tool.execute({ action: 'add', title: 'AI 挂起的乙', detail: '以后做' }, toolAgent)
assert.equal(toolResult.ok, true)
assert.equal(toolResult.count, 2)
assert.equal(toolResult.items.filter((item) => item.source === 'ai').length, 1)
const aiId = toolResult.items.find((item) => item.source === 'ai').id

const toolListB = await ctx.tool.execute({ action: 'list' }, { agent: { id: 'session-b' } })
assert.equal(toolListB.count, 0)

// Done items sink to the bottom.
reply = await post(ctx, 'session-a', { op: 'toggle', id: userId })
assert.equal(reply.payload.changed.status, 'done')
assert.equal(reply.payload.items[reply.payload.items.length - 1].status, 'done', 'done items sort last')
assert.equal(reply.payload.items[0].status, 'open', 'open items stay first')

reply = await post(ctx, 'session-a', { op: 'update', id: aiId, title: 'AI 挂起的乙（改）', status: 'done' })
assert.equal(reply.payload.changed.title, 'AI 挂起的乙（改）')

reply = await post(ctx, 'session-a', { op: 'clearDone' })
assert.equal(reply.payload.items.length, 0)

reply = await post(ctx, 'session-a', { op: 'add', title: '   ' })
assert.equal(reply.status, 400)
assert.match(reply.payload.error, /需求名/)

const resNoSession = fakeResponse()
await ctx.route.handler(fakeRequest('GET', '/dsh-memo/api'), resNoSession)
assert.equal(resNoSession.statusCode, 400)

reply = await post(ctx, 'session-a', { op: 'add', title: '删除我' })
const removedId = reply.payload.changed.id
reply = await post(ctx, 'session-a', { op: 'remove', id: removedId })
assert.equal(reply.payload.op, 'remove')
assert.equal(reply.payload.removed, removedId)

// Persistence across a fresh module instance.
await post(ctx, 'session-a', { op: 'add', title: '持久化检查' })
const file = join(profile, '.dsh-memo', 'memos.json')
const saved = JSON.parse(readFileSync(file, 'utf8'))
assert.equal(saved.version, 4)
assert.equal(saved.sessions['session-a'].items.length, 1)
assert.equal(saved.sessions['session-a'].items[0].title, '持久化检查')

const second = await import(`${moduleUrl}?case=2`)
const ctx2 = makeContext()
second.apply(ctx2)
reply = await get(ctx2, 'session-a')
assert.equal(reply.payload.items.length, 1)
assert.equal(reply.payload.items[0].title, '持久化检查')
reply = await get(ctx2, 'session-b')
assert.equal(reply.payload.items.length, 0)

// Settings: defaults, saving, validation, image upload, persistence.
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

reply = await getSettings(ctx2)
assert.equal(reply.status, 200)
assert.equal(reply.payload.settings.background.mode, 'theme')
assert.equal(reply.payload.settings.language, 'auto')
assert.equal(reply.payload.settings.fontSize, 13)
assert.deepEqual(reply.payload.settings.texts, {})

reply = await postSettings(ctx2, {
  texts: { 'panel.title': '我的备忘' },
  language: 'en',
  fontSize: 15,
  background: {
    mode: 'gradient',
    color: '#112233',
    opacity: 0.8,
    blur: 12,
    gradientFrom: '#112233',
    gradientTo: '#445566',
    gradientAngle: 90,
    imageShade: 50,
  },
})
assert.equal(reply.status, 200)
assert.equal(reply.payload.settings.texts['panel.title'], '我的备忘')
assert.equal(reply.payload.settings.language, 'en')
assert.equal(reply.payload.settings.fontSize, 15)
assert.equal(reply.payload.settings.background.mode, 'gradient')
assert.equal(reply.payload.settings.background.opacity, 0.8)
assert.equal(reply.payload.settings.background.gradientAngle, 90)

// A local image is written to the store and served by its own route.
reply = await postSettings(ctx2, { background: { mode: 'image', imageData: TINY_PNG, imageShade: 40 } })
assert.equal(reply.status, 200)
assert.equal(reply.payload.settings.background.mode, 'image')
assert.equal(reply.payload.settings.background.imageFile, 'background.png')
assert.ok(reply.payload.settings.background.imageVersion > 0)
assert.ok(existsSync(join(profile, '.dsh-memo', 'background.png')), 'image file written')

const backgroundRes = fakeResponse()
await ctx2.routes['/dsh-memo/background'].handler(fakeRequest('GET', '/dsh-memo/background?v=1'), backgroundRes)
assert.equal(backgroundRes.statusCode, 200)
assert.equal(backgroundRes.headers['content-type'], 'image/png')
assert.ok(backgroundRes.body.length > 0)

reply = await postSettings(ctx2, { background: { imageData: 'data:image/png;base64,!!!!' } })
assert.equal(reply.status, 400)

reply = await postSettings(ctx2, { background: { mode: 'theme', removeImage: true } })
assert.equal(reply.status, 200)
assert.equal(reply.payload.settings.background.imageFile, '')
assert.equal(existsSync(join(profile, '.dsh-memo', 'background.png')), false, 'image file removed')
const missingRes = fakeResponse()
await ctx2.routes['/dsh-memo/background'].handler(fakeRequest('GET', '/dsh-memo/background'), missingRes)
assert.equal(missingRes.statusCode, 404)

reply = await postSettings(ctx2, {
  texts: { 'bad key!': 'x', 'panel.add': '   ' },
  language: 'fr',
  fontSize: 99,
  background: { mode: 'evil', color: 'red', opacity: 9, blur: -5 },
})
assert.equal(reply.status, 200)
assert.equal(reply.payload.settings.background.mode, 'theme')
assert.equal(reply.payload.settings.background.color, '#1b2a33')
assert.equal(reply.payload.settings.background.opacity, 1)
assert.equal(reply.payload.settings.background.blur, 0)
assert.equal(reply.payload.settings.language, 'auto')
assert.equal(reply.payload.settings.fontSize, 17)
assert.deepEqual(reply.payload.settings.texts, {})

await postSettings(ctx2, {
  texts: { 'panel.title': '我的备忘' },
  language: 'en',
  fontSize: 15,
  background: { mode: 'color', color: '#0a1b2c', opacity: 0.75 },
})
const savedState = JSON.parse(readFileSync(file, 'utf8'))
assert.equal(savedState.version, 4)
assert.equal(savedState.settings.texts['panel.title'], '我的备忘')
assert.equal(savedState.settings.background.mode, 'color')
assert.equal(savedState.settings.language, 'en')
assert.equal(savedState.settings.fontSize, 15)

const settingsReloaded = await import(`${moduleUrl}?case=settings`)
const ctx4 = makeContext()
settingsReloaded.apply(ctx4)
reply = await getSettings(ctx4)
assert.equal(reply.payload.settings.texts['panel.title'], '我的备忘')
assert.equal(reply.payload.settings.background.color, '#0a1b2c')
assert.equal(reply.payload.settings.background.opacity, 0.75)
assert.equal(reply.payload.settings.language, 'en')
assert.equal(reply.payload.settings.fontSize, 15)

// v1 migration: the old global items go to the first session that reads a list.
const legacyProfile = mkdtempSync(join(tmpdir(), 'dsh-memo-legacy-'))
process.env.DSH_PROFILE_DIR = legacyProfile
mkdirSync(join(legacyProfile, '.dsh-memo'), { recursive: true })
writeFileSync(join(legacyProfile, '.dsh-memo', 'memos.json'), JSON.stringify({
  version: 1,
  items: [{ id: 'm-old', title: '旧全局条目', detail: '', status: 'open', source: 'ai', createdAt: 1, updatedAt: 1 }],
}), 'utf8')

const third = await import(`${moduleUrl}?case=3`)
const ctx3 = makeContext()
third.apply(ctx3)
reply = await get(ctx3, 'session-z')
assert.equal(reply.payload.items.length, 1)
assert.equal(reply.payload.items[0].title, '旧全局条目')
const migrated = JSON.parse(readFileSync(join(legacyProfile, '.dsh-memo', 'memos.json'), 'utf8'))
assert.equal(migrated.version, 4)
assert.equal(migrated.sessions['session-z'].items[0].id, 'm-old')
reply = await get(ctx3, 'session-other')
assert.equal(reply.payload.items.length, 0)

reply = await getSettings(ctx3)
assert.equal(reply.payload.settings.background.mode, 'theme')
assert.equal(reply.payload.settings.language, 'auto')
assert.equal(reply.payload.settings.fontSize, 13)
assert.deepEqual(reply.payload.settings.texts, {})

rmSync(profile, { recursive: true, force: true })
rmSync(legacyProfile, { recursive: true, force: true })
console.log('dsh-memo host checks: OK')
