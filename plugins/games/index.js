/**
 * Host half of the dsh-games bundle.
 *
 * The page, the window manager and the future game adapters all run in the
 * Client module (`client.js`). The Host half only keeps the bundle activatable
 * so the client entry is served; it will own score persistence (host.call)
 * once games land.
 */
export function apply() {}
