import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, FileText, Gauge, Phone, ShieldCheck, Wrench } from 'lucide-react';
import type { Product, SiteConfig } from '@/lib/data';
import { getProducts, getSiteConfig } from '@/lib/data';
import CompressorSeriesGuide from '@/components/CompressorSeriesGuide';
import CompressorIcon from '@/components/CompressorIcon';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onViewProduct: (id: number | string) => void;
}

const bannerUrl = 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/banner.jpg';

const productOrder = [
  'FAS-4', 'FAS-6', 'FAS-8', 'FAS-11', 'FAS-11(HE)',
  'FAS-15', 'FAS-18', 'FAS-22', 'FAS-30', 'FAS-37', 'FAS-45', 'FAS-55', 'FAS-75',
];

const commonApplications = [
  'Workshops and service bays',
  'Manufacturing plant air',
  'Automotive and fabrication',
  'Packaging and food processing',
  'CNC and precision engineering',
  'Construction and maintenance air',
];

function firstAirProducts(products: Product[]) {
  return products
    .filter(product => /^FAS[-\s]?\d+/i.test(product.model))
    .sort((a, b) => {
      const aIndex = productOrder.indexOf(a.model);
      const bIndex = productOrder.indexOf(b.model);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.powerKw - b.powerKw;
    });
}

