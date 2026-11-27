# dsh-session-cost

Shows how much the open session has cost so far, next to the `tok` reading in the row under the message composer.

- **Where**: the composer statistics row (`conversation.composer.dock`), immediately after the built-in token pill (`… tok · cache hit`) and before the context meter.
- **What it shows**: an estimate in the configured currency, e.g. `≈¥0.35`. Hover it for the caveats and any models that have no configured price. `*` marks a total that leaves unpriced tokens out; `—` means every token came from a model without a configured price, so no amount can be shown.
- **How it is computed**: the Host counts each step's provider-reported token usage per model, splits it by DeepSeek's peak / off-peak windows (Beijing time) and applies the official prices. Nothing is sent anywhere, and the value is recomputed from the session log for forks, resume and replay.

## Requirements

DeepSeek Harness `^0.2.3-alpha.2`. The bundle needs the Web profile (the pill lives in the composer) and `@deepseek-ai/dsh-session-projection`, which the Web bundle already provides.

## Install

This plugin lives in the [dsh-plugins](https://github.com/Alone-Ray/dsh-plugins) repository under `plugins/session-cost`.

- **DSH Desktop**: open **Plugins** → **Add plugin**, choose this directory (the folder containing this README). Enable the row if it is disabled.
- **CLI from a local clone**: `dsh plugin --profile <profile> add <clone>/plugins/session-cost`.
- **From GitHub** (pnpm subdirectory spec, pnpm ≥ 9; DSH bundles pnpm 11):

  ```sh
  dsh plugin --profile <profile> add "github:Alone-Ray/dsh-plugins#path:plugins/session-cost"
  ```

  The plugin is plain JavaScript, so there is no build script and no extra permission prompt.
- After installation, open a session: the reading appears under the composer once the first step reports usage. To change prices or currency, edit the row's `config` (see below) and reload the profile.

## Prices

Prices are CNY per **1 million tokens**, off-peak. Peak prices are `peakMultiplier` times the off-peak ones (2 by default, as the official page states). Built-in defaults:

| Model | Cache-hit input | Cache-miss input | Output | Cache write |
| --- | --- | --- | --- | --- |
| `deepseek-flash` | 0.02 | 1 | 4 | 1 |
| `deepseek-v4-pro` | 0.15 | 4.5 | 13.5 | 4.5 |

Source: <https://api-docs.deepseek.com/zh-cn/quick_start/pricing/>. The plugin does not fetch prices at runtime: prices change, so edit the row configuration in your profile's `cordis.patch.yml` when they do.

## Configuration

Add or edit the `config` of the `dsh-session-cost` row in `$DSH_PROFILE_DIR/cordis.patch.yml`. The row declares no schema-backed Configure form, so edit the YAML directly; the plugin validates it when it activates and an invalid value disables the row with a clear error. A patch replaces the whole config, so restate every field you want to keep:

```yaml
- id: dsh-session-cost
  name: '@local/dsh-session-cost'
  config:
    currency: CNY          # ISO code; CNY and USD get their own symbols
    mode: auto             # auto | peak | off-peak
    peakMultiplier: 2      # peak = off-peak price × this
    prices:
      deepseek-flash: { cacheHit: 0.02, cacheMiss: 1, output: 4, cacheWrite: 1 }
      deepseek-v4-pro: { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5, cacheWrite: 4.5 }
```

Fields of a price entry all count per 1M tokens; `cacheWrite` defaults to `cacheMiss`, and for a model the built-ins do not know, omitted fields fall back to `cacheMiss`. Models without a price entry still appear in the session; their tokens are listed in the tooltip and left out of the displayed amount.

## Development

- `index.js` is the Host half (projection + config validation); `client.js` is the Client half (the pill). Both are plain ES modules with no build step and no third-party imports.
- The page reads the Host value through the client-visible `sessionCost` session projection, so the Client never folds session events itself.
- Run the checks with any Node.js 22+: `node test/cost.test.mjs` (no packages needed; exits non-zero on failure).
- Prices are in `DEFAULT_PRICES` at the top of `index.js`; a user's row config overrides them without touching code.

## Limitations

- **Estimate, not a bill.** It prices provider token usage, and the official prices can change; the session does not know the platform's final discount or the content of your wallet.
- **Holidays.** `mode: auto` treats Monday–Friday 9:00–12:00 and 14:00–18:00 Beijing time as peak and everything else as off-peak, as the official page describes. Chinese statutory holidays that fall on a weekday are still needed to be off-peak; the plugin cannot know them, so use `mode: off-peak` on such days when accuracy matters.
- **Unknown models.** Only models with a configured price contribute to the amount; the tooltip names the models that were left out.
- **Currency** changes the printed symbol only, because token usage and prices are converted nowhere: price in the same currency you want to display. `CNY` gets the ¥ coin; other currencies get a neutral coin.
- **Session scope only.** Subagent sessions and other tabs keep their own `sessionCost`; archive or fork views show the value of the session they show.

## Files

- `index.js` — Host half: the `sessionCost` session projection and config validation.
- `client.js` — Client half: the pill in `conversation.composer.dock`.
- `locale/{en,zh}.json` — Plugin Manager title, description, detail document and runtime copy.
- `cordis.patch.yml` — the bundle patch that inserts the row.
- `icon.svg` — plugin icon.
- `docs/` — the optional detail-page image and its localized captions.
- `test/cost.test.mjs` — fold and pricing checks.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Aloneray.
