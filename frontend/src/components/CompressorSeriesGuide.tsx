import { ArrowRight, Factory, Gauge, Settings2 } from 'lucide-react';
import CompressorIcon from '@/components/CompressorIcon';

export const compressorSeriesGuide = [
  {
    series: 'FAS Fixed Speed',
    capacity: '4-250 kW',
    technology: 'Fixed speed rotary screw',
    pressure: '7-13 bar',
    positioning: 'Standard industrial compressor',
    industries: 'Engineering, automotive, textile, food, pharma, steel, cement, plastics',
    summary: 'Best for stable air demand and everyday industrial compressed air use.',
  },
  {
    series: 'FAS VFD',
    capacity: '4-250 kW',
    technology: 'Variable Frequency Drive (VFD)',
    pressure: '7-13 bar',
    positioning: 'Energy-saving compressor',
    industries: 'Manufacturing plants with variable air demand',
    summary: 'Best when air consumption changes during shifts and energy saving matters.',
  },
  {
    series: 'FASM',
    capacity: '7.5-37 kW',
    technology: 'PM motor + VFD',
    pressure: '7-13 bar',
    positioning: 'Premium energy-efficient compressor',
    industries: 'Automotive, electronics, packaging, pharma, food, CNC, precision engineering',
    summary: 'Best for high-efficiency operation in precision and continuous-use applications.',
  },
  {
    series: 'FSG',
    capacity: 'As per catalogue',
    technology: 'Portable electric screw compressor',
    pressure: '7-13 bar',
    positioning: 'Mobile compressed air',
    industries: 'Construction, mining, infrastructure, maintenance, rental',
    summary: 'Best for project sites, mobile service needs, and rental fleets.',
  },
  {
    series: 'FSL',
    capacity: 'As per catalogue',
    technology: 'Low pressure rotary screw compressor',
    pressure: 'Up to 5 bar',
    positioning: 'High-volume, low-pressure applications',
    industries: 'Cement, fly ash, pneumatic conveying, water treatment, textile, glass, food, paper',
    summary: 'Best for process air where volume is more important than high pressure.',
  },
];

type Variant = 'cards' | 'table';

interface Props {
  variant?: Variant;
  onNavigate?: (page: string, param?: string) => void;
}

export default function CompressorSeriesGuide({ variant = 'cards', onNavigate }: Props) {
  if (variant === 'table') {
    return (
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Selection Guide</div>
              <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">Compare Compressor Series</h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                Use this guide to understand which compressor family fits your capacity, pressure, mobility, and industry requirement before selecting a model.
              </p>
            </div>
            {onNavigate && (
              <button onClick={() => onNavigate('contact')} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-red-600/20 hover:bg-red-700">
                Get Sizing Help <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-slate-200 shadow-sm lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  {['Series', 'Capacity', 'Technology', 'Pressure Range', 'Positioning', 'Target Industries'].map(header => (
                    <th key={header} className="border-r border-white/10 px-4 py-4 font-black uppercase tracking-wide last:border-r-0">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compressorSeriesGuide.map((item, index) => (
                  <tr key={item.series} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-base font-black text-slate-950">{item.series}</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 font-bold text-slate-700">{item.capacity}</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{item.technology}</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 font-bold text-red-700">{item.pressure}</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-slate-700">{item.positioning}</td>
                    <td className="border-t border-slate-200 px-4 py-4 text-slate-700">{item.industries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {compressorSeriesGuide.map(item => (
              <article key={item.series} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black text-slate-950">{item.series}</h3>
                  <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black text-red-700">{item.pressure}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-600">{item.summary}</p>
                <div className="mt-4 grid gap-3 text-sm">
                  <div><span className="font-black text-slate-950">Capacity:</span> {item.capacity}</div>
                  <div><span className="font-black text-slate-950">Technology:</span> {item.technology}</div>
                  <div><span className="font-black text-slate-950">Industries:</span> {item.industries}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-amber-200 bg-[#fff8df] py-16 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Selection Guide</div>
          <h2 className="brand-display text-4xl font-black leading-tight text-slate-950 lg:text-5xl">Choose the right compressor series</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Start with the application: steady demand, variable demand, mobile air, or low-pressure high-volume use. Then compare the exact model by kW, CFM, and pressure.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {compressorSeriesGuide.map((item, index) => {
            const Icon = index === 0 ? Factory : index === 1 ? CompressorIcon : index === 2 ? Settings2 : index === 3 ? Gauge : Factory;
            return (
              <article key={item.series} className="flex min-h-[260px] flex-col rounded-lg border border-amber-200 bg-white p-5 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50">
                <Icon className="mb-5 h-8 w-8 text-red-600" />
                <h3 className="text-xl font-black text-slate-950">{item.series}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-600">{item.summary}</p>
                <div className="mt-auto pt-5">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{item.capacity}</div>
                  <div className="mt-1 text-sm font-bold text-red-700">{item.pressure}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
