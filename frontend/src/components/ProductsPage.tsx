import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Gauge, Search, SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/lib/data';
import { getProducts } from '@/lib/data';
import { bestFor, cfmMax, dutyFor, pressureLabel } from '@/lib/productGuidance';
import CompressorIcon from '@/components/CompressorIcon';

interface ProductsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

const productOrder = [
  'FAS-4', 'FAS-6', 'FAS-8', 'FAS-11', 'FAS-11(HE)',
  'FAS-15', 'FAS-18', 'FAS-22', 'FAS-30', 'FAS-37', 'FAS-45', 'FAS-55', 'FAS-75',
  'FSG270A', 'FSG340A', 'FSG460A', 'FSG760A', 'FSG860A', 'FSG1060A',
];

const productSeries = [
  { key: 'fas-small', title: 'FAS Series', range: '4-11 kW', family: 'FAS', min: 4, max: 11 },
  { key: 'fas-large', title: 'FAS Series', range: '15-250 kW', family: 'FAS', min: 15, max: 250 },
  { key: 'fsg', title: 'FSG Series', range: '45-185 kW', family: 'FSG', min: 45, max: 185 },
];

function firstAirProducts(products: Product[]) {
  return products
    .filter(product => /^(FAS[-\s]?\d+|FSG\d+)/i.test(product.model))
    .sort((a, b) => {
      const aIndex = productOrder.indexOf(a.model);
      const bIndex = productOrder.indexOf(b.model);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.powerKw - b.powerKw;
    });
}

function productsForSeries(products: Product[], series: typeof productSeries[number]) {
  return products.filter(product => (
    product.model.toUpperCase().startsWith(series.family) &&
    product.powerKw >= series.min &&
    product.powerKw <= series.max
  ));
}

function ProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: string, param?: string) => void }) {
  const badge = dutyFor(product);
  return (
    <article className="group bg-white border border-red-100 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-950/10 hover:border-amber-300 transition-all">
      <button onClick={() => onNavigate('product-detail', String(product.id))} className="w-full text-left">
        <div className="relative aspect-[1.35] bg-gradient-to-br from-[#fff7df] via-white to-red-50 flex items-center justify-center p-8 border-b border-red-50">
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${
            badge === 'Heavy duty industrial' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            badge === 'Factory plant air' ? 'bg-red-100 text-red-700 border-red-200' :
            'bg-white text-slate-700 border-slate-200'
          }`}>
            {badge}
          </span>
          <img src={product.imageUrl} alt={product.model} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div className="p-6">
          <h3 className="brand-display font-black text-slate-950 text-2xl group-hover:text-red-700 transition-colors leading-tight">{product.model}</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-900">
            Best for: {bestFor(product)}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <CompressorIcon className="w-4 h-4 text-red-600 mb-1" />
              <div className="font-black text-slate-950">{product.powerKw} kW</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Power</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Activity className="w-4 h-4 text-red-600 mb-1" />
              <div className="font-black text-slate-950">{product.flowRateCfm}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">CFM</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Gauge className="w-4 h-4 text-red-600 mb-1" />
              <div className="font-black text-slate-950">{pressureLabel(product)}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pressure</div>
            </div>
          </div>

          <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
            {product.features.slice(0, 3).map(feature => (
              <li key={feature} className="flex gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-red-600 flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-center gap-2 bg-red-600 hover:bg-slate-950 text-white rounded-lg px-5 py-3 font-black text-sm transition-colors shadow-lg shadow-red-600/15">
            View Details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>
    </article>
  );
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [application, setApplication] = useState('All Industries');
  const [duty, setDuty] = useState('All Products');
  const [sort, setSort] = useState('power-desc');
  const [quickFilter, setQuickFilter] = useState('all');

  useEffect(() => {
    getProducts().then(p => {
      setProducts(firstAirProducts(p));
      setLoading(false);
    });
  }, []);

  const applications = useMemo(() => {
    const values = new Set<string>();
    products.forEach(product => product.applications.forEach(app => values.add(app)));
    return ['All Industries', ...Array.from(values).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products
      .filter(product => {
        const matchesText = !text || [
          product.model,
          product.name,
          product.description,
          product.longDescription,
          product.powerKw,
          product.flowRateM3Min,
          ...product.applications,
          ...product.features,
        ].join(' ').toLowerCase().includes(text);
        const matchesApplication = application === 'All Industries' || product.applications.includes(application);
        const matchesDuty = duty === 'All Products' || dutyFor(product) === duty;
        const matchesQuickFilter =
          quickFilter === 'all' ||
          (quickFilter === 'compact' && product.powerKw <= 11) ||
          (quickFilter === 'plant-air' && product.powerKw >= 15 && product.powerKw <= 55) ||
          (quickFilter === 'high-flow' && cfmMax(product) >= 250) ||
          (quickFilter === 'wide-pressure' && product.pressureMax >= 13);
        return matchesText && matchesApplication && matchesDuty && matchesQuickFilter;
      })
      .sort((a, b) => {
        if (sort === 'power-asc') return a.powerKw - b.powerKw;
        if (sort === 'flow-desc') return cfmMax(b) - cfmMax(a);
        if (sort === 'flow-asc') return cfmMax(a) - cfmMax(b);
        if (sort === 'model') return a.model.localeCompare(b.model, undefined, { numeric: true });
        return b.powerKw - a.powerKw;
      });
  }, [application, duty, products, query, quickFilter, sort]);

  const grouped = useMemo(() => productSeries.map(series => ({
    ...series,
    products: productsForSeries(filtered, series),
  })), [filtered]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8df] via-white to-red-50 border-b border-red-100 py-16 lg:py-20">
        <div className="absolute left-8 top-8 h-20 w-20 rounded-full border-[16px] border-amber-300/30" />
        <div className="absolute right-10 bottom-8 h-24 w-24 rounded-full border-[18px] border-red-300/25" />
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
          <div className="relative text-red-600 font-black text-xs uppercase tracking-[0.25em] mb-3">Products</div>
          <h1 className="brand-display relative text-4xl lg:text-5xl font-black text-slate-950">Our Product Range</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Complete range of air-cooled single-stage rotary screw compressors from 3 kW to 37 kW, designed for heavy-duty industrial use.
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-5 lg:px-8 py-10">
        <div className="bg-white rounded-xl border border-red-100 shadow-xl shadow-red-950/5 p-4 mb-8">
          <div className="grid lg:grid-cols-[1fr_180px_180px_190px] gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search products, features, power, flow..."
                className="w-full h-13 pl-12 pr-4 rounded-lg border border-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium"
              />
            </div>
            <select value={application} onChange={event => setApplication(event.target.value)} className="h-13 px-4 rounded-lg border border-red-100 focus:border-red-500 outline-none text-sm font-bold bg-white">
              {applications.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={duty} onChange={event => setDuty(event.target.value)} className="h-13 px-4 rounded-lg border border-red-100 focus:border-red-500 outline-none text-sm font-bold bg-white">
              {['All Products', 'Small workshop', 'Small manufacturing', 'Factory plant air', 'Heavy duty industrial'].map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={sort} onChange={event => setSort(event.target.value)} className="h-13 px-4 rounded-lg border border-red-100 focus:border-red-500 outline-none text-sm font-bold bg-white">
              <option value="power-desc">Sort by Power</option>
              <option value="power-asc">Lowest Power</option>
              <option value="flow-desc">Highest Flow</option>
              <option value="flow-asc">Lowest Flow</option>
              <option value="model">Model Name</option>
            </select>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All models' },
            { id: 'compact', label: 'Small workshop' },
            { id: 'plant-air', label: 'Factory plant air' },
            { id: 'high-flow', label: 'High CFM' },
            { id: 'wide-pressure', label: 'Higher pressure' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setQuickFilter(item.id)}
              className={`rounded-md border px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                quickFilter === item.id
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-red-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-500 font-bold">Showing {filtered.length} of {products.length} products</div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-bold">
            <SlidersHorizontal className="w-4 h-4 text-red-600" />
            Filter by model, application, duty, CFM, and pressure
          </div>
        </div>

        <div className="space-y-12">
          {grouped.filter(series => series.products.length > 0).map(series => (
            <section key={series.key} className="scroll-mt-28">
              <div className="mb-5 flex flex-col gap-2 border-l-4 border-red-600 bg-slate-50 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{series.title}</div>
                  <h2 className="brand-display text-3xl font-black text-slate-950">{series.range}</h2>
                </div>
                <div className="text-sm font-bold text-slate-500">{series.products.length} products</div>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
                {series.products.map(product => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 border border-slate-200 rounded-xl">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No products match the selected filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}


