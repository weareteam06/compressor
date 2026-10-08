import type { Product } from '@/lib/data';

type CatalogRow = {
  id: string;
  model: string;
  series: 'FAS' | 'FSG' | 'FASM';
  powerKw: number;
  powerHp: number;
  pressureMin: number;
  pressureMax: number;
  flowRateCfm: string;
  imageUrl: string;
  brochureUrl: string;
  dimensions?: string;
  weightKg?: number;
  outlet?: string;
};

const fasSmallProductImage = '/hero/fas-small-product.png';
const fasLargeCover = '/catalogs/FAS-15-250KW-cover.jpg';
const fsgCover = '/catalogs/FSG-product.png';
const fasmCover = '/catalogs/FASM-product.png';

const rows: CatalogRow[] = [
  { id: 'fas4', model: 'FAS-4', series: 'FAS', powerKw: 4, powerHp: 5, pressureMin: 7, pressureMax: 16, flowRateCfm: '9-19', imageUrl: fasSmallProductImage, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas6', model: 'FAS-6', series: 'FAS', powerKw: 5.5, powerHp: 7.5, pressureMin: 7, pressureMax: 16, flowRateCfm: '13-28', imageUrl: fasSmallProductImage, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas7', model: 'FAS-8', series: 'FAS', powerKw: 7.5, powerHp: 10, pressureMin: 7, pressureMax: 16, flowRateCfm: '21-39', imageUrl: fasSmallProductImage, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas11', model: 'FAS-11', series: 'FAS', powerKw: 11, powerHp: 15, pressureMin: 7, pressureMax: 16, flowRateCfm: '35-62', imageUrl: fasSmallProductImage, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas11he', model: 'FAS-11(HE)', series: 'FAS', powerKw: 11, powerHp: 15, pressureMin: 7, pressureMax: 16, flowRateCfm: '40-76', imageUrl: fasSmallProductImage, brochureUrl: '/catalogs/FAS-4-11.pdf' },
  { id: 'fas15', model: 'FAS-15', series: 'FAS', powerKw: 15, powerHp: 20, pressureMin: 5, pressureMax: 16, flowRateCfm: '51-108', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS15-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas18', model: 'FAS-18', series: 'FAS', powerKw: 18.5, powerHp: 25, pressureMin: 5, pressureMax: 16, flowRateCfm: '60-131', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS18-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas22', model: 'FAS-22', series: 'FAS', powerKw: 22, powerHp: 30, pressureMin: 5, pressureMax: 16, flowRateCfm: '78-145', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS22-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas30', model: 'FAS-30', series: 'FAS', powerKw: 30, powerHp: 40, pressureMin: 5, pressureMax: 16, flowRateCfm: '102-212', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS30-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas37', model: 'FAS-37', series: 'FAS', powerKw: 37, powerHp: 50, pressureMin: 5, pressureMax: 16, flowRateCfm: '134-263', imageUrl: 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/FAS37-400x400.png', brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas45', model: 'FAS-45', series: 'FAS', powerKw: 45, powerHp: 60, pressureMin: 5, pressureMax: 16, flowRateCfm: '171-304', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas55', model: 'FAS-55', series: 'FAS', powerKw: 55, powerHp: 75, pressureMin: 5, pressureMax: 16, flowRateCfm: '207-415', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas75', model: 'FAS-75', series: 'FAS', powerKw: 75, powerHp: 100, pressureMin: 5, pressureMax: 16, flowRateCfm: '279-540', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas90', model: 'FAS-90', series: 'FAS', powerKw: 90, powerHp: 120, pressureMin: 5, pressureMax: 16, flowRateCfm: '350-622', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas110', model: 'FAS-110', series: 'FAS', powerKw: 110, powerHp: 150, pressureMin: 5, pressureMax: 16, flowRateCfm: '408-812', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas132', model: 'FAS-132', series: 'FAS', powerKw: 132, powerHp: 175, pressureMin: 5, pressureMax: 16, flowRateCfm: '487-975', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas160', model: 'FAS-160', series: 'FAS', powerKw: 160, powerHp: 215, pressureMin: 5, pressureMax: 16, flowRateCfm: '572-1123', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas185', model: 'FAS-185', series: 'FAS', powerKw: 185, powerHp: 250, pressureMin: 5, pressureMax: 16, flowRateCfm: '653-1254', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas200', model: 'FAS-200', series: 'FAS', powerKw: 200, powerHp: 270, pressureMin: 5, pressureMax: 16, flowRateCfm: '706-1377', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas220', model: 'FAS-220', series: 'FAS', powerKw: 220, powerHp: 300, pressureMin: 5, pressureMax: 16, flowRateCfm: '777-1430', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fas250', model: 'FAS-250', series: 'FAS', powerKw: 250, powerHp: 335, pressureMin: 5, pressureMax: 16, flowRateCfm: '936-1660', imageUrl: fasLargeCover, brochureUrl: '/catalogs/FAS-15-250KW.pdf' },
  { id: 'fsg270a', model: 'FSG270A', series: 'FSG', powerKw: 45, powerHp: 60, pressureMin: 7, pressureMax: 8, flowRateCfm: '268-275', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg340a', model: 'FSG340A', series: 'FSG', powerKw: 55, powerHp: 75, pressureMin: 7, pressureMax: 12, flowRateCfm: '286-378', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg460a', model: 'FSG460A', series: 'FSG', powerKw: 75, powerHp: 100, pressureMin: 7, pressureMax: 12, flowRateCfm: '364-498', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg760a', model: 'FSG760A', series: 'FSG', powerKw: 110, powerHp: 150, pressureMin: 7, pressureMax: 10, flowRateCfm: '727-745', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg860a', model: 'FSG860A', series: 'FSG', powerKw: 132, powerHp: 175, pressureMin: 7, pressureMax: 12, flowRateCfm: '646-890', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fsg1060a', model: 'FSG1060A', series: 'FSG', powerKw: 185, powerHp: 250, pressureMin: 7, pressureMax: 12, flowRateCfm: '876-1130', imageUrl: fsgCover, brochureUrl: '/catalogs/FSG-45-185KW.pdf' },
  { id: 'fasm08a', model: 'FASM08A', series: 'FASM', powerKw: 7.5, powerHp: 10, pressureMin: 5, pressureMax: 16, flowRateCfm: '11-44', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '680 × 680 × 1220 mm', weightKg: 245, outlet: 'G3/4' },
  { id: 'fasm11a', model: 'FASM11A', series: 'FASM', powerKw: 11, powerHp: 15, pressureMin: 5, pressureMax: 16, flowRateCfm: '18-69', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '680 × 680 × 1240 mm', weightKg: 260, outlet: 'G3/4' },
  { id: 'fasm15a', model: 'FASM15A', series: 'FASM', powerKw: 15, powerHp: 20, pressureMin: 5, pressureMax: 16, flowRateCfm: '24-101', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '680 × 680 × 1240 mm', weightKg: 270, outlet: 'G3/4' },
  { id: 'fasm18a', model: 'FASM18A', series: 'FASM', powerKw: 18.5, powerHp: 25, pressureMin: 5, pressureMax: 16, flowRateCfm: '30-131', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '780 × 780 × 1300 mm', weightKg: 300, outlet: 'G1' },
  { id: 'fasm22a', model: 'FASM22A', series: 'FASM', powerKw: 22, powerHp: 30, pressureMin: 5, pressureMax: 16, flowRateCfm: '39-155', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '780 × 780 × 1300 mm', weightKg: 320, outlet: 'G1' },
  { id: 'fasm30a', model: 'FASM30A', series: 'FASM', powerKw: 30, powerHp: 40, pressureMin: 5, pressureMax: 16, flowRateCfm: '53-212', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '920 × 840 × 1422 mm', weightKg: 425, outlet: 'G1-1/4' },
  { id: 'fasm37a', model: 'FASM37A', series: 'FASM', powerKw: 37, powerHp: 50, pressureMin: 5, pressureMax: 16, flowRateCfm: '66-263', imageUrl: fasmCover, brochureUrl: '/catalogs/FASM.pdf', dimensions: '920 × 840 × 1422 mm', weightKg: 450, outlet: 'G1-1/4' },
];

export const catalogProducts: Product[] = rows.map(row => {
  const pressure = row.pressureMin === row.pressureMax
    ? `${row.pressureMax} kg/cm2(g)`
    : `${row.pressureMin}-${row.pressureMax} kg/cm2(g)`;
  const applicationFit = row.series === 'FASM'
    ? 'variable-demand manufacturing, automotive, electronics, packaging, pharmaceutical, food, CNC, and precision engineering'
    : row.series === 'FSG'
    ? 'site work, maintenance, rental fleets, and high-capacity compressed air demand'
    : row.powerKw >= 30
      ? 'factory plant air, automotive, fabrication, packaging, and continuous production'
      : row.powerKw >= 15
        ? 'small manufacturing units, workshops, CNC support, and general plant air'
        : 'small workshops, service bays, tools, and compact production areas';
  return {
    ...row,
    categoryId: 'cat-air-compressors',
    name: row.series === 'FASM' ? 'Permanent magnet variable speed screw air compressor' : 'Air cooled single stage rotary screw compressor',
    description: `${row.model} is suited for ${applicationFit} with ${row.flowRateCfm} CFM free air delivery.`,
    longDescription: `The ${row.model} is an air cooled single stage rotary screw compressor for ${applicationFit}. It provides ${row.powerKw} kW power, ${row.flowRateCfm} CFM free air delivery, and ${pressure} working pressure.`,
    flowRateM3Min: '',
    features: row.series === 'FASM' ? [
      'Super IE4 permanent magnet motor',
      'Integrated Variable Frequency Drive (VFD)',
      '7-inch color touchscreen with smart monitoring',
      'Coaxial direct transmission',
      'Remote control and maintenance alerts',
      'High-efficiency airend with bearing life up to 60,000 hours',
    ] : [
      'Air cooled', `Working pressure ${pressure}`, `Free air delivery ${row.flowRateCfm} CFM`, `Motor nominal power ${row.powerKw} kW`,
    ],
    specifications: [
      { label: 'Power', value: `${row.powerKw} kW` },
      { label: 'Free air delivery', value: `${row.flowRateCfm} CFM` },
      { label: 'Working pressure', value: pressure },
      ...(row.series === 'FASM' ? [
        { label: 'Motor technology', value: 'IE4 permanent magnet motor' },
        { label: 'Starting method', value: 'Inverter (VFD)' },
        { label: 'Voltage / frequency', value: '400 V / 50 Hz' },
        { label: 'Transmission', value: 'Coaxial direct transmission' },
        { label: 'Dimensions (L × W × H)', value: row.dimensions || '' },
        { label: 'Weight', value: `${row.weightKg} kg` },
        { label: 'Discharge outlet', value: row.outlet || '' },
        { label: 'Cooler outlet temperature', value: 'Ambient temperature +15°C or less' },
      ] : []),
    ],
    applications: ['Industrial air', 'Manufacturing', 'General plant air'],
  };
});
