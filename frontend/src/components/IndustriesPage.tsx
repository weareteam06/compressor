import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2 } from 'lucide-react';
import type { Industry, Product } from '@/lib/data';
import { getIndustries, getIndustryBySlug, getProducts } from '@/lib/data';
import { compressorSeriesGuide } from '@/components/CompressorSeriesGuide';

interface Props {
  onNavigate: (page: string, param?: string) => void;
  slug?: string;
}

export default function IndustriesPage({ onNavigate, slug }: Props) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [current, setCurrent] = useState<Industry | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      Promise.all([getIndustryBySlug(slug), getProducts()]).then(([selectedIndustry, products]) => {
        setCurrent(selectedIndustry || null);
        setRelatedProducts(selectedIndustry
          ? selectedIndustry.recommendedProducts
              .map(model => products.find(product => product.model.toUpperCase() === model.toUpperCase()))
              .filter((product): product is Product => Boolean(product))
          : []);
        setLoading(false);
      });
    } else {
      getIndustries().then(i => { setIndustries(i); setLoading(false); });
    }
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>;

  // Detail view
  if (slug && current) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <section className="page-hero relative bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={current.imageUrl} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>
          <div className="relative max-w-[1400px] mx-auto px-4 lg:px-8">
            <button onClick={() => onNavigate('industries')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to All Industries
            </button>
            <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">Industry Solutions</div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">{current.name}</h1>
            <p className="mt-4 text-lg text-red-200/80 max-w-3xl">{current.shortDescription}</p>
          </div>
        </section>

        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-16">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-xl mb-8">
            <p className="text-lg text-slate-700 leading-relaxed">{current.fullDescription}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-5">Key Applications</h2>
              <div className="space-y-3">
                {current.applications.map((app, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">{app}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-5">Recommended Products</h2>
              <div className="space-y-3">
                {current.recommendedProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-sm text-red-900 font-bold">{p}</span>
                    <button onClick={() => onNavigate('product-detail', p)} className="text-amber-600 text-xs font-black uppercase tracking-wider">View →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-red-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl">
            <h2 className="text-2xl font-black mb-6">Industry Challenges & Our Solutions</h2>
            <div className="space-y-5">
              {current.challenges.map((ch, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="font-black text-amber-300 mb-2">Challenge: {ch.title}</h3>
                  <p className="text-sm text-red-100/80 leading-relaxed">{ch.solution}</p>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('contact')} className="mt-8 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xl transition-all flex items-center gap-2">
              Request Consultation <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <section className="mt-12">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Recommended Equipment</div>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Related products for {current.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Use these models as a starting point. Final selection should be based on measured airflow, working pressure, duty cycle, and site conditions.</p>
              </div>
              <button onClick={() => onNavigate('products')} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-red-700">
                View all products <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedProducts.map(product => (
                <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
                  <button onClick={() => onNavigate('product-detail', String(product.id))} className="block w-full text-left">
                    <div className="flex h-48 items-center justify-center bg-[#fff8df] p-6">
                      <img src={product.imageUrl} alt={product.model} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{product.series} Series</div>
                      <h3 className="mt-1 text-xl font-black text-slate-950">{product.model}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{product.description}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                        <div><div className="text-[10px] font-bold uppercase text-slate-400">Power</div><div className="mt-1 text-xs font-black text-slate-800">{product.powerKw} kW</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-slate-400">Pressure</div><div className="mt-1 text-xs font-black text-slate-800">{product.pressureMin}-{product.pressureMax} bar</div></div>
                        <div><div className="text-[10px] font-bold uppercase text-slate-400">Flow</div><div className="mt-1 text-xs font-black text-slate-800">{product.flowRateCfm} CFM</div></div>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="page-hero bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">Industries We Serve</div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">Powering Every Industry</h1>
          <p className="mt-4 text-lg text-red-200/80 max-w-3xl">
            From engineering and automotive plants to construction sites and pneumatic conveying, our compressor ranges are designed around each industry's air demand.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <section className="mb-16">
          <div className="mb-8 max-w-3xl">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Application Fit</div>
            <h2 className="brand-display text-3xl font-black text-slate-950 lg:text-5xl">Target industries by compressor series</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Match your industry and air-demand profile to the most suitable firstAir compressor family.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {compressorSeriesGuide.map(item => (
              <article key={item.series} className="flex h-full flex-col rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{item.series}</h3>
                    <p className="mt-1 text-xs font-bold text-red-700">{item.capacity} · {item.pressure}</p>
                  </div>
                  <Building2 className="h-5 w-5 shrink-0 text-amber-500" />
                </div>
                <p className="mb-4 text-sm font-semibold leading-relaxed text-slate-600">{item.positioning}</p>
                <div className="mt-auto border-t border-amber-100 pt-4">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Target Industries</div>
                  <p className="text-sm font-bold leading-relaxed text-slate-800">{item.industries}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-red-600">Industry Solutions</div>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Explore applications in detail</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map(ind => (
            <button key={ind.id} onClick={() => onNavigate('industry-detail', ind.slug)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-300 overflow-hidden text-left hover:shadow-2xl hover:-translate-y-1 transition-all h-full min-h-[420px] lg:h-[420px] flex flex-col">
              <div className="h-56 overflow-hidden flex-shrink-0">
                <img src={ind.imageUrl} alt={ind.name} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Industry</span>
                </div>
                <h3 className="font-black text-slate-900 text-xl group-hover:text-red-700 transition-colors">{ind.name}</h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ind.shortDescription}</p>
                <div className="mt-auto pt-4 flex items-center gap-1.5 text-amber-600 font-black text-xs uppercase tracking-wider">
                  Read More <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
