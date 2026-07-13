import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Activity, Gauge } from 'lucide-react';
import type { ProductCategory, Product } from '@/lib/data';
import { getProductCategoryBySlug, getProducts } from '@/lib/data';
import CompressorIcon from '@/components/CompressorIcon';

interface Props {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
  onViewProduct: (id: number | string) => void;
}

export default function ProductCategoryPage({ slug, onNavigate, onViewProduct }: Props) {
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductCategoryBySlug(slug).then(c => {
      if (c) {
        setCategory(c);
        getProducts(c.id).then(p => { setProducts(p); setLoading(false); });
      } else setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>;
  if (!category) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Category not found.</p></div>;

  const pressureLabel = (product: Product) => product.pressureMin === product.pressureMax
    ? `${product.pressureMax} kg/cm2(g)`
    : `${product.pressureMin}-${product.pressureMax} kg/cm2(g)`;

  return (
    <div className="min-h-screen pb-20">
      <section className="relative bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={category.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-4 lg:px-8">
          <button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to All Products
          </button>
          <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">{category.shortName} Series</div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">{category.name}</h1>
          <p className="mt-4 text-lg text-red-200/80 max-w-3xl leading-relaxed">{category.longDescription}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {category.applications.map(app => (
              <span key={app} className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full">{app}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Features Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Key Features</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              {category.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-xl">
              <h3 className="font-black text-lg">Need Help Choosing?</h3>
              <p className="text-sm text-amber-100 mt-2">Our experts can help you select the perfect compressor for your specific application.</p>
              <button onClick={() => onNavigate('contact')} className="mt-4 w-full px-4 py-2.5 bg-white text-amber-600 font-bold rounded-xl text-sm hover:bg-amber-50 transition-colors">
                Talk to an Expert
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Available Models ({products.length})</h2>
            {products.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-500">More products in this category coming soon. Contact us for current availability.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {products.map(p => (
                  <article key={p.id} className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer sm:h-[300px]" onClick={() => onViewProduct(p.id)}>
                    <div className="grid sm:grid-cols-[230px_1fr] gap-0 h-full">
                      <div className="h-64 sm:h-full bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                        <img src={p.imageUrl} alt={p.model} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-6 flex flex-col min-h-[300px] sm:min-h-0">
                        <div className="text-xs text-amber-600 font-black uppercase tracking-widest mb-1">{p.series} Series</div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-700 transition-colors">{p.model}</h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{p.description}</p>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <CompressorIcon className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{p.powerKw} kW</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Power</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Activity className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{p.flowRateCfm}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">CFM</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Gauge className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{pressureLabel(p)}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Pressure</div>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {p.applications.slice(0, 2).map(a => (
                              <span key={a} className="px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold uppercase tracking-wider rounded">{a}</span>
                            ))}
                          </div>
                          <span className="text-amber-600 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
