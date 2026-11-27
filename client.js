/**
 * Client half of @local/dsh-session-cost.
 *
 * Adds one entry to the composer statistics row (`conversation.composer.dock`)
 * right after the token reading: the estimated spend of the open session,
 * read from the Host-computed `sessionCost` session projection.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-session-cost',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'dsh-session-cost';

    const zh = {
      tooltip: '本会话估算花费 {amount}，按 DeepSeek 官方高峰/空闲价格与北京时间估算（法定节假日未特殊处理）。',
      'tooltip.unpriced': '以下模型没有价格配置，未计入：{models}',
      'tooltip.unpricedOnly': '本会话的 token 用量来自没有价格配置的模型，无法估算花费：{models}',
    };

    const en = {
      tooltip: 'Estimated spend for this session: {amount}, estimated from the DeepSeek official peak and off-peak rates for Beijing time (Chinese statutory holidays are not treated as off-peak).',
      'tooltip.unpriced': 'Not counted (no price configured): {models}',
      'tooltip.unpricedOnly': 'This session\'s token usage comes from models without a configured price, so no spend can be estimated: {models}',
    };

    const SYMBOLS = { CNY: '¥', USD: '$', EUR: '€', JPY: '¥', GBP: '£', KRW: '₩' };

    let translate = (key) => key;

    function t(key, params) {
      try {
        return translate(key, params) || key;
      } catch (error) {
        return key;
      }
    }

    /**
     * Format one money value: the currency symbol plus enough decimals to keep
     * a cheap session readable. A positive amount that would round to zero is
     * shown as a floor instead of a misleading zero.
     * @param cost - amount in the configured currency.
     * @param currency - ISO currency code.
     * @returns display text.
     */
    function formatMoney(cost, currency) {
      const symbol = SYMBOLS[currency] || currency + ' ';
      if (cost > 0 && cost < 0.0001) return '<' + symbol + '0.0001';
      const digits = cost > 0 && cost < 0.01 ? 4 : 2;
      return symbol + cost.toFixed(digits);
    }

    /**
     * A plain coin at the statistics-pill glyph size. The ¥ mark belongs only
     * to the CNY reading; another currency gets a neutral coin.
     */
    function CoinIcon(props) {
      const cny = props && props.currency === 'CNY';
      return h(
        'svg',
        {
          width: 14,
          height: 14,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        h('circle', {
          cx: 8,
          cy: 8,
          r: 6,
          stroke: 'currentColor',
          strokeWidth: 1.3,
        }),
        cny
          ? h('path', {
            d: 'M5.7 5.1 8 7.7l2.3-2.6M8 7.7v4.1M6.3 8.4h3.4M6.3 9.9h3.4',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          })
          : h('circle', { cx: 8, cy: 8, r: 3.2, stroke: 'currentColor', strokeWidth: 1.2 }),
      );
    }

    function Styles() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } });
    }

    /**
     * The cost reading. Hidden until the projection carries a priced session.
     * @param props - slot props; `useProjection` reads the Host projection.
     */
    function CostPill(props) {
      const useProjection = props && props.useProjection;
      const value = typeof useProjection === 'function' ? useProjection('sessionCost') : undefined;
      if (value === null || value === undefined || typeof value.cost !== 'number') return null;
      const unpriced = Array.isArray(value.unpriced) ? value.unpriced.filter((model) => typeof model === 'string') : [];
      if (!(value.cost > 0) && unpriced.length === 0) return null;
      const currency = typeof value.currency === 'string' ? value.currency : 'CNY';
      const priced = value.cost > 0;
      // A dash when every token belongs to an unpriced model: showing ¥0.00
      // would read as a free session. `≈` marks an estimate, `*` a total that
      // leaves unpriced tokens out.
      const amount = priced ? formatMoney(value.cost, currency) : '—';
      const approx = priced && amount.charAt(0) !== '<' ? '≈' + amount : amount;
      const label = priced && unpriced.length > 0 ? approx + '*' : approx;
      const say = typeof props.t === 'function' ? props.t : t;
      const lines = priced
        ? [say('tooltip', { amount })]
        : [say('tooltip.unpricedOnly', { models: unpriced.join(', ') })];
      if (priced && unpriced.length > 0) lines.push(say('tooltip.unpriced', { models: unpriced.join(', ') }));
      const title = lines.join(' ');
      return h(
        React.Fragment,
        null,
        h(Styles),
        h(
          'span',
          { className: 'dsh-cost-anchor' },
          h(
            'span',
            {
              className: 'dsh-cost-pill',
              role: 'img',
              title,
              'aria-label': title,
              'data-composer-stat': 'session-cost',
            },
            h(CoinIcon, { currency }),
            h('span', { className: 'dsh-cost-label' }, label),
          ),
        ),
      );
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-session-cost: dictionaries');
      translate = ctx.locale.bind(NS);
      // order 2 keeps the reading immediately after the shipped token pill
      // (activity 0, usage 1), before the context meter.
      ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
        { name: 'conversation.composer.dock', id: 'session-cost', order: 2, locale: NS },
        CostPill,
      ));
    }

    const CSS = `
.dsh-cost-anchor{display:inline-flex;flex:0 0 auto;min-width:0;font-size:calc(var(--dsh-content-font-size-secondary, 13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary, 0px))}
.dsh-cost-pill{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;max-width:100%;padding:1px 8px;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:default}
.dsh-cost-pill svg{width:14px;height:14px;flex:none}
.dsh-cost-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
`;

    return {
      inject: ['slots', 'locale'],
      apply,
    };
  },
});
