import { SiteText } from '@/lib/SiteText';
﻿import { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import type { Product } from '@/lib/data';
import { productFamily } from '@/lib/productSelection';
import type { PublicContent } from '@/lib/publicContent';

export default function ProductHeroSlider({ products, slides, onNavigate }: { slides: PublicContent['heroSlides']; products: Product[]; onNavigate: (page: string, param?: string) => void }) {
  const [active, setActive] = useState(0);
  useEffect(() => { if (slides.length < 2) return; const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 5000); return () => clearInterval(timer); }, [slides.length]);
  const slide = slides[active % slides.length];
  if (!slide) return null;
  const familyProducts = products.filter(item => productFamily(item) === slide.series);
  const product = slide.preferredModels
    .map(model => familyProducts.find(item => item.model.toUpperCase() === model.toUpperCase()))
    .find(Boolean) || familyProducts[0];
  const productImage = slide.imageUrl || product?.imageUrl;
  return <section aria-label="Compressor product series" aria-roledescription="carousel" className="catalog-hero relative isolate overflow-hidden bg-[#ffbd00] text-slate-950">
    <div className="absolute inset-0 -z-20" aria-hidden="true">{slides.map((item, index) => <img key={item.id} src={item.background} alt="" className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 motion-reduce:transition-none ${active % slides.length === index ? 'opacity-70' : 'opacity-0'}`} />)}</div>
    <div className="catalog-hero-wash absolute inset-0 -z-10" />
    <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1400px] flex-col px-5 pb-4 pt-8 sm:px-8 lg:min-h-[760px] lg:px-12 lg:pt-12">
      <div key={slide.id} className="catalog-hero-slide grid flex-1 items-center gap-4 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="pb-2 lg:pb-8" aria-live="off">
          <div className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.16em] sm:text-base"><span className="h-[3px] w-10 bg-red-700 sm:w-12" />{slide.series}{" "}<SiteText section="ProductHeroSlider" name="series" />{" "}<span className="font-medium text-slate-600">/</span> {slide.range}</div>
          <h1 className="mt-5 whitespace-pre-line text-[clamp(2.1rem,4vw,3.75rem)] font-black leading-[1.04] tracking-tight">{slide.title}</h1>
          <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-800">{slide.intro}</p>
          <ul className="mt-6 grid max-w-xl gap-3">{slide.highlights.map(highlight => <li key={highlight} className="flex items-start gap-3 text-sm font-semibold leading-6"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"><Check className="h-3 w-3" /></span>{highlight}</li>)}</ul>
          <button onClick={() => onNavigate('products', slide.series.toLowerCase())} className="mt-7 inline-flex items-center gap-4 rounded-md bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-700/20 transition hover:bg-red-700"><SiteText section="ProductHeroSlider" name="explore" />{" "}{slide.series}<ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="relative flex min-h-[230px] items-center justify-center pb-2 lg:min-h-[390px] lg:pb-0">
          <div className="absolute inset-x-14 bottom-8 h-10 rounded-full bg-slate-950/18 blur-2xl" aria-hidden="true" />
          {productImage ? <img key={`${slide.id}-${product?.id || productImage}`} src={productImage} alt={product?.model || `${slide.series} compressor`} className="relative max-h-[260px] w-full object-contain drop-shadow-2xl sm:max-h-[320px] lg:max-h-[400px]" /> : <div className="relative rounded-md border border-red-700/20 bg-amber-50/90 p-8 text-center shadow-xl"><Gauge className="mx-auto h-16 w-16 text-slate-800" /><p className="mt-4 text-2xl font-extrabold"><SiteText section="ProductHeroSlider" name="fsl_series" /></p><p className="mt-3 max-w-xs text-sm leading-6"><SiteText section="ProductHeroSlider" name="contact_our_team_for_current_product_availability" /></p></div>}
        </div>
      </div>
    </div>
    <button aria-label="Previous slide" onClick={() => setActive(index => (index + slides.length - 1) % slides.length)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-950/20 bg-white/80 p-3 text-slate-950 shadow-lg backdrop-blur transition hover:bg-red-600 hover:text-white sm:left-6 lg:left-8"><ChevronLeft className="h-5 w-5" /></button>
    <button aria-label="Next slide" onClick={() => setActive(index => (index + 1) % slides.length)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-950/20 bg-white/80 p-3 text-slate-950 shadow-lg backdrop-blur transition hover:bg-red-600 hover:text-white sm:right-6 lg:right-8"><ChevronRight className="h-5 w-5" /></button>
  </section>;
}
