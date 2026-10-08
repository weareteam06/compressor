const fs = require('node:fs');
const seed = JSON.parse(fs.readFileSync('backend/src/main/resources/data/site-config.json', 'utf8'));
function shape(value) {
  if (Array.isArray(value)) return [...new Map(value.map(item => { const schema = shape(item); return [JSON.stringify(schema), schema]; })).values()];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  return typeof value;
}
fs.writeFileSync('frontend/src/lib/publicContentSchema.json', JSON.stringify(shape(seed.publicContent), null, 2) + '\n');