export default function HomePage({ onNavigate, onViewProduct }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    Promise.all([getProducts(), getSiteConfig()]).then(([p, cfg]) => {
      setProducts(firstAirProducts(p));
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(index => (index + 1) % Math.max(1, Math.min(4, products.length + 1)));
    }, 6000);
    return () => window.clearInterval(timer);
  }, [products.length]);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const heroSlides = [
    {
      key: 'intro',
      eyebrow: 'Air cooled single stage rotary screw compressors',
      title: config.hero.title,
      body: config.hero.subtitle,
      image: bannerUrl,
      actionLabel: 'View Products',
      action: () => onNavigate('products'),
      secondaryLabel: 'Find a Dealer',
      secondary: () => onNavigate('distributors'),
      product: null as Product | null,
    },
    ...products.slice().sort((a, b) => b.powerKw - a.powerKw).slice(0, 3).map(product => ({
      key: String(product.id),
      eyebrow: `${product.series} product highlight`,
      title: `${product.model} Rotary Screw Compressor`,
      body: product.description,
      image: product.imageUrl,
      actionLabel: 'View Details',
      action: () => onViewProduct(product.id),
      secondaryLabel: 'Get Quote',
      secondary: () => onNavigate('contact'),
      product,
    })),
  ];
  const slide = heroSlides[activeSlide] || heroSlides[0];
  const heroProduct = slide.product || products[products.length - 1] || null;
  const featuredProducts = products.slice(0, 3);
  const goToSlide = (index: number) => setActiveSlide((index + heroSlides.length) % heroSlides.length);

  return (
    <div className="bg-white text-slate-900">
      <section className="relative min-h-[78vh] overflow-hidden bg-slate-950 text-white">
        <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.96),rgba(127,29,29,0.82),rgba(15,23,42,0.52))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-[1440px] flex-col px-5 py-10 lg:px-10">
          <div className="grid flex-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-3xl py-10">
              <div className="inline-flex items-center gap-2 border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-200">
                <CompressorIcon className="h-4 w-4" />
                {slide.eyebrow}
              </div>
              <h1 className="brand-display mt-7 text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-7xl">{slide.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg">{slide.body}</p>

              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  { label: 'Power', value: heroProduct ? `${heroProduct.powerKw} kW` : '4-185 kW' },
                  { label: 'CFM', value: heroProduct ? heroProduct.flowRateCfm : '9-1130' },
                  { label: 'Pressure', value: heroProduct ? `${heroProduct.pressureMin}-${heroProduct.pressureMax} kg/cm2(g)` : '5-16 kg/cm2(g)' },
                ].map(item => (
                  <div key={item.label} className="border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                    <div className="text-xl font-black text-white lg:text-2xl">{item.value}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-200">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={slide.action} className="inline-flex items-center gap-2 bg-red-600 px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-red-950/25 transition-colors hover:bg-red-700">
                  {slide.actionLabel} <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={slide.secondary} className="inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-amber-100">
                  {slide.secondaryLabel}
                </button>
              </div>
            </div>

            <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[560px]">
              <img
                src={heroProduct?.imageUrl || bannerUrl}
                alt={heroProduct?.model || 'firstAir compressor'}
                className="max-h-[520px] w-full max-w-[680px] object-contain drop-shadow-2xl"
              />
              <div className="absolute bottom-4 right-0 bg-slate-950/85 px-5 py-4 text-right backdrop-blur-sm">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-red-200">Featured</div>
                <div className="brand-display text-3xl font-black">{heroProduct?.model || 'FAS Range'}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/12 pt-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2">
              <button onClick={() => goToSlide(activeSlide - 1)} className="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Previous hero slide">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => goToSlide(activeSlide + 1)} className="flex h-11 w-11 items-center justify-center bg-red-600 text-white transition-colors hover:bg-red-700" aria-label="Next hero slide">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:max-w-3xl">
              {heroSlides.map((item, index) => {
                const thumbProduct = item.product || products[products.length - 1] || null;
                return (
                  <button
                    key={item.key}
                    onClick={() => goToSlide(index)}
                    className={`flex items-center gap-3 border px-3 py-2 text-left transition-colors ${activeSlide === index ? 'border-amber-300 bg-amber-300/15' : 'border-white/12 bg-white/8 hover:bg-white/14'}`}
                    aria-label={`Go to hero slide ${index + 1}`}
                  >
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center bg-white">
                      <img src={thumbProduct?.imageUrl || bannerUrl} alt={item.title} className="max-h-11 max-w-full object-contain" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black text-white">{item.product?.model || 'Range'}</span>
                      <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-white/55">{item.product ? `${item.product.powerKw} kW` : 'Overview'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-18 lg:py-24 bg-white">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <div className="text-red-600 font-black text-xs uppercase tracking-[0.25em] mb-3">What is firstAir?</div>
            <h2 className="brand-display text-4xl lg:text-5xl font-black leading-tight">A complete compressor range for industrial air demand</h2>
          </div>
          <div className="text-slate-600 text-lg leading-relaxed space-y-5">
            <p>
              firstAir brings together FAS and FSG rotary screw compressor models for workshops, service bays, manufacturing units, site work, and continuous industrial plant air.
            </p>
            <p>
              The catalog starts with compact FAS packages for smaller air demand and extends through higher-output FAS and FSG models for production environments, maintenance teams, and heavy duty compressed air requirements.
            </p>
            <p>
              Selection can be guided by power, air delivery, pressure, and operating pattern. With efficient motors, air-cooled package design, practical service access, and cataloged brochure data, firstAir focuses on reliable air supply and simpler ownership planning.
            </p>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {[
                { value: '4-185 kW', label: 'FAS + FSG range' },
                { value: '9-1130 CFM', label: 'Air delivery' },
                { value: '5-16 kg/cm2(g)', label: 'Pressure coverage' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="text-2xl font-black text-slate-950">{item.value}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-red-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CompressorSeriesGuide onNavigate={onNavigate} />

      <section className="py-18 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">
            <div>
              <div className="text-red-600 font-black text-xs uppercase tracking-[0.25em] mb-3">Products</div>
              <h2 className="brand-display text-4xl lg:text-5xl font-black">FAS Air Compressors</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredProducts.map(product => (
              <button key={product.id} onClick={() => onViewProduct(product.id)} className="group bg-white border border-red-100 text-left rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-950/10 hover:border-amber-300 transition-all">
                <div className="relative aspect-square bg-gradient-to-br from-[#fff7df] via-white to-red-50 flex items-center justify-center p-7 border-b border-red-50">
                  <span className="absolute top-4 left-4 rounded-full bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">FAS</span>
                  <img src={product.imageUrl} alt={product.model} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="brand-display text-3xl font-black group-hover:text-red-700 transition-colors">{product.model}</h3>
                  <p className="text-sm text-slate-500 mt-2">Free air delivery: {product.flowRateCfm} CFM</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{product.powerKw} kW</span>
                    <span className="inline-flex items-center gap-1 text-red-700 font-black text-xs uppercase tracking-wide group-hover:text-amber-600">
                      Read more <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button onClick={() => onNavigate('products')} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-7 py-4 text-sm font-black uppercase tracking-wide text-white hover:bg-red-700 transition-colors shadow-xl shadow-slate-950/15">
              Browse Complete FAS Range <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-18 lg:py-24 bg-slate-50">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 grid lg:grid-cols-3 gap-7">
          {[
            {
              icon: Wrench,
              title: 'Maintenance friendly design',
              text: 'FAS packages use accessible layouts and proven V-belt drive architecture for practical daily operation.',
            },
            {
              icon: CheckCircle2,
              title: 'IE3 main motors',
              text: 'Driving motors are classified in IE3 energy efficiency class with IP55 protection and Class F insulation.',
            },
            {
              icon: ShieldCheck,
              title: '5 year warranty',
              text: 'Extended warranty support is available when maintenance is performed with genuine firstAir parts.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="border border-slate-200 bg-white rounded-sm p-7 shadow-sm">
              <Icon className="w-9 h-9 text-red-600 mb-6" />
              <h3 className="text-2xl font-black tracking-tight">{title}</h3>
              <p className="text-slate-600 mt-3 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-red-600">Common Applications</div>
            <h2 className="brand-display text-4xl font-black text-slate-950 lg:text-5xl">Compressed air for daily industrial work</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              firstAir compressors are positioned for practical plant air needs: tools, production equipment, packaging lines, cleaning air, CNC support, and site maintenance.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {commonApplications.map(item => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-red-600" />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18 lg:py-24 bg-slate-950 text-white">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-red-400 font-black text-xs uppercase tracking-[0.25em] mb-3">Technical Information</div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">Documents and compressor sizing details</h2>
            <p className="text-white/70 text-lg mt-5 leading-relaxed">
              Use the technical information area for flow, pressure, dimensions, installation, service, and operation documents across the FAS and FSG catalog ranges.
            </p>
          </div>
          <div className="bg-white text-slate-900 p-8 rounded-sm">
            <FileText className="w-10 h-10 text-red-600 mb-5" />
            <h3 className="text-2xl font-black">Not sure which model fits?</h3>
            <p className="text-slate-600 mt-3 leading-relaxed">Share your required pressure, estimated CFM, application, and working hours. The team can help shortlist the right model and accessories.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => onNavigate('technical')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-black text-sm uppercase tracking-wide">
                Technical Information
              </button>
              <button onClick={() => onNavigate('contact')} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-sm font-black text-sm uppercase tracking-wide">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-red-600 text-white">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">Contact Us</h2>
            <p className="text-white/85 mt-2">{config.contact.email} | support@firstaircompressor.com | {config.contact.salesPhone}</p>
          </div>
          <button onClick={() => onNavigate('contact')} className="inline-flex items-center justify-center gap-2 bg-white text-red-700 hover:bg-slate-100 px-7 py-4 rounded-lg font-black uppercase tracking-wide text-sm">
            <Phone className="w-4 h-4" /> Send Us a Message
          </button>
        </div>
      </section>
    </div>
  );
}


