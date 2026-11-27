import { apply } from '../index.js';

const PEAK = Date.UTC(2026, 10, 27, 2, 0, 0); // Friday 10:00 Beijing
const OFF = Date.UTC(2026, 10, 27, 14, 0, 0); // Friday 22:00 Beijing
const WEEKEND = Date.UTC(2026, 10, 28, 2, 0, 0); // Saturday 10:00 Beijing

let definition;
let seq = 0;
const ctx = {
  sessionProjections: {
    register(def) {
      definition = def;
      return Promise.resolve({});
    },
  },
};

function message(time, model, usage) {
  seq += 1;
  return {
    type: 'assistant/message',
    seq,
    time,
    data: {
      turn: 1,
      step: 1,
      message: { role: 'assistant', source: { kind: 'model', provider: 'deepseek-account', model } },
      stream: [],
      usage,
    },
  };
}

function header(time, model) {
  seq += 1;
  return {
    type: 'request/header',
    seq,
    time,
    data: { header: { config: { provider: 'deepseek-account', model } }, reason: 'initial' },
  };
}

function foldEvents(events) {
  let state = definition.init({}, 0);
  for (const event of events) state = definition.apply(state, event);
  return { state, view: definition.wire.view(state) };
}

function expect(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log((ok ? 'PASS ' : 'FAIL ') + label + ' => ' + JSON.stringify(actual));
  if (!ok) process.exitCode = 1;
}

// 1. Default config: 1M cache-miss input at off-peak costs 1 CNY.
apply(ctx, {});
{
  const { view } = foldEvents([header(OFF, 'deepseek-flash'), message(OFF, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 })]);
  expect('off-peak 1M miss input', view, { cost: 1, currency: 'CNY', unpriced: [] });
}
// 2. Same tokens at peak cost double.
{
  const { view } = foldEvents([message(PEAK, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 })]);
  expect('peak 1M miss input', view, { cost: 2, currency: 'CNY', unpriced: [] });
}
// 3. Cache-hit and output buckets use their own prices.
{
  const { view } = foldEvents([message(OFF, 'deepseek-flash', { inputTokens: 0, outputTokens: 1_000_000, cacheReadTokens: 1_000_000 })]);
  expect('off-peak 1M hit + 1M out', view, { cost: 4.02, currency: 'CNY', unpriced: [] });
}
// 4. Weekend noon is off-peak.
{
  const { view } = foldEvents([message(WEEKEND, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 })]);
  expect('weekend 1M miss input', view, { cost: 1, currency: 'CNY', unpriced: [] });
}
// 5. Pro prices differ.
{
  const { view } = foldEvents([message(OFF, 'deepseek-v4-pro', { inputTokens: 1_000_000, outputTokens: 1_000_000 })]);
  expect('pro off-peak 1M miss + 1M out', view, { cost: 18, currency: 'CNY', unpriced: [] });
}
// 6. A repeated settlement for the same step replaces the earlier sample.
{
  const first = message(OFF, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 });
  const second = message(OFF, 'deepseek-flash', { inputTokens: 500_000, outputTokens: 0 });
  second.data.turn = 1;
  second.data.step = 1;
  const { view } = foldEvents([first, second]);
  expect('same-step replacement', view, { cost: 0.5, currency: 'CNY', unpriced: [] });
}
// 7. Unknown models are reported, not priced.
{
  const { view } = foldEvents([message(OFF, 'some-other-model', { inputTokens: 1000, outputTokens: 10 })]);
  expect('unpriced model', view, { cost: 0, currency: 'CNY', unpriced: ['some-other-model'] });
}
// 8. Configuration: defaults fill, invalid config fails activation loudly.
{
  apply(ctx, { currency: 'USD', mode: 'peak', prices: { 'deepseek-flash': { cacheMiss: 10 } } });
  const usd = foldEvents([message(OFF, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 })]);
  // 10 USD/M input at peak × 2.
  expect('custom price + peak', usd.view, { cost: 20, currency: 'USD', unpriced: [] });
  let threw = false;
  try {
    apply(ctx, { currency: 'yuan' });
  } catch (error) {
    threw = /currency/.test(String(error.message));
  }
  expect('bad currency fails activation', threw, true);
  let unknownKey = false;
  try {
    apply(ctx, { price: {} });
  } catch (error) {
    unknownKey = /unknown key/.test(String(error.message));
  }
  expect('unknown key fails activation', unknownKey, true);
}
// 9. Mode override ignores the clock.
{
  apply(ctx, { mode: 'peak' });
  const forced = foldEvents([message(OFF, 'deepseek-flash', { inputTokens: 1_000_000, outputTokens: 0 })]);
  expect('mode peak forces peak', forced.view.cost, 2);
}
// 10. An attempt's usage rides its stream chunk, and a retry replaces it.
{
  apply(ctx, {});
  const attempt = (usage) => {
    seq += 1;
    return {
      type: 'assistant/attempt',
      seq,
      time: OFF,
      data: { turn: 2, step: 1, stream: [{ type: 'chunk', time: OFF, chunk: { type: 'usage', usage } }] },
    };
  };
  const retried = foldEvents([
    header(OFF, 'deepseek-flash'),
    attempt({ inputTokens: 1_000_000, outputTokens: 0 }),
  ]);
  expect('attempt stream usage', retried.view.cost, 1);
  const replaced = foldEvents([
    header(OFF, 'deepseek-flash'),
    attempt({ inputTokens: 1_000_000, outputTokens: 0 }),
    { type: 'llm/retry-started', seq: (seq += 1), time: OFF, data: { turn: 2, step: 1 } },
    attempt({ inputTokens: 250_000, outputTokens: 0 }),
  ]);
  // A retried attempt is billed separately (the same rule as the token-usage
  // projection), so both attempts accumulate.
  expect('retry accumulates both attempts', replaced.view.cost, 1.25);
}
// 11. State checkpoint round-trip keeps the total.
{
  const { state, view } = foldEvents([message(OFF, 'deepseek-flash', { inputTokens: 2_000_000, outputTokens: 1_000_000 })]);
  const restored = definition.stateSchema.parse(JSON.parse(JSON.stringify(state)));
  expect('state round-trip', definition.wire.view(restored), view);
}

