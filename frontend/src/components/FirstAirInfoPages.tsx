import { CheckCircle2, Download, Factory, FileText, Gauge, ShieldCheck, Wrench } from 'lucide-react';
import type { SiteConfig } from '@/lib/data';
import CompressorSeriesGuide from '@/components/CompressorSeriesGuide';
import CompressorIcon from '@/components/CompressorIcon';

interface Props {
  page: 'about' | 'technical' | 'warranty';
  config: SiteConfig;
  onNavigate: (page: string, param?: string) => void;
}

const pageContent = {
  about: {
    eyebrow: 'About Us',
    title: 'firstAir compressed air solutions for industrial users',
    intro: 'firstAir offers FAS and FSG air-cooled rotary screw compressor ranges for workshops, manufacturing units, service teams, and continuous plant air requirements from compact packages to high-capacity industrial models.',
    icon: CheckCircle2,
    points: [
      'FAS models from compact 4 kW packages through 75 kW industrial units',
      'FSG catalog models from 45 kW through 185 kW for higher-capacity demand',
      'Catalog coverage from 9 to 1130 CFM free air delivery',
      'Pressure coverage from 5 to 16 kg/cm2(g), depending on model and series',
      'Designed for practical ownership with service access, catalog data, and support guidance',
    ],
  },
  technical: {
    eyebrow: 'Technical Information',
    title: 'Technical documents for selecting and operating FAS compressors',
    intro: 'Use the product data sheets and technical information to compare air discharge, pressure, power, dimensions, weight, and package options across the FAS compressor range.',
    icon: FileText,
    points: [
      'Operating pressure: 8 to 10 bar(g)',
      'Air discharge range: 0.52 m3/min to 5.94 m3/min',
      'Motor nominal power range: 4 kW to 37 kW',
      'IE3 energy efficiency class motors',
      'IP55 protection and Class F insulation',
      'Receiver and dryer package options on selected lower-kW models',
    ],
  },
  warranty: {
    eyebrow: 'Warranty Information',
    title: '5 year warranty support with genuine firstAir parts',
    intro: 'firstAir warranty support is designed around correct maintenance, genuine parts, and regular service practices that protect compressor reliability.',
    icon: ShieldCheck,
    points: [
      '5 year warranty program for eligible compressors',
      'Use genuine firstAir parts during recommended service intervals',
      'Keep maintenance records for warranty support',
      'Contact the support team for service, parts, and warranty guidance',
      'Support email: support@firstaircompressor.com',
    ],
  },
};

const technicalChecklist = [
  {
    icon: CompressorIcon,
    title: 'Confirm Air Demand',
    text: 'Estimate current and future CFM requirement, including leakage, standby equipment, and peak production demand.',
  },
  {
    icon: Gauge,
    title: 'Select Working Pressure',
    text: 'Choose pressure based on the highest required tool or process pressure, then allow margin for pipe losses.',
  },
  {
    icon: ShieldCheck,
    title: 'Match Duty Pattern',
    text: 'Use fixed speed for steady demand, VFD for variable demand, portable units for site work, and low pressure units for high-volume process air.',
  },
];

const brochures = [
  { title: 'FAS 4-11 kW Catalog', detail: 'Compact FAS range for smaller industrial air requirements.', href: '/catalogs/FAS-4-11.pdf' },
  { title: 'FAS 15-250 kW Catalog', detail: 'Larger FAS models for heavy duty plant air applications.', href: '/catalogs/FAS-15-250KW.pdf' },
  { title: 'FSG 45-185 kW Catalog', detail: 'FSG compressor range for higher capacity requirements.', href: '/catalogs/FSG-45-185KW.pdf' },
];

const technicalFaqs = [
  {
    question: 'How do I choose the right CFM?',
    answer: 'Add the air consumption of tools or machines that run together, then include margin for leakage and future demand. CFM is usually more important than motor kW during model selection.',
  },
  {
    question: 'When should I add an air receiver?',
    answer: 'A receiver helps stabilize pressure, reduce short cycling, and support short bursts of high demand. It is especially useful for workshops and intermittent air use.',
  },
  {
    question: 'Do I need a dryer and filters?',
    answer: 'Use a refrigeration dryer and filtration when air quality matters for tools, pneumatic valves, painting, food processing, packaging, CNC, or moisture-sensitive equipment.',
  },
  {
    question: 'What pressure should I select?',
    answer: 'Start from the highest required point-of-use pressure and include allowance for pressure drop through piping, dryer, filters, and distance from the compressor room.',
  },
];

