import publicContentSchema from './publicContentSchema.json';

export function matchesContentShape(value: unknown, schema: unknown): boolean {
  if (Array.isArray(schema)) return Array.isArray(value) && value.every(item => !schema.length || schema.some(example => matchesContentShape(item, example)));
  if (schema && typeof schema === 'object') {
    return !!value && typeof value === 'object' && !Array.isArray(value)
      && Object.entries(schema).every(([key, field]) => matchesContentShape((value as Record<string, unknown>)[key], field));
  }
  return typeof value === schema;
}

/** Fail before rendering when the content response is missing its required sections. */
export function validateSiteConfig(value: unknown): void {
  const object = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item);
  if (!object(value)) throw new Error('Invalid site configuration');
  for (const key of ['company', 'contact', 'about', 'social', 'home', 'publicContent']) {
    if (!object(value[key])) throw new Error(`Missing site configuration section: ${key}`);
  }
  const contact = value.contact as Record<string, unknown>;
  if (!object(contact.headquarters) || !Array.isArray(contact.regionalOffices)
      || typeof contact.headquarters.address !== 'string'
      || typeof contact.salesPhone !== 'string' || typeof contact.email !== 'string') {
    throw new Error('Invalid contact configuration');
  }
  if (!matchesContentShape(value.publicContent, publicContentSchema)) throw new Error('Incomplete or invalid public content');
  const home = value.home as Record<string, unknown>;
  for (const key of ['heroFeatures', 'heroMetricLabels', 'familyCards', 'benefits', 'serviceItems', 'solutionCards', 'energyHighlights', 'serviceCards', 'statistics', 'customerLogos']) {
    if (!Array.isArray(home[key])) throw new Error(`Invalid home content: ${key}`);
  }
  if (typeof (value.company as Record<string, unknown>).name !== 'string') throw new Error('Invalid company name');
}
