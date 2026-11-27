/**
 * Host half of @local/dsh-session-cost.
 *
 * Folds every committed `assistant/message` / `assistant/attempt` usage
 * sample into a per-model token ledger split by DeepSeek's peak / off-peak
 * pricing windows, then publishes the estimated session spend as the
 * Client-visible session projection `sessionCost`. The Client half renders it
 * as a pill in the composer statistics row; no value leaves the machine.
 */

/** Official DeepSeek prices, CNY per 1M tokens, off-peak (peak is double). */
const DEFAULT_PRICES = {
  'deepseek-flash': { cacheHit: 0.02, cacheMiss: 1, output: 4, cacheWrite: 1 },
  'deepseek-v4-pro': { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5, cacheWrite: 4.5 },
};

/** Beijing-time peak windows, hours [from, to) on Monday–Friday. */
const PEAK_WINDOWS = [[9, 12], [14, 18]];

const CONFIG_KEYS = ['currency', 'mode', 'peakMultiplier', 'prices'];
const PRICE_KEYS = ['cacheHit', 'cacheMiss', 'output', 'cacheWrite'];

/** A fresh zeroed bucket set: cache-miss input, cache-hit input, cache write, output. */
function emptyBuckets() {
  return { miss: 0, hit: 0, write: 0, out: 0 };
}

/** One model's ledger: the same buckets under each pricing window. */
function emptyLedger() {
  return { peak: emptyBuckets(), off: emptyBuckets() };
}

/** The initial projection state: no samples, no model known yet. */
function initialState() {
  return { models: {}, last: null, model: null };
}

/**
 * Read a non-negative finite token count.
 * @param value - provider-reported count.
 * @returns the count, or 0 for a malformed sample.
 */
