import type { Product } from '@/lib/data';

export function pressureLabel(product: Product) {
  return product.pressureMin === product.pressureMax
    ? `${product.pressureMax} kg/cm2(g)`
    : `${product.pressureMin}-${product.pressureMax} kg/cm2(g)`;
}

export function cfmMax(product: Product) {
  const values = product.flowRateCfm.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  return Math.max(...values, 0);
}

export function dutyFor(product: Product) {
  if (product.powerKw >= 75 || product.model.toUpperCase().startsWith('FSG')) return 'Heavy duty industrial';
  if (product.powerKw >= 30) return 'Factory plant air';
  if (product.powerKw >= 15) return 'Small manufacturing';
  return 'Small workshop';
}

export function bestFor(product: Product) {
  if (product.model.toUpperCase().startsWith('FSG')) return 'Construction, maintenance, rental, and high-capacity site air';
  if (product.powerKw >= 75) return 'Large production lines and continuous plant air';
  if (product.powerKw >= 30) return 'Factory plant air, automotive, packaging, and fabrication';
  if (product.powerKw >= 15) return 'Small manufacturing, workshops, CNC, and general plant air';
  return 'Small workshops, service bays, tools, and compact production areas';
}

export function buyerDescription(product: Product) {
  return `The ${product.model} is suited for ${bestFor(product).toLowerCase()} where stable pressure, clear service access, and reliable compressed air are required.`;
}

export function optionalAccessories(product: Product) {
  const base = ['Pre-filter and post-filter set', 'Automatic condensate drain', 'Genuine service kit'];
  if (product.powerKw <= 11) return ['Air receiver package', 'Refrigeration dryer', ...base];
  if (product.model.toUpperCase().startsWith('FSG')) return ['Site hose and coupling kit', 'Aftercooler package', ...base];
  return ['Refrigeration dryer', 'Air receiver sized to demand', ...base];
}

export function maintenanceNotes(product: Product) {
  return [
    'Keep air filters, oil filters, and separator elements on the recommended service schedule.',
    'Check ambient ventilation and cooler cleanliness to protect operating temperature.',
    product.powerKw >= 30
      ? 'Plan routine inspection around shift patterns because higher-kW units often serve continuous production.'
      : 'Review receiver drain and dryer performance regularly for clean, dry workshop air.',
  ];
}

export function similarProducts(product: Product, products: Product[]) {
  return products
    .filter(item => item.id !== product.id && item.series === product.series)
    .sort((a, b) => Math.abs(a.powerKw - product.powerKw) - Math.abs(b.powerKw - product.powerKw))
    .slice(0, 3);
}
