import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (name) => readFileSync(join(root, name), 'utf8');
let failed = 0;

function expect(label, ok) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label);
  if (!ok) failed += 1;
}

const pkg = JSON.parse(read('package.json'));
expect('name', pkg.name === '@local/dsh-games');
expect('version', pkg.version === '1.2.0');
expect('license', pkg.license === 'MIT');
expect('repository directory', pkg.repository?.directory === 'plugins/games');
expect('engines.dsh', pkg.engines?.dsh === '^0.2.3-alpha.2');
expect('client export', pkg.exports?.['./client'] === './client.js');
expect('icon export', pkg.exports?.['./icon'] === './icon.svg');
expect('bundle patch', pkg.dsh?.bundle?.patch === './cordis.patch.yml');
expect('client platform', pkg.dsh?.client?.platform === 'web');

const patch = read('cordis.patch.yml');
expect('patch row id', /id: dsh-games/.test(patch));
expect('patch row name', /@local\/dsh-games/.test(patch));

const index = read('index.js');
expect('host apply', /export function apply\s*\(/.test(index));

const client = read('client.js');
expect('client loader id', client.includes("id: '@local/dsh-games'"));
expect('main panel', client.includes("key: 'games'"));
expect('sidebar entry', client.includes("id: 'games'"));
for (const id of ['snake', 'breakout', '2048', 'pong', 'invaders', 'sokoban']) expect('game ' + id, client.includes("id: '" + id + "'"));
expect('web adapter', client.includes('createWebRuntime'));
expect('pong port source', client.includes('vruntime-labs/ping-pong'));
expect('invaders port source', client.includes('vrk/space-invaders'));
expect('sokoban port source', client.includes('taniarascia/sokoban'));
expect('theme hot update', client.includes('theme/change') && client.includes('themeListeners'));
expect('active pause', client.includes('activeRef'));

for (const [locale, detail] of [
  ['en', 'docs/DETAIL.md'],
  ['zh', 'docs/DETAIL.zh.md'],
]) {
  const dict = JSON.parse(read('locale/' + locale + '.json'));
  expect(locale + ' title', typeof dict.meta?.title === 'string' && dict.meta.title.length > 0);
  expect(locale + ' description', typeof dict.meta?.description === 'string' && dict.meta.description.length > 20);
  expect(locale + ' detail', dict.meta?.detail === detail);
  expect(locale + ' detail file', existsSync(join(root, detail)));
}

for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md', 'README.md', 'docs/DETAIL.md', 'docs/DETAIL.zh.md', 'docs/preview.svg', 'docs/SECURITY-REVIEW.md', 'icon.svg']) {
  expect('file ' + file, existsSync(join(root, file)));
}

for (const [label, file] of [
  ['preview', 'docs/preview.svg'],
  ['icon', 'icon.svg'],
]) {
  const svg = read(file).trim();
  expect(label + ' svg root', svg.startsWith('<svg'));
  expect(label + ' svg safe', !/<script|<style|foreignObject|onload\s*=|onclick\s*=/i.test(svg));
}

for (const [label, file] of [
  ['en', 'docs/DETAIL.md'],
  ['zh', 'docs/DETAIL.zh.md'],
]) {
  const detail = read(file).trim();
  expect(label + ' detail is one image line', /^!\[[^\]]+\]\(preview\.svg\)$/.test(detail));
}

console.log(failed === 0 ? 'OK' : 'FAILED ' + failed);
if (failed !== 0) process.exit(1);