function tokens(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Convert one provider usage sample into ledger buckets.
 * @param usage - a `TokenUsage` value.
 * @returns bucket counts.
 */
function bucketsOf(usage) {
  return {
    miss: tokens(usage.inputTokens),
    hit: tokens(usage.cacheReadTokens),
    write: tokens(usage.cacheWriteTokens),
    out: tokens(usage.outputTokens),
  };
}

/**
 * Take the final provider usage sample embedded in an Assistant stream.
 * @param stream - the streamed records of one settlement.
 * @returns the usage, when the settlement carried one.
 */
function streamUsage(stream) {
  if (!Array.isArray(stream)) return undefined;
  for (let index = stream.length - 1; index >= 0; index -= 1) {
    const record = stream[index];
    if (!record || record.type !== 'chunk' || !record.chunk) continue;
    if (record.chunk.type !== 'usage') continue;
    return record.chunk.usage;
  }
  return undefined;
}

/**
 * The usage one durable settlement reports, when it reports any.
 * @param event - the committed session event.
 * @returns the usage sample, if present.
 */
function usageOf(event) {
  if (event.type === 'assistant/message') {
    return event.data.usage ?? streamUsage(event.data.stream);
  }
  if (event.type === 'assistant/attempt') return streamUsage(event.data.stream);
  return undefined;
}

/**
 * The model one settlement ran on: the assistant message's recorded route,
 * else the route of the most recent request.
 * @param event - the committed session event.
 * @param state - current projection state.
 * @returns a model id.
 */
function modelOf(event, state) {
  if (event.type === 'assistant/message') {
    const source = event.data.message?.source;
    if (typeof source?.model === 'string' && source.model) return source.model;
  }
  return state.model ?? 'unknown';
}

/**
 * Whether one sample falls in a DeepSeek peak window.
 * @param time - event time in epoch milliseconds.
 * @param config - normalized plugin configuration.
 * @returns true when peak pricing applies.
 */
function isPeak(time, config) {
  if (config.mode === 'peak') return true;
  if (config.mode === 'off-peak') return false;
  if (typeof time !== 'number' || !Number.isFinite(time)) return false;
  // China Standard Time is UTC+8 all year, so a fixed shift is exact.
  const at = new Date(time + 8 * 60 * 60 * 1000);
  const weekday = at.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  const hour = at.getUTCHours();
  return PEAK_WINDOWS.some(([from, to]) => hour >= from && hour < to);
}

/**
 * Add two bucket sets.
 * @param base - the accumulated buckets.
 * @param add - the buckets to add.
 * @returns a new bucket set.
 */
function addBuckets(base, add) {
  return {
    miss: base.miss + add.miss,
    hit: base.hit + add.hit,
    write: base.write + add.write,
    out: base.out + add.out,
  };
}

/**
 * Subtract one sample's buckets from an accumulated set, never below zero.
 * @param base - the accumulated buckets.
 * @param remove - the buckets to remove.
 * @returns a new bucket set.
 */
function removeBuckets(base, remove) {
  return {
    miss: Math.max(0, base.miss - remove.miss),
    hit: Math.max(0, base.hit - remove.hit),
    write: Math.max(0, base.write - remove.write),
    out: Math.max(0, base.out - remove.out),
  };
}

/**
 * The pure fold behind the `sessionCost` unit.
 * @param state - the state covering every prior event.
 * @param event - the next committed event.
 * @param config - normalized plugin configuration.
 * @returns the next state, or `state` itself when the event is not one of ours.
 */
function fold(state, event, config) {
  switch (event.type) {
    case 'request/header': {
      const model = event.data.header?.config?.model;
      if (typeof model !== 'string' || !model || model === state.model) return state;
      return { ...state, model };
    }
    case 'request/context': {
      const model = event.data.model;
      if (typeof model !== 'string' || !model || model === state.model) return state;
      return { ...state, model };
    }
    case 'llm/retry-started': {
      // The retried attempt replaces its step's earlier sample, exactly as the
      // token-usage projection handles it.
      if (state.last === null) return state;
      if (state.last.turn !== event.data.turn || state.last.step !== event.data.step) return state;
      return { ...state, last: null };
    }
    case 'assistant/message':
    case 'assistant/attempt': {
      const usage = usageOf(event);
      const model = modelOf(event, state);
      if (usage === undefined) {
        return model === state.model ? state : { ...state, model };
      }
      const turn = event.data.turn;
      const step = event.data.step;
      const side = isPeak(event.time, config) ? 'peak' : 'off';
      const buckets = bucketsOf(usage);
      const models = { ...state.models };
      // A second settlement for the same step (retry after `llm/retry-started`
      // never fires, replay) replaces the earlier sample instead of adding it.
      if (state.last !== null && state.last.turn === turn && state.last.step === step) {
        const previous = models[state.last.model];
        if (previous !== undefined) {
          models[state.last.model] = {
            ...previous,
            [state.last.side]: removeBuckets(previous[state.last.side], state.last.buckets),
          };
        }
      }
      const ledger = models[model] ?? emptyLedger();
      models[model] = { ...ledger, [side]: addBuckets(ledger[side], buckets) };
      return { ...state, model, models, last: { turn, step, model, side, buckets } };
    }
    default:
      return state;
  }
}

/**
 * Compute the money value and shape the Client view.
 * @param state - current projection state.
 * @param config - normalized plugin configuration.
 * @returns the wire value.
 */
function viewOf(state, config) {
  let cost = 0;
  const unpriced = [];
  for (const [model, ledger] of Object.entries(state.models)) {
    const price = config.prices[model];
    const side = (key) => (ledger[key] ?? emptyBuckets());
    const total = ['peak', 'off'].reduce((sum, key) => {
      const buckets = side(key);
      return sum + buckets.miss + buckets.hit + buckets.write + buckets.out;
    }, 0);
    if (price === undefined) {
      if (total > 0) unpriced.push(model);
      continue;
    }
    for (const [key, factor] of [['peak', config.peakMultiplier], ['off', 1]]) {
      const buckets = side(key);
      const priced = buckets.miss * price.cacheMiss
        + buckets.hit * price.cacheHit
        + buckets.write * price.cacheWrite
        + buckets.out * price.output;
      cost += (priced * factor) / 1_000_000;
    }
  }
  unpriced.sort();
  return { cost: Math.round(cost * 1_000_000) / 1_000_000, currency: config.currency, unpriced };
}

/**
 * Validate and fill one price entry.
 * @param model - model id, for error messages.
 * @param raw - the user's entry.
 * @param defaults - built-in entry for this model, when the model is known.
 * @param issues - issue accumulator.
 * @returns a complete price entry, or undefined when invalid.
 */
function normalizePrice(model, raw, defaults, issues) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    issues.push({ message: `prices["${model}"] must be an object` });
    return undefined;
  }
  for (const key of Object.keys(raw)) {
    if (!PRICE_KEYS.includes(key)) {
      issues.push({ message: `prices["${model}"] has unknown key "${key}" (supported: ${PRICE_KEYS.join(', ')})` });
    }
  }
  const cacheMiss = raw.cacheMiss ?? defaults?.cacheMiss;
  if (typeof cacheMiss !== 'number' || !Number.isFinite(cacheMiss) || cacheMiss < 0) {
    issues.push({ message: `prices["${model}"].cacheMiss must be a non-negative number` });
    return undefined;
  }
  const resolved = {
    cacheMiss,
    cacheHit: raw.cacheHit ?? defaults?.cacheHit ?? cacheMiss,
    output: raw.output ?? defaults?.output ?? cacheMiss,
    cacheWrite: raw.cacheWrite ?? defaults?.cacheWrite ?? cacheMiss,
  };
  for (const key of ['cacheHit', 'output', 'cacheWrite']) {
    const value = resolved[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      issues.push({ message: `prices["${model}"].${key} must be a non-negative number` });
      return undefined;
    }
  }
  return resolved;
}

