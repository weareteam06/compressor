import { SiteText } from '@/lib/SiteText';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Gauge } from 'lucide-react';
import type { Industry, Product } from '@/lib/data';
import { getIndustries, getIndustryBySlug, getProducts } from '@/lib/data';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props { onNavigate: (page: string, param?: string) => void; slug?: string; }

export default function IndustriesPage({ onNavigate, slug }: Props) {
  const listCopy = usePageContent('industries', defaultPageContent.industries);
  const detailCopy = usePageContent('industryDetail', defaultPageContent.industryDetail);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [current, setCurrent] = useState<Industry | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!slug) { getIndustries().then(items => { setIndustries(items); setLoading(false); }); return; }
    Promise.all([getIndustryBySlug(slug), getProducts()]).then(([industry, products]) => {
      setCurrent(industry || null);
      const normalize = (value: string) => value.replace(/[^a-z0-9]/gi, '').toUpperCase();
      setRelatedProducts(industry ? industry.recommendedProducts.map(model => products.find(product => normalize(product.model) === normalize(model))).filter((product): product is Product => Boolean(product)) : []);
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-red-100 border-t-red-600" /></div>;
  if (slug && !current) return <div className="min-h-screen flex items-center justify-center text-slate-500">{String(detailCopy.notFoundText)}</div>;
  if (current) return <IndustryDetail industry={current} products={relatedProducts} copy={detailCopy} onNavigate={onNavigate} />;

  return <div className="min-h-screen bg-slate-50 pb-20"><main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
    <section className="grid overflow-hidden bg-slate-950 text-white lg:grid-cols-[1fr_360px]">
      <div className="p-8 lg:p-10"><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">{String(listCopy.heroEyebrow)}</div><h1 className="mt-3 text-4xl font-black">{String(listCopy.heroTitle)}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-300">{String(listCopy.heroIntro)}</p></div>
      <div className="flex items-center justify-between bg-amber-400 p-8 text-slate-950"><div><strong className="block text-5xl font-black">{industries.length}</strong><span className="text-xs font-black uppercase tracking-widest">{String(listCopy.countLabel)}</span></div><Gauge className="h-12 w-12" /></div>
    </section>
    <section className="mt-10"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.2em] text-red-700">{String(listCopy.directoryEyebrow)}</div><h2 className="mt-2 text-3xl font-black text-slate-950">{String(listCopy.directoryTitle)}</h2></div><p className="max-w-xl text-sm leading-6 text-slate-600">{String(listCopy.directoryIntro)}</p></div>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">{industries.map((industry, index) => <button key={industry.id} onClick={() => onNavigate('industry-detail', industry.slug)} className="group grid overflow-hidden border border-slate-200 bg-white text-left transition hover:border-amber-400 hover:shadow-lg sm:grid-cols-[190px_1fr]">
        <div className="relative min-h-48 overflow-hidden"><img src={industry.imageUrl} alt={industry.imageAlt || `${industry.name} compressed-air application`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-3 top-3 bg-slate-950 px-2.5 py-1 text-[10px] font-black text-amber-400">{String(index + 1).padStart(2, '0')}</span></div>
        <div className="flex flex-col p-5"><div className="flex items-start justify-between gap-4"><h3 className="text-xl font-black text-slate-950 group-hover:text-red-700">{industry.name}</h3><ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1"/></div><p className="mt-2 text-sm leading-6 text-slate-600">{industry.shortDescription}</p><div className="mt-auto border-t border-slate-200 pt-3"><div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-700">{String(listCopy.applicationsLabel)}</div><div className="flex flex-wrap gap-2">{industry.applications.slice(0, 3).map(item => <span key={item} className="bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-slate-700">{item}</span>)}</div></div></div>
      </button>)}</div>
    </section>
  </main></div>;
}

function IndustryDetail({ industry, products, copy, onNavigate }: { industry: Industry; products: Product[]; copy: Record<string, unknown>; onNavigate: Props['onNavigate'] }) {
  const expertCta = 'Connect with our expert';
  return <div className="min-h-screen bg-slate-50 pb-20">
    <main>
      <section className="bg-white"><div className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8"><button onClick={() => onNavigate('industries')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-700"><ArrowLeft className="h-4 w-4"/>{String(copy.backLabel)}</button>
        <div className="mt-6 grid overflow-hidden lg:grid-cols-[410px_1fr]"><div className="flex flex-col justify-between bg-amber-400 p-8 lg:p-10"><div><div className="text-xs font-black uppercase tracking-[0.22em] text-red-800">{String(copy.eyebrow)}</div><h1 className="mt-4 text-4xl font-black leading-tight text-slate-950">{String(copy.heroPrefix)} {industry.name}</h1><p className="mt-5 leading-7 text-slate-800">{industry.shortDescription}</p></div><button onClick={() => onNavigate('request')} className="mt-8 inline-flex w-fit items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white">{expertCta}<ArrowRight className="h-4 w-4"/></button></div>
          <div className="relative min-h-[380px]"><img src={industry.imageUrl} alt={industry.imageAlt || `${industry.name} compressed-air solution`} className="absolute inset-0 h-full w-full object-cover"/></div></div>
      </div></section>

      <div className="mx-auto max-w-[1100px] space-y-12 px-5 py-12 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-2"><TextPanel eyebrow={String(copy.challengeLabel)} title={String(copy.challengeTitle)} text={industry.challengeIntro || industry.fullDescription}/><TextPanel eyebrow={String(copy.solutionLabel)} title={String(copy.solutionTitle)} text={industry.solutionIntro || industry.fullDescription} accent/></section>
        <section className="grid gap-7 lg:grid-cols-2"><ListPanel title={String(copy.applicationsTitle)} items={industry.applications}/><ListPanel title={String(copy.benefitsTitle)} items={industry.benefits || []}/></section>

        {industry.challenges.length > 0 && <section className="bg-slate-950 p-8 text-white lg:p-10"><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">{String(copy.challengesEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.challengesTitle)}</h2><div className="mt-7 grid gap-5 md:grid-cols-2">{industry.challenges.map((item, index) => <article key={item.title} className="border-t border-white/20 pt-5"><div className="text-xs font-black text-amber-400">{String(index + 1).padStart(2, '0')}</div><h3 className="mt-3 font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{item.solution}</p></article>)}</div></section>}

        <section><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{String(copy.relatedEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.recommendationsTitle)}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{String(copy.relatedIntro)}</p></div><button onClick={() => onNavigate('products')} className="inline-flex items-center gap-2 text-sm font-black uppercase text-red-700">{String(copy.allProductsLabel)}<ArrowRight className="h-4 w-4"/></button></div>
          {products.length > 0 ? <div className="mt-7 grid gap-5 md:grid-cols-3">{products.map(product => <button key={product.id} onClick={() => onNavigate('product-detail', String(product.id))} className="border border-slate-200 bg-white p-5 text-left hover:border-red-400"><img src={product.imageUrl} alt={product.model} loading="lazy" className="h-36 w-full object-contain"/><h3 className="mt-4 text-xl font-black">{product.model}</h3><p className="mt-1 text-sm text-slate-600">{product.powerKw}{" "}<SiteText section="IndustriesPage" name="kw" />{" "}{product.flowRateCfm}{" "}<SiteText section="IndustriesPage" name="cfm" /></p></button>)}</div> : <div className="mt-6 border border-dashed border-slate-300 p-6 text-sm text-slate-500">{String(copy.noProductsText)}</div>}
        </section>

        <section className="flex flex-col items-start justify-between gap-6 bg-red-700 p-8 text-white sm:flex-row sm:items-center"><div><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">{String(copy.ctaEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.ctaTitle)}</h2><p className="mt-2 text-sm text-red-100">{String(copy.ctaText)}</p></div><button onClick={() => onNavigate('request')} className="shrink-0 bg-amber-400 px-6 py-4 text-sm font-black uppercase text-slate-950">{expertCta}</button></section>
      </div>
    </main>
  </div>;
}

function TextPanel({ eyebrow, title, text, accent = false }: { eyebrow: string; title: string; text: string; accent?: boolean }) { return <article className={`p-7 ${accent ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200'}`}><div className="text-xs font-black uppercase tracking-widest text-red-700">{eyebrow}</div><h2 className="mt-2 text-2xl font-black">{title}</h2><p className="mt-4 leading-7 text-slate-700">{text}</p></article>; }
function ListPanel({ title, items }: { title: string; items: string[] }) { return <article className="border border-slate-200 bg-white p-7"><h2 className="text-2xl font-black">{title}</h2><div className="mt-5 space-y-3">{items.map(item => <div key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600"/><span className="text-sm leading-6 text-slate-700">{item}</span></div>)}</div></article>; }
