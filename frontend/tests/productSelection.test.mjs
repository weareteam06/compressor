import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/productSelection.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { seriesOrder, productFamily, matchesCategory, categoryDisplay } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const catalog = JSON.parse(await readFile(new URL('../../backend/src/main/resources/data/products.json', import.meta.url), 'utf8'));
const categories = JSON.parse(await readFile(new URL('../../backend/src/main/resources/data/categories.json', import.meta.url), 'utf8'));

test('carousel family order follows the requested sequence', () => {
  assert.deepEqual(seriesOrder, ['FAS', 'FASM', 'FSL', 'FSG']);
});
test('permanent magnet and portable categories contain only their requested families', () => {
  for (const [slug, family] of [['permanent-magnet-motor-compressors', 'FASM'], ['portable-compressors', 'FSG']]) {
    const category = categories.find(item => item.slug === slug);
    const selected = catalog.filter(product => matchesCategory(product, category));
    assert.ok(selected.length > 0);
    assert.ok(selected.every(product => productFamily(product) === family));
    assert.deepEqual(selected, catalog.filter(product => productFamily(product) === family));
  }
});
test('low pressure never silently falls back to FAS or all products when no FSL is published', () => {
  const category = categories.find(item => item.slug === 'low-pressure-compressors');
  const fsl = { model: 'FSL22', series: 'FSL', categoryId: 'different-category' };
  assert.deepEqual([...catalog, fsl].filter(product => matchesCategory(product, category)), [...catalog.filter(product => productFamily(product) === 'FSL'), fsl]);
});
test('other internal categories show all catalog products', () => {
  for (const slug of ['oil-lubricated-screw-compressors', 'variable-speed-compressors']) {
    assert.equal(catalog.filter(product => matchesCategory(product, categories.find(item => item.slug === slug))).length, catalog.length);
  }
});
test('missing family metadata falls back to exact model prefix, keeping FASM separate from FAS', () => {
  assert.equal(productFamily({ model: 'FASM22A', series: '' }), 'FASM');
  assert.equal(productFamily({ model: 'FAS-4' }), 'FAS');
  assert.equal(productFamily({ model: 'FSL22', series: ' fsl ' }), 'FSL');
});
test('Ultra Pack rename preserves existing category identity and destination', () => {
  const original = categories.find(item => item.slug === 'oil-free-compressors');
  const display = categoryDisplay(original, { 'oil-free-compressors': 'Ultra Pack' });
  assert.equal(display.name, 'Ultra Pack');
  assert.equal(display.slug, original.slug);
  assert.equal(display.externalUrl, original.externalUrl);
  assert.equal(original.name, 'Oil-Free Compressors');
  assert.equal(categoryDisplay(original, {}).name, original.name);
  assert.equal(categoryDisplay(original, { 'oil-free-compressors': 'Custom backend label' }).name, 'Custom backend label');
});
