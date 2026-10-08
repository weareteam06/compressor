import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Gauge, Package, PhoneCall, RefreshCw, Settings, ShieldCheck, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Service } from '@/lib/data';
import { getServices, getServiceBySlug } from '@/lib/data';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props { onNavigate: (page: string, param?: string) => void; slug?: string }
const iconMap: Record<string, LucideIcon> = { Wrench, Settings, RefreshCw, Package, Gauge, ShieldCheck };

export default function ServicesPage({ onNavigate, slug }: Props) {
  const listCopy = usePageContent('services', defaultPageContent.services);
  const detailCopy = usePageContent('serviceDetail', defaultPageContent.serviceDetail);
  const [services, setServices] = useState<Service[]>([]);
  const [current, setCurrent] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true); setFailed(false);
    const request = slug ? getServiceBySlug(slug) : getServices();
    request.then(result => slug ? setCurrent((result as Service | undefined) || null) : setServices(result as Service[])).catch(() => setFailed(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageState><div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" /></PageState>;
  if (failed) return <PageState><h1 className="text-3xl font-black">{String(listCopy.errorTitle)}</h1><p className="mt-3 text-slate-600">{String(listCopy.errorText)}</p><button onClick={() => window.location.reload()} className="mt-6 bg-red-600 px-6 py-3 text-sm font-bold text-white">{String(listCopy.retryLabel)}</button></PageState>;
  if (slug && !current) return <PageState><h1 className="text-3xl font-black">{String(detailCopy.notFoundText)}</h1><button onClick={() => onNavigate('services')} className="mt-6 inline-flex items-center gap-2 bg-slate-950 px-6 py-3 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4"/>{String(detailCopy.backLabel)}</button></PageState>;
  if (current) return <ServiceDetail service={current} copy={detailCopy} onNavigate={onNavigate}/>;

  return <div className="min-h-screen bg-slate-50 pb-20"><main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
    <section className="grid overflow-hidden bg-slate-950 text-white lg:grid-cols-[1fr_360px]"><div className="p-8 lg:p-10"><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">{String(listCopy.heroEyebrow)}</div><h1 className="mt-3 text-4xl font-black">{String(listCopy.heroTitle)}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-300">{String(listCopy.heroIntro)}</p></div><div className="flex items-center justify-between bg-amber-400 p-8 text-slate-950"><div><strong className="block text-5xl font-black">{services.length}</strong><span className="text-xs font-black uppercase tracking-widest">{String(listCopy.countLabel)}</span></div><Wrench className="h-12 w-12"/></div></section>
    <section className="mt-10"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.2em] text-red-700">{String(listCopy.directoryEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(listCopy.directoryTitle)}</h2></div><p className="max-w-xl text-sm leading-6 text-slate-600">{String(listCopy.directoryIntro)}</p></div>
      <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => { const Icon = iconMap[service.iconName] || Wrench; return <button key={service.id} onClick={() => onNavigate('service-detail', service.slug)} className="group flex min-h-[390px] flex-col overflow-hidden border border-slate-200 bg-white text-left transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"><div className="relative h-48 overflow-hidden bg-slate-100"><img src={service.imageUrl} alt={service.imageAlt || `${service.name} service`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center bg-slate-950 text-amber-400"><Icon className="h-5 w-5"/></span><span className="absolute right-4 top-4 bg-slate-950/80 px-2 py-1 text-xs font-black text-white">{String(index + 1).padStart(2, '0')}</span></div><div className="flex flex-1 flex-col p-6"><h3 className="text-xl font-black group-hover:text-red-700">{service.name}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{service.shortDescription}</p><span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-red-700">{String(listCopy.exploreLabel)}<ArrowRight className="h-4 w-4 group-hover:translate-x-1"/></span></div></button>})}</div>
    </section>
    <section className="mt-14 flex flex-col justify-between gap-6 bg-red-700 p-8 text-white sm:flex-row sm:items-center"><div><div className="text-xs font-black uppercase tracking-widest text-amber-300">{String(listCopy.ctaEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(listCopy.ctaTitle)}</h2><p className="mt-2 text-sm text-red-100">{String(listCopy.ctaText)}</p></div><button onClick={() => onNavigate('request', 'Request Service Support')} className="shrink-0 bg-amber-400 px-6 py-4 text-sm font-black uppercase text-slate-950">{String(listCopy.ctaButton)}</button></section>
  </main></div>;
}

