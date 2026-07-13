import type { Product } from '@/lib/data';

type CatalogRow = {
  id: string;
  model: string;
  series: 'FAS' | 'FSG';
  powerKw: number;
  powerHp: number;
  pressureMin: number;
  pressureMax: number;
  flowRateCfm: string;
  imageUrl: string;
  brochureUrl: string;
};

const fasSmallCover = '/catalogs/FAS-4-11-cover.jpg';
const fasLargeCover = '/catalogs/FAS-15-250KW-cover.jpg';
const fsgCover = '/catalogs/FSG-45-185KW-cover.jpg';

const rows: CatalogRow[] = [
  { id: 'fas4', model: 'FAS-4', series: 'FAS', powerKw: 4, powerHp: 5, pressureMin: 7, pressureMax: 16, flowRateCfm: '9-19', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS-4-400x400.png', brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas6', model: 'FAS-6', series: 'FAS', powerKw: 5.5, powerHp: 7.5, pressureMin: 7, pressureMax: 16, flowRateCfm: '13-28', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS6-400x400.png', brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas7', model: 'FAS-8', series: 'FAS', powerKw: 7.5, powerHp: 10, pressureMin: 7, pressureMax: 16, flowRateCfm: '21-39', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS7-400x400.png', brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas11', model: 'FAS-11', series: 'FAS', powerKw: 11, powerHp: 15, pressureMin: 7, pressureMax: 16, flowRateCfm: '35-62', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS11-400x400.png', brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas11he', model: 'FAS-11(HE)', series: 'FAS', powerKw: 11, powerHp: 15, pressureMin: 7, pressureMax: 16, flowRateCfm: '40-76', imageUrl: fasSmallCover, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas15', model: 'FAS-15', series: 'FAS', powerKw: 15, powerHp: 20, pressureMin: 5, pressureMax: 16, flowRateCfm: '51-108', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS15-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas18', model: 'FAS-18', series: 'FAS', powerKw: 18.5, powerHp: 25, pressureMin: 5, pressureMax: 16, flowRateCfm: '60-131', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS18-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas22', model: 'FAS-22', series: 'FAS', powerKw: 22, powerHp: 30, pressureMin: 5, pressureMax: 16, flowRateCfm: '78-145', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS22-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas30', model: 'FAS-30', series: 'FAS', powerKw: 30, powerHp: 40, pressureMin: 5, pressureMax: 16, flowRateCfm: '102-212', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS30-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas37', model: 'FAS-37', series: 'FAS', powerKw: 37, powerHp: 50, pressureMin: 5, pressureMax: 16, flowRateCfm: '134-263', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS37-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas45', model: 'FAS-45', series: 'FAS', powerKw: 45, powerHp: 60, pressureMin: 5, pressureMax: 16, flowRateCfm: '171-304', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas55', model: 'FAS-55', series: 'FAS', powerKw: 55, powerHp: 75, pressureMin: 5, pressureMax: 16, flowRateCfm: '207-415', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas75', model: 'FAS-75', series: 'FAS', powerKw: 75, powerHp: 100, pressureMin: 5, pressureMax: 16, flowRateCfm: '279-540', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fsg270a', model: 'FSG270A', series: 'FSG', powerKw: 45, powerHp: 60, pressureMin: 7, pressureMax: 8, flowRateCfm: '268-275', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg340a', model: 'FSG340A', series: 'FSG', powerKw: 55, powerHp: 75, pressureMin: 7, pressureMax: 12, flowRateCfm: '286-378', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg460a', model: 'FSG460A', series: 'FSG', powerKw: 75, powerHp: 100, pressureMin: 7, pressureMax: 12, flowRateCfm: '364-498', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg760a', model: 'FSG760A', series: 'FSG', powerKw: 110, powerHp: 150, pressureMin: 7, pressureMax: 10, flowRateCfm: '727-745', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg860a', model: 'FSG860A', series: 'FSG', powerKw: 132, powerHp: 175, pressureMin: 7, pressureMax: 12, flowRateCfm: '646-890', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg1060a', model: 'FSG1060A', series: 'FSG', powerKw: 185, powerHp: 250, pressureMin: 7, pressureMax: 12, flowRateCfm: '876-1130', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
];

export const catalogProducts: Product[] = rows.map(row => {
  const pressure = row.pressureMin === row.pressureMax
    ? `${row.pressureMax} kg/cm2(g)`
    : `${row.pressureMin}-${row.pressureMax} kg/cm2(g)`;
  const applicationFit = row.series === 'FSG'
    ? 'site work, maintenance, rental fleets, and high-capacity compressed air demand'
    : row.powerKw >= 30
      ? 'factory plant air, automotive, fabrication, packaging, and continuous production'
      : row.powerKw >= 15
        ? 'small manufacturing units, workshops, CNC support, and general plant air'
        : 'small workshops, service bays, tools, and compact production areas';
  return {
    ...row,
    categoryId: 'cat-air-compressors',
    name: 'Air cooled single stage rotary screw compressor',
    description: `${row.model} is suited for ${applicationFit} with ${row.flowRateCfm} CFM free air delivery.`,
    longDescription: `The ${row.model} is an air cooled single stage rotary screw compressor for ${applicationFit}. It provides ${row.powerKw} kW power, ${row.flowRateCfm} CFM free air delivery, and ${pressure} working pressure.`,
    flowRateM3Min: '',
    features: [
      'Air cooled',
      `Working pressure ${pressure}`,
      `Free air delivery ${row.flowRateCfm} CFM`,
      `Motor nominal power ${row.powerKw} kW`,
    ],
    specifications: [
      { label: 'Power', value: `${row.powerKw} kW` },
      { label: 'Free air delivery', value: `${row.flowRateCfm} CFM` },
      { label: 'Working pressure', value: pressure },
    ],
    applications: ['Industrial air', 'Manufacturing', 'General plant air'],
  };
});
