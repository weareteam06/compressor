import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Wrench, Settings, RefreshCw, Heart, Cpu, Package } from 'lucide-react';
import type { Service } from '@/lib/data';
import { getServices, getServiceBySlug } from '@/lib/data';

interface Props {
  onNavigate: (page: string, param?: string) => void;
  slug?: string;
}

const iconMap: Record<string, any> = { Wrench, Settings, RefreshCw, Heart, Cpu, Package, Tool: Settings };

export default function ServicesPage({ onNavigate, slug }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [current, setCurrent] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) getServiceBySlug(slug).then(s => { setCurrent(s || null); setLoading(false); });
    else getServices().then(s => { setServices(s); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>;

  if (slug && current) {
    const Icon = iconMap[current.iconName] || Wrench;
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <section className="page-hero relative bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20"><img src={current.imageUrl} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" /></div>
          <div className="relative max-w-[1400px] mx-auto px-4 lg:px-8">
            <button onClick={() => onNavigate('services')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to All Services
            </button>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-amber-400 font-black text-xs uppercase tracking-widest">Service</div>
            </div>
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
              <h2 className="text-2xl font-black text-slate-900 mb-5">Key Benefits</h2>
              <div className="space-y-3">
                {current.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 font-semibold">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-black mb-3">Ready to Get Started?</h3>
              <p className="text-amber-50 mb-6">Contact our service team to schedule your consultation, installation, or maintenance service.</p>
              <button onClick={() => onNavigate('contact')} className="w-full px-6 py-3.5 bg-white text-amber-600 hover:bg-amber-50 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                Request Service <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-red-950 text-white rounded-3xl p-8 lg:p-10 shadow-xl">
            <h2 className="text-2xl font-black mb-6">Our Service Process</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {current.process.map(p => (
                <div key={p.step} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-white mb-3">{p.step}</div>
                  <h3 className="font-black text-white mb-2">{p.title}</h3>
                  <p className="text-xs text-red-100/70 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="page-hero bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">Our Services</div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">World-Class Service</h1>
          <p className="mt-4 text-lg text-red-200/80 max-w-3xl">
            Our company was founded on service and our mission today is to provide the best service and support available. Our 24/7 service sets us apart through our ability to handle the pressure when you need it most.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => {
            const Icon = iconMap[s.iconName] || Wrench;
            return (
              <button key={s.id} onClick={() => onNavigate('service-detail', s.slug)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-amber-300 overflow-hidden text-left hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col h-full min-h-[420px] lg:h-[420px]">
                <div className="h-56 overflow-hidden relative flex-shrink-0">
                  <img src={s.imageUrl} alt={s.name} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-amber-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-slate-900 text-xl group-hover:text-red-700 transition-colors">{s.name}</h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed flex-1">{s.shortDescription}</p>
                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-amber-600 font-black text-xs uppercase tracking-wider">
                    Learn More <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