const warrantyFaqs = [
  {
    question: 'What helps keep warranty support valid?',
    answer: 'Use genuine firstAir parts, follow recommended service intervals, maintain clean ventilation, and keep service records for oil, filters, separator elements, and inspections.',
  },
  {
    question: 'Who should service the compressor?',
    answer: 'Use an authorized or qualified service technician familiar with rotary screw compressors, electrical checks, oil systems, separator elements, and safety procedures.',
  },
  {
    question: 'What information is useful for warranty support?',
    answer: 'Share the model, serial number, running hours, installation details, maintenance history, fault symptoms, and photos or videos when available.',
  },
  {
    question: 'Does air quality affect warranty life?',
    answer: 'Dusty rooms, poor ventilation, high ambient temperature, blocked coolers, or incorrect oil and filters can reduce reliability and should be corrected early.',
  },
];

const aboutHighlights = [
  {
    icon: Factory,
    title: 'Built Around Real Applications',
    text: 'The catalog supports workshops, automotive service, fabrication, packaging, food processing, CNC support, plant air, construction, maintenance, and rental use.',
  },
  {
    icon: Gauge,
    title: 'Selection Starts With Demand',
    text: 'Model selection is guided by required CFM, pressure, duty pattern, operating hours, receiver sizing, dryer need, and future expansion.',
  },
  {
    icon: Wrench,
    title: 'Designed For Ownership',
    text: 'firstAir content focuses on practical operation: readable specifications, brochure downloads, maintenance notes, warranty guidance, and easy contact paths.',
  },
];

export default function FirstAirInfoPages({ page, config, onNavigate }: Props) {
  const content = pageContent[page];
  const configured = page === 'about' ? undefined : config.pages?.[page];
  const Icon = content.icon;
  const title = page === 'about' ? content.title : configured?.title || content.title;
  const intro = page === 'about' ? content.intro : configured?.intro || content.intro;
  const eyebrow = configured?.eyebrow || content.eyebrow;
  const points = configured?.points?.length ? configured.points : content.points;

  return (
    <div className="min-h-screen bg-white">
      <section className="page-hero bg-gradient-to-br from-slate-950 via-red-950 to-red-700 py-20">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8">
          <div className="text-amber-300 font-black text-xs uppercase tracking-[0.25em] mb-3">{eyebrow}</div>
          <h1 className="brand-display text-4xl lg:text-6xl font-black text-white max-w-4xl">{title}</h1>
          <p className="mt-5 text-lg text-white/70 max-w-3xl leading-relaxed">{intro}</p>
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
        <div>
          <Icon className="w-14 h-14 text-red-600 mb-6" />
          <h2 className="brand-display text-3xl font-black">firstAir Compressor</h2>
          <p className="text-slate-600 mt-4 leading-relaxed">
            firstAir helps buyers compare compressor series, review technical data, download brochures, and contact the team with clearer requirements before selecting a model.
          </p>
          {page === 'about' && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { value: '4-185 kW', label: 'Catalog power' },
                { value: '9-1130', label: 'CFM range' },
                { value: '5-16', label: 'kg/cm2(g)' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-lg font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-red-600">{item.label}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => onNavigate('products')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide">
              View Products
            </button>
            <button onClick={() => onNavigate('contact')} className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide">
              Contact Us
            </button>
          </div>
        </div>

        <div className="border border-red-100 rounded-xl p-8 shadow-sm">
          <div className="space-y-4">
            {points.map(point => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 font-medium leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {page === 'about' && (
        <section className="bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">How We Help</div>
              <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">Clear compressor information for confident buying</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The About Us page should do more than introduce the brand. It should help visitors understand what firstAir sells, where the compressors fit, and how to start the selection conversation.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {aboutHighlights.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <Icon className="mb-5 h-9 w-9 text-red-600" />
                  <h3 className="text-xl font-black text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {page === 'technical' && (
        <>
          <CompressorSeriesGuide variant="table" onNavigate={onNavigate} />

          <section className="bg-slate-50 py-16 lg:py-20">
            <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
              <div className="mb-9 max-w-3xl">
                <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Before Selection</div>
                <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">What buyers should check first</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  A compressor should be selected from the real site requirement, not only from motor kW. These checks make the inquiry clearer and help the team recommend the right model.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {technicalChecklist.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <Icon className="mb-5 h-9 w-9 text-red-600" />
                    <h3 className="text-xl font-black text-slate-950">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 lg:py-20">
            <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
              <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Catalog Downloads</div>
                  <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">Product brochures</h2>
                </div>
                <button onClick={() => onNavigate('contact')} className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-red-700">
                  Request Technical Help
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {brochures.map(item => (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group rounded-lg border border-red-100 bg-white p-6 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50">
                    <Download className="mb-5 h-8 w-8 text-red-600" />
                    <h3 className="text-xl font-black text-slate-950 group-hover:text-red-700">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                    <div className="mt-5 text-xs font-black uppercase tracking-widest text-red-700">Open PDF</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {page !== 'about' && (
        <section className="bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="mb-9 max-w-3xl">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">FAQ</div>
              <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">
                {page === 'technical' ? 'Common technical questions' : 'Warranty and service questions'}
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {(page === 'technical' ? technicalFaqs : warrantyFaqs).map(item => (
                <article key={item.question} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-950">{item.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
