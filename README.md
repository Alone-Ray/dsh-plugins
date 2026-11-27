# DSH plugins

A home for my [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart) (DSH) plugins. Every plugin is one self-contained, installable bundle under `plugins/`.

| Plugin | What it does |
| --- | --- |
| [session-cost](plugins/session-cost) | Shows the estimated spend of the open session next to the `tok` reading under the message composer. |
| [games](plugins/games) | Games hub: run mini-games embedded or in several floating windows, with Snake, Breakout, 2048 and custom backgrounds. |

## Install a plugin

Requirements: DeepSeek Harness `^0.2.3-alpha.2`. UI plugins also need the Web profile, which the Desktop app uses.

- **From GitHub** (pnpm subdirectory spec, pnpm ≥ 9; DSH bundles pnpm 11):

  ```sh
  dsh plugin --profile <profile> add "github:Alone-Ray/dsh-plugins#path:plugins/session-cost"
  ```

- **From a local clone**:

  ```sh
  git clone https://github.com/Alone-Ray/dsh-plugins.git dsh-plugins
  dsh plugin --profile <profile> add "<path-to>/dsh-plugins/plugins/session-cost"
  ```

  In DSH Desktop you can also open **Plugins** → **Add plugin** and choose the plugin folder.

- Enable the row in **Plugins** if it is disabled, then reload the profile or open the surface the plugin adds.

## Layout

```
plugins/<name>/   one DSH bundle: package.json, cordis.patch.yml, Host/Client halves, locale, icon, docs
LICENSE           MIT, covering every plugin in this repository
```

Each plugin folder also carries its own LICENSE copy, so it can be extracted and used on its own.

## Development

- Node.js 22+ runs the checks; the plugins have no build step and no third-party runtime imports.
- Run a plugin's checks from its folder, for example `node test/cost.test.mjs`.
- To work on a plugin live, install that folder through the Plugin Manager; the profile links the folder, so edits take effect when the profile recomposes.

## License

MIT — see [LICENSE](LICENSE).
