import { SiteText } from '@/lib/SiteText';
import { usePublicContent } from '@/lib/publicContent';
import { CheckCircle2, Download, Factory, FileText, Gauge, ShieldCheck, Wrench } from 'lucide-react';
import type { SiteConfig } from '@/lib/data';
import CompressorSeriesGuide from '@/components/CompressorSeriesGuide';
import CompressorIcon from '@/components/CompressorIcon';

interface Props {
  page: 'about' | 'technical' | 'warranty';
  config: SiteConfig;
  onNavigate: (page: string, param?: string) => void;
}

export default function FirstAirInfoPages({ page, config, onNavigate }: Props) {
  const { infoPages: pageContent, technicalChecklist, brochures, technicalFaqs, warrantyFaqs, aboutHighlights } = usePublicContent();
  const icons: Record<string, React.ElementType> = { CheckCircle2, FileText, ShieldCheck, Gauge, Factory, Wrench, CompressorIcon };
  const content = pageContent[page];
  const configured = page === 'about' ? undefined : config.pages?.[page];
  const Icon = icons[content.icon] || FileText;
  const title = page === 'about' ? content.title : configured?.title || content.title;
  const intro = page === 'about' ? content.intro : configured?.intro || content.intro;
  const eyebrow = configured?.eyebrow || content.eyebrow;
  const points = configured?.points ?? content.points;
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[1180px] mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
        <div>
          <div className="mb-8 border-b border-slate-300 pb-6"><div className="text-xs font-black uppercase tracking-[0.2em] text-red-700">{eyebrow}</div><h1 className="brand-display mt-2 text-3xl font-black text-slate-950">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{intro}</p></div>
          <Icon className="w-14 h-14 text-red-600 mb-6" />
          <h2 className="brand-display text-3xl font-black"><SiteText section="FirstAirInfoPages" name="firstair_compressor" /></h2>
          <p className="text-slate-600 mt-4 leading-relaxed">{" "}<SiteText section="FirstAirInfoPages" name="firstair_helps_buyers_compare_compressor_series_review_technical_data_" />{" "}</p>
          {page === 'about' && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { value: '4-250 kW', label: 'Catalog power' },
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
            <button onClick={() => onNavigate('products')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide">{" "}<SiteText section="FirstAirInfoPages" name="view_products" />{" "}</button>
            <button onClick={() => onNavigate('request')} className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wide">{" "}<SiteText section="FirstAirInfoPages" name="contact_us" />{" "}</button>
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
              <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600"><SiteText section="FirstAirInfoPages" name="how_we_help" /></div>
              <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl"><SiteText section="FirstAirInfoPages" name="clear_compressor_information_for_confident_buying" /></h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">{" "}<SiteText section="FirstAirInfoPages" name="the_about_us_page_should_do_more_than_introduce_the_brand_it_should_he" />{" "}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {aboutHighlights.map(({ title, text }) => (
                <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <CheckCircle2 className="mb-5 h-9 w-9 text-red-600" />
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
                <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600"><SiteText section="FirstAirInfoPages" name="before_selection" /></div>
                <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl"><SiteText section="FirstAirInfoPages" name="what_buyers_should_check_first" /></h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">{" "}<SiteText section="FirstAirInfoPages" name="a_compressor_should_be_selected_from_the_real_site_requirement_not_onl" />{" "}</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {technicalChecklist.map(({ title, text }) => (
                  <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <CheckCircle2 className="mb-5 h-9 w-9 text-red-600" />
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
                  <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600"><SiteText section="FirstAirInfoPages" name="catalog_downloads" /></div>
                  <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl"><SiteText section="FirstAirInfoPages" name="product_brochures" /></h2>
                </div>
                <button onClick={() => onNavigate('request')} className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-red-700">{" "}<SiteText section="FirstAirInfoPages" name="request_technical_help" />{" "}</button>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {brochures.map(item => (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="group rounded-lg border border-red-100 bg-white p-6 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50">
                    <Download className="mb-5 h-8 w-8 text-red-600" />
                    <h3 className="text-xl font-black text-slate-950 group-hover:text-red-700">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                    <div className="mt-5 text-xs font-black uppercase tracking-widest text-red-700"><SiteText section="FirstAirInfoPages" name="open_pdf" /></div>
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
              <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600"><SiteText section="FirstAirInfoPages" name="faq" /></div>
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
