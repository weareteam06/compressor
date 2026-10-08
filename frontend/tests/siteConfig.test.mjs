import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const seed = JSON.parse(await readFile(new URL('../../backend/src/main/resources/data/site-config.json', import.meta.url), 'utf8'));
const schema = JSON.parse(await readFile(new URL('../src/lib/publicContentSchema.json', import.meta.url), 'utf8'));
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText).toString('base64')}`;
const validationSource = (await readFile(new URL('../src/lib/configValidation.ts', import.meta.url), 'utf8')).replace("import publicContentSchema from './publicContentSchema.json';", `const publicContentSchema = ${JSON.stringify(schema)};`);
const validationUrl = moduleUrl(validationSource);
const { validateSiteConfig } = await import(validationUrl);
const urlsUrl = moduleUrl(await readFile(new URL('../src/lib/apiUrls.ts', import.meta.url), 'utf8'));
const { resolveApiUrls } = await import(urlsUrl);
const dataSource = (await readFile(new URL('../src/lib/data.ts', import.meta.url), 'utf8'))
  .replace("'./configValidation'", JSON.stringify(validationUrl))
  .replace("'./apiUrls'", JSON.stringify(urlsUrl))
  .replaceAll('import.meta.env.VITE_API_BASE_URL', "'/api'");
const { getSiteConfig, getProductById } = await import(moduleUrl(dataSource));
globalThis.localStorage = { getItem: () => null };
globalThis.window = { setTimeout, clearTimeout };

test('seed config and intentionally empty content lists are valid', () => {
  assert.doesNotThrow(() => validateSiteConfig(seed));
  const edited = structuredClone(seed);
  edited.publicContent.heroSlides = [];
  edited.publicContent.faqs = [];
  edited.publicContent.seriesGuide = [];
  assert.doesNotThrow(() => validateSiteConfig(edited));
});

test('missing and malformed content fails before React renders', () => {
  for (const value of [undefined, null, {}, '<html>']) assert.throws(() => validateSiteConfig(value));
  const edited = structuredClone(seed);
  edited.publicContent.heroSlides[0].highlights = 'not an array';
  assert.throws(() => validateSiteConfig(edited));
});

test('backend media URLs work for same-origin and split-origin deployments', () => {
  const original = { url: '/api/media/example.pdf', nested: ['/api/media/hero.png', 'https://images.example/logo.svg'] };
  assert.deepEqual(resolveApiUrls(original, '/api'), original);
  assert.equal(resolveApiUrls(original, 'https://api.example/api/').url, 'https://api.example/api/media/example.pdf');
  assert.equal(original.url, '/api/media/example.pdf');
});

test('404 site config rejects, while a missing product remains a valid not-found result', async () => {
  globalThis.fetch = async () => new Response('Not found', { status: 404 });
  await assert.rejects(getSiteConfig(), /Not found/);
  assert.equal(await getProductById('missing'), undefined);
});

test('public site config does not send a stale admin token', async () => {
  globalThis.localStorage = { getItem: () => 'expired-token' };
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return Response.json(seed);
  };
  try { await getSiteConfig(); }
  finally { globalThis.localStorage = { getItem: () => null }; }
});

test('failed, invalid JSON, malformed, and empty responses can recover on retry', async () => {
  for (const response of [new Response('Unavailable', { status: 503 }), new Response('<html>'), Response.json({}), new Response(null, { status: 204 })]) {
    globalThis.fetch = async () => response;
    await assert.rejects(getSiteConfig());
    globalThis.fetch = async () => Response.json(seed);
    assert.equal((await getSiteConfig()).company.name, seed.company.name);
  }
});

test('a stalled request times out instead of leaving loading active forever', async () => {
  globalThis.window = { setTimeout: callback => setTimeout(callback, 5), clearTimeout };
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  try { await assert.rejects(getSiteConfig(), { name: 'AbortError' }); }
  finally { globalThis.window = { setTimeout, clearTimeout }; }
});

test('every migrated media reference has a backend seed asset', async () => {
  const assets = JSON.parse(await readFile(new URL('../../backend/src/main/resources/data/media.json', import.meta.url), 'utf8'));
  const keys = new Set(assets.map(asset => asset.key));
  const urls = JSON.stringify(seed.publicContent).match(/\/api\/media\/[^"\\]+/g) || [];
  assert.ok(urls.length > 0);
  for (const url of urls) assert.ok(keys.has(url.slice('/api/media/'.length)), url);
});