function ServiceDetail({ service, copy, onNavigate }: { service: Service; copy: Record<string, unknown>; onNavigate: Props['onNavigate'] }) {
  const Icon = iconMap[service.iconName] || Wrench;
  return <div className="min-h-screen bg-slate-50 pb-20"><main className="mx-auto max-w-[1180px] px-5 py-12 lg:px-8">
    <button onClick={() => onNavigate('services')} className="inline-flex items-center gap-2 text-sm font-black text-red-700"><ArrowLeft className="h-4 w-4"/>{String(copy.backLabel)}</button>
    <section className="mt-6 grid overflow-hidden bg-white lg:grid-cols-[0.9fr_1.1fr]"><div className="flex flex-col justify-between bg-amber-400 p-8 lg:p-10"><div><span className="flex h-14 w-14 items-center justify-center bg-slate-950 text-amber-400"><Icon className="h-7 w-7"/></span><div className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-red-800">{String(copy.eyebrow)}</div><h1 className="mt-3 text-4xl font-black leading-tight lg:text-5xl">{service.name}</h1><p className="mt-5 leading-7 text-slate-800">{service.shortDescription}</p></div><button onClick={() => onNavigate('request', `Request Service: ${service.name}`)} className="mt-8 inline-flex w-fit items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-black text-white">{String(copy.ctaButton)}<ArrowRight className="h-4 w-4"/></button></div><div className="relative min-h-[420px]"><img src={service.imageUrl} alt={service.imageAlt || service.name} className="absolute inset-0 h-full w-full object-cover"/></div></section>

    <section className="mt-10 grid gap-7 lg:grid-cols-2"><article className="border border-slate-200 bg-white p-7"><div className="text-xs font-black uppercase tracking-widest text-red-700">{String(copy.overviewEyebrow)}</div><h2 className="mt-2 text-2xl font-black">{String(copy.overviewTitle)}</h2><p className="mt-4 leading-7 text-slate-700">{service.fullDescription}</p><p className="mt-4 leading-7 text-slate-700">{service.serviceScope}</p></article><article className="bg-slate-950 p-7 text-white"><h2 className="text-2xl font-black">{String(copy.benefitsTitle)}</h2><div className="mt-5 space-y-3">{service.benefits.map(item => <div key={item} className="flex gap-3 border-b border-white/10 pb-3 text-sm text-slate-200"><Check className="h-5 w-5 shrink-0 text-amber-400"/>{item}</div>)}</div></article></section>

    {service.process.length > 0 && <section className="mt-14"><div className="text-xs font-black uppercase tracking-widest text-red-700">{String(copy.processEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.processTitle)}</h2><div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{service.process.map(step => <article key={step.step} className="border border-slate-200 bg-white p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white">{String(step.step).padStart(2, '0')}</span><h3 className="mt-5 font-black">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p></article>)}</div></section>}

    <section id="service-request" className="mt-14 scroll-mt-28 bg-slate-950 p-8 text-white lg:p-10"><div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]"><div><PhoneCall className="h-9 w-9 text-amber-400"/><div className="mt-5 text-xs font-black uppercase tracking-widest text-amber-400">{String(copy.formEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.formTitle)}</h2><p className="mt-4 text-sm leading-6 text-slate-300">{String(copy.formText)}</p></div><button onClick={() => onNavigate('request', `Request Service: ${service.name}`)} className="self-center rounded bg-red-600 px-6 py-4 font-bold">{String(copy.ctaButton)}</button></div></section>
  </main></div>;
}

function PageState({ children }: { children: React.ReactNode }) { return <section className="flex min-h-[55vh] items-center justify-center bg-slate-50 px-5 text-center"><div className="max-w-lg">{children}</div></section>; }
