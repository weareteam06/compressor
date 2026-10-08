import { SiteText } from '@/lib/SiteText';
import { useSiteConfig } from '@/lib/siteConfig';
import ProductHeroSlider from './ProductHeroSlider';
import { Zap, Truck, Package, Settings as SolutionSettings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Factory, Gauge, Headphones, Leaf, Phone, Settings, ShieldCheck, Wind, Wrench } from 'lucide-react';
import type { Industry, Product, SiteConfig } from '@/lib/data';
import { getIndustries, getProducts } from '@/lib/data';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const { config } = useSiteConfig();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getIndustries()])
      .then(([items, industryItems]) => {
        setProducts(items);
        setIndustries(industryItems);


      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return (
    <section className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-5 text-center">
      <div className="max-w-lg"><h1 className="text-3xl font-bold text-slate-950"><SiteText section="HomePage" name="we_could_not_load_the_website_information" /></h1><p className="mt-3 text-slate-600"><SiteText section="HomePage" name="please_check_that_the_application_server_is_running_then_refresh_this_" /></p><button onClick={() => window.location.reload()} className="mt-6 rounded-md bg-red-600 px-6 py-3 font-bold text-white"><SiteText section="HomePage" name="try_again" /></button></div>
    </section>
  );

  if (!config) return <div className="flex min-h-[55vh] items-center justify-center"><div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" /></div>;

  const home = config.home!;
  const openSolution = (solution: NonNullable<SiteConfig['home']>['solutionCards'][number]) => {
    if (solution.url) {
      if (solution.external) window.open(solution.url, '_blank', 'noopener,noreferrer');
      else window.location.assign(solution.url);
      return;
    }
    onNavigate(solution.page || 'products', solution.param);
  };
  const solutionIcons = { 'oil-lubricated': SolutionSettings, 'oil-free': Package, 'variable-speed': Gauge, 'pm-motor': Zap, 'low-pressure': Wind, portable: Truck };

  return (
    <div className="bg-white text-slate-900">
      <ProductHeroSlider slides={config.publicContent.heroSlides} products={products} onNavigate={onNavigate} />

      <section className="py-16 lg:py-20">
        <Container>
          <Heading eyebrow={home.rangeEyebrow} title={home.rangeTitle}>{home.rangeIntro}</Heading>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {home.solutionCards.filter(card => card.active !== false).map(card => <button key={card.id} onClick={() => openSolution(card)} className="group relative flex min-h-[255px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl">
              <div className="absolute inset-y-0 left-0 w-1 bg-red-600 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              <div className="flex h-28 items-center border-b border-slate-100 bg-slate-50 px-6">{(() => { const Icon = solutionIcons[card.id as keyof typeof solutionIcons] || SolutionSettings; return <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-red-100 bg-white text-red-700 shadow-sm transition duration-300 group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white"><Icon aria-hidden="true" className="h-7 w-7" /></span>; })()}</div>
              <div className="flex flex-1 flex-col p-6"><h3 className="text-lg font-extrabold leading-snug text-slate-900">{card.id === 'oil-free' ? 'Ultra Pack' : card.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p><span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-red-700">{home.viewSeriesLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
            </button>)}
          </div>
          <div className="mt-9 text-center"><button onClick={() => onNavigate('products')} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-6 py-3 text-sm font-bold hover:bg-slate-50">{home.viewAllProductsLabel} <ArrowRight className="h-4 w-4" /></button></div>
        </Container>
      </section>

      <section className="bg-slate-950 py-16 text-white lg:py-20"><Container><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div><div className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-400">{home.whyEyebrow}</div><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.whyTitle}</h2><p className="mt-5 leading-7 text-slate-300">{home.whyIntro}</p></div>
        <div className="grid gap-9 sm:grid-cols-2">{home.benefits.map((benefit, index) => <Benefit key={benefit.title} icon={[Leaf, ShieldCheck, Wrench, Headphones][index % 4]} title={benefit.title}>{benefit.description}</Benefit>)}</div>
      </div></Container></section>

      <section className="py-16 lg:py-20"><Container>
        <Heading eyebrow="Solutions for your industry" title={`${home.industriesTitle} — Every Industrial Application`}>{home.industriesIntro}</Heading>
        <div className="mt-10 grid gap-1 overflow-hidden rounded-xl bg-white sm:grid-cols-2 lg:grid-cols-3">
          {industries.slice(0, home.industriesLimit).map((industry, index) => {
            const Icon = [Factory, Settings, ShieldCheck, Gauge, Wrench, CheckCircle2][index % 6];
            return <button key={industry.id} onClick={() => onNavigate('industry-detail', industry.slug)} className="group relative min-h-[280px] overflow-hidden bg-slate-950 p-7 text-left text-white">
              <img src={industry.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={event => { event.currentTarget.style.display = 'none'; }} />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/15 transition group-hover:via-slate-950/60" />
              <span className="relative flex h-full min-h-[224px] flex-col justify-end">
                <span className="mb-auto flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 bg-slate-950/55 backdrop-blur-sm"><Icon className="h-6 w-6 text-amber-400" /></span>
                <span className="text-xl font-extrabold">{industry.name}</span>
                <span className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">{industry.shortDescription}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-400">{home.industryLinkLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </span>
            </button>;
          })}
        </div>
      </Container></section>

      <section className="border-y border-slate-200 bg-amber-50 py-16 lg:py-20"><Container><div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div><Eyebrow>{home.energyEyebrow}</Eyebrow><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.energyTitle}</h2><p className="mt-5 leading-7 text-slate-700">{home.energyIntro}</p><p className="mt-4 leading-7 text-slate-600">{home.energyText}</p><button onClick={() => onNavigate('request', 'Request an Energy Assessment')} className="mt-7 inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-3.5 text-sm font-bold text-white">{home.energyCta}<ArrowRight className="h-4 w-4" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">{home.energyHighlights.map((item, index) => <div key={item} className="rounded-xl border border-amber-200 bg-white p-5"><div className="text-xs font-black text-red-600"><SiteText section="HomePage" name="0" />{index + 1}</div><div className="mt-3 font-extrabold text-slate-950">{item}</div></div>)}</div>
      </div></Container></section>

      <section className="bg-slate-950 py-16 text-white"><Container><Eyebrow>{home.recommendationEyebrow}</Eyebrow><h2 className="mt-4 text-3xl font-extrabold">{home.recommendationTitle}</h2><p className="mt-4 text-slate-300">{home.recommendationText}</p><button onClick={() => onNavigate('request', 'Compressor Recommendation')} className="mt-6 rounded-md bg-red-600 px-6 py-3 font-bold">{home.recommendationButton}</button></Container></section>

      <section className="border-y border-slate-200 bg-[#f7f7f5] py-16 lg:py-20"><Container><div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div><Eyebrow>{home.serviceEyebrow}</Eyebrow><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.serviceTitle}</h2><p className="mt-5 leading-7 text-slate-600">{home.serviceIntro}</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{home.serviceCards.map(item => <div key={item.title} className="border-l-2 border-green-600 pl-4"><div className="flex items-center gap-2 text-sm font-extrabold"><CheckCircle2 className="h-5 w-5 text-green-600" />{item.title}</div><p className="mt-2 text-xs leading-5 text-slate-600">{item.description}</p></div>)}</div></div>
        <div className="rounded-xl bg-[#f9b916] p-7 sm:p-9"><Wrench className="h-10 w-10" /><h3 className="mt-5 text-2xl font-extrabold">{home.serviceCardTitle}</h3><p className="mt-3 leading-7 text-slate-800">{home.serviceCardText}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button onClick={() => onNavigate('request', 'Request Service Support')} className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white">{home.serviceSectionCta}</button><a href={`tel:${config.contact.salesPhone.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-900/30 bg-white/70 px-5 py-3 text-sm font-bold"><Phone className="h-4 w-4" /> {home.callSalesButton}</a></div></div>
      </div></Container></section>

      {home.customerLogos.some(logo => logo.approved && logo.active !== false) && <section className="border-y border-slate-200 bg-slate-50 py-14"><Container><Heading eyebrow={home.customerLogosEyebrow} title={home.customerLogosTitle}>{home.whyIntro}</Heading><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{home.customerLogos.filter(logo => logo.approved && logo.active !== false).map(logo => <a key={logo.name} href={logo.url || undefined} target={logo.url ? '_blank' : undefined} rel={logo.url ? 'noopener noreferrer' : undefined} className="flex h-24 items-center justify-center rounded-lg border border-slate-200 bg-white p-4"><img src={logo.imageUrl} alt={logo.imageAlt} loading="lazy" className="max-h-full max-w-full object-contain" /></a>)}</div></Container></section>}

      <section className="py-16 lg:py-20"><Container><div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="grid grid-cols-2 gap-3">{home.statistics.filter(stat => stat.verified && stat.active !== false).map((stat, index) => <div key={stat.label} className={`rounded-xl p-6 ${index % 2 ? 'bg-red-600 text-white' : 'bg-slate-950 text-white'}`}><div className="text-3xl font-extrabold text-amber-400">{stat.value}</div><div className="mt-2 text-sm text-white/75">{stat.label}</div></div>)}</div>
        <div><Eyebrow>{home.aboutEyebrow}</Eyebrow><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{home.aboutTitle}</h2><p className="mt-5 leading-7 text-slate-600">{config.about.storyShort}</p><button onClick={() => onNavigate('about-story')} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-red-700">{home.aboutButton} <ArrowRight className="h-4 w-4" /></button></div>
      </div></Container></section>

      <section className="bg-red-600 py-12 text-white"><Container><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-extrabold sm:text-3xl">{home.ctaTitle}</h2><p className="mt-2 text-red-100">{home.ctaText}</p></div><button onClick={() => onNavigate('request')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-bold text-red-700">{home.ctaButton} <ArrowRight className="h-4 w-4" /></button></div></Container></section>
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) { return <div className="mx-auto max-w-[1180px] px-5 lg:px-8">{children}</div>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-red-600"><span className="h-0.5 w-8 bg-red-600" />{children}</div>; }
function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <div className="mx-auto max-w-2xl text-center"><div className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">{eyebrow}</div><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{title}</h2><p className="mt-4 leading-7 text-slate-600">{children}</p></div>; }
function Benefit({ icon: Icon, title, children }: { icon: typeof Leaf; title: string; children: React.ReactNode }) { return <div className="border-l border-slate-700 pl-5"><Icon className="h-7 w-7 text-amber-400" /><h3 className="mt-4 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{children}</p></div>; }