/**
 * Validate raw loader configuration and fill defaults.
 * @param raw - the row's `config` value.
 * @returns the normalized configuration plus any validation issues.
 */
function normalizeConfig(raw) {
  const issues = [];
  const source = raw ?? {};
  if (typeof source !== 'object' || Array.isArray(source)) {
    return { issues: [{ message: 'config must be an object' }] };
  }
  for (const key of Object.keys(source)) {
    if (!CONFIG_KEYS.includes(key)) {
      issues.push({ message: `unknown key "${key}" (supported: ${CONFIG_KEYS.join(', ')})` });
    }
  }
  const currency = source.currency ?? 'CNY';
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
    issues.push({ message: 'currency must be a 3-letter ISO code such as CNY or USD' });
  }
  const mode = source.mode ?? 'auto';
  if (!['auto', 'peak', 'off-peak'].includes(mode)) {
    issues.push({ message: 'mode must be "auto", "peak", or "off-peak"' });
  }
  const peakMultiplier = source.peakMultiplier ?? 2;
  if (typeof peakMultiplier !== 'number' || !Number.isFinite(peakMultiplier) || peakMultiplier <= 0) {
    issues.push({ message: 'peakMultiplier must be a positive number' });
  }
  const prices = { ...DEFAULT_PRICES };
  if (source.prices !== undefined) {
    if (source.prices === null || typeof source.prices !== 'object' || Array.isArray(source.prices)) {
      issues.push({ message: 'prices must be an object mapping model ids to price entries' });
    } else {
      for (const [model, entry] of Object.entries(source.prices)) {
        const resolved = normalizePrice(model, entry, DEFAULT_PRICES[model], issues);
        if (resolved !== undefined) prices[model] = resolved;
      }
    }
  }
  if (issues.length > 0) return { issues };
  return { config: { currency, mode, peakMultiplier, prices }, issues };
}

/** Lenient state reader for restored checkpoints. */
const stateSchema = {
  parse(value) {
    const state = initialState();
    if (value === null || typeof value !== 'object') return state;
    if (typeof value.model === 'string' && value.model) state.model = value.model;
    if (value.models !== null && typeof value.models === 'object') {
      for (const [model, ledger] of Object.entries(value.models)) {
        if (ledger === null || typeof ledger !== 'object') continue;
        const next = emptyLedger();
        for (const key of ['peak', 'off']) {
          const buckets = ledger[key];
          if (buckets === null || typeof buckets !== 'object') continue;
          next[key] = {
            miss: tokens(buckets.miss),
            hit: tokens(buckets.hit),
            write: tokens(buckets.write),
            out: tokens(buckets.out),
          };
        }
        state.models[model] = next;
      }
    }
    const last = value.last;
    if (last !== null && typeof last === 'object'
      && Number.isSafeInteger(last.turn) && Number.isSafeInteger(last.step)
      && typeof last.model === 'string' && (last.side === 'peak' || last.side === 'off')
      && last.buckets !== null && typeof last.buckets === 'object') {
      state.last = {
        turn: last.turn,
        step: last.step,
        model: last.model,
        side: last.side,
        buckets: {
          miss: tokens(last.buckets.miss),
          hit: tokens(last.buckets.hit),
          write: tokens(last.buckets.write),
          out: tokens(last.buckets.out),
        },
      };
    }
    return state;
  },
};

/** Reject a malformed Client view before it leaves the Host. */
const viewSchema = {
  parse(value) {
    if (value === null || typeof value !== 'object'
      || typeof value.cost !== 'number' || !Number.isFinite(value.cost)
      || typeof value.currency !== 'string'
      || !Array.isArray(value.unpriced)) {
      throw new Error('sessionCost view is malformed');
    }
    return value;
  },
};

/** The projection service is required: without it there is nothing to publish. */
export const inject = ['sessionProjections'];

/**
 * Register the `sessionCost` projection.
 * @param ctx - the plugin context.
 * @param rawConfig - loader configuration; validated here so a bad row fails
 * activation with an actionable message (the bundle declares no native
 * Schemastery schema, so the loader passes the row config through unvalidated).
 */
export function apply(ctx, rawConfig) {
  const { config, issues } = normalizeConfig(rawConfig);
  if (config === undefined) {
    throw new Error(`dsh-session-cost: ${(issues[0] ?? { message: 'invalid config' }).message}`);
  }
  // Registration is effect-owned by this context, so unloading removes the
  // unit; the returned thenable is observed by the registry itself.
  void ctx.sessionProjections.register({
    key: 'sessionCost',
    stateVersion: 1,
    stateSchema,
    init: initialState,
    apply: (state, event) => fold(state, event, config),
    wire: {
      viewSchema,
      view: (state) => viewOf(state, config),
      summary: false,
    },
  });
}
