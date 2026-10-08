import type { Product, ProductCategory } from './data';

export const seriesOrder = ['FAS', 'FASM', 'FSL', 'FSG'] as const;
export function productFamily(product: Product): string {
  return product.series?.trim().toUpperCase() || product.model.toUpperCase().match(/^(FASM|FAS|FSL|FSG)/)?.[0] || '';
}
export function categorySeries(slug: string): string | undefined {
  return ({ 'permanent-magnet-motor-compressors': 'FASM', 'low-pressure-compressors': 'FSL', 'portable-compressors': 'FSG' } as Record<string, string>)[slug];
}
export function matchesCategory(product: Product, category?: ProductCategory): boolean {
  if (!category) return true;
  const family = categorySeries(category.slug);
  return family ? productFamily(product) === family : true;
}
export function categoryDisplay(category: ProductCategory, names: Record<string, string> = {}): ProductCategory {
  const name = names[category.slug];
  return name ? { ...category, name, shortName: name } : category;
}
