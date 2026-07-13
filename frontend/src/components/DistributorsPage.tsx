import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Mail, Map, MapPin, Phone, Search, ShieldCheck } from 'lucide-react';
import type { Distributor } from '@/lib/data';
import { getDistributors } from '@/lib/data';

interface Props {
  onNavigate: (page: string) => void;
}

export default function DistributorsPage({ onNavigate }: Props) {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => { getDistributors().then(d => { setDistributors(d); setLoading(false); }); }, []);

  const regions = ['All', ...Array.from(new Set(distributors.map(d => d.region)))];
  let filtered = distributors;
  if (region !== 'All') filtered = filtered.filter(d => d.region === region);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => [
      d.name,
      d.city,
      d.state,
      d.region,
      d.fullAddress,
      d.contactPerson,
      d.email,
      ...d.authorizedProducts,
    ].join(' ').toLowerCase().includes(q));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="bg-gradient-to-br from-slate-950 via-red-950 to-red-700 pt-20 pb-32 text-white">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-red-100 font-black text-xs uppercase tracking-[0.2em]">
            <Building2 className="w-4 h-4 text-red-200" />
            Authorized Distribution Network
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mt-8">Find a Dealer / Distributor</h1>
          <p className="text-red-100/85 text-lg mt-5 max-w-3xl mx-auto leading-relaxed">
            Locate certified firstAir compressor representatives for local equipment sales, complete package guidance, professional installation, and lifetime parts and service support.
          </p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-5 grid lg:grid-cols-[1fr_380px_220px] gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search by dealer name, city, state, or product..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-13 pl-12 pr-4 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium" />
          </div>
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="h-13 px-4 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-sm bg-white font-bold text-slate-800">
            {regions.map(r => <option key={r} value={r}>Region: {r}</option>)}
          </select>
          <div className="flex items-center justify-center lg:justify-end gap-2 text-sm font-bold text-slate-600">
            <Map className="w-5 h-5 text-red-600" />
            Showing {filtered.length} Certified Reps
          </div>
        </div>
      </div>

      <section className="max-w-[1280px] mx-auto px-5 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(d => (
            <article key={d.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-red-200 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex px-3 py-1 rounded bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-[0.18em]">
                    {d.region} Region
                  </span>
                  <h3 className="text-xl font-black text-slate-950 mt-4 leading-tight">{d.name}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-black flex items-center justify-center shadow-lg shadow-red-600/25 text-sm">
                  {d.state.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="space-y-3 pt-5 mt-5 border-t border-slate-100">
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{d.fullAddress || `${d.city}, ${d.state}`}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <a href={`tel:${d.phone}`} className="font-bold text-slate-800 hover:text-red-700">{d.phone}</a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <a href={`mailto:${d.email}`} className="font-bold text-slate-800 hover:text-red-700 truncate">{d.email}</a>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {d.authorizedProducts.slice(0, 3).map(p => (
                    <span key={p} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-red-600" />{p}
                    </span>
                  ))}
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No dealers found matching your criteria.</p>
          </div>
        )}

        <div className="mt-12 bg-slate-950 rounded-xl p-8 lg:p-10 text-white text-center shadow-xl">
          <h2 className="text-2xl lg:text-3xl font-black">Become an Authorized Distributor</h2>
          <p className="text-white/70 mt-2 max-w-2xl mx-auto">Interested in joining the firstAir network? Connect with us for partnership opportunities.</p>
          <button onClick={() => onNavigate('contact')} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg shadow-lg transition-colors">
            Become a Partner
          </button>
        </div>
      </section>
    </div>
  );
}
