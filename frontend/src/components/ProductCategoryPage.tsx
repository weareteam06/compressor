import { SiteText } from '@/lib/SiteText';
import { usePublicContent } from '@/lib/publicContent';
import { matchesCategory, categoryDisplay } from '@/lib/productSelection';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Activity, Gauge } from 'lucide-react';
import type { ProductCategory, Product } from '@/lib/data';
import { getProductCategoryBySlug, getProducts } from '@/lib/data';
import CompressorIcon from '@/components/CompressorIcon';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
  onViewProduct: (id: number | string) => void;
}

export default function ProductCategoryPage({ slug, onNavigate, onViewProduct }: Props) {
  const { categoryDisplayNames } = usePublicContent();
  const copy = usePageContent('productCategory', defaultPageContent.productCategory);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductCategoryBySlug(slug).then(c => {
      if (c) {
        setCategory(categoryDisplay(c, categoryDisplayNames));
        if (c.external && c.externalUrl) {
          window.location.assign(c.externalUrl);
          return;
        }
        getProducts().then(items => {
          setProducts(items.filter(product => matchesCategory(product, c)));
          setLoading(false);
        });
      } else setLoading(false);
    });
  }, [slug, categoryDisplayNames]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>;
  if (!category) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500"><SiteText section="ProductCategoryPage" name="category_not_found" /></p></div>;

  const pressureLabel = (product: Product) => product.pressureMin === product.pressureMax
    ? `${product.pressureMax} kg/cm2(g)`
    : `${product.pressureMin}-${product.pressureMax} kg/cm2(g)`;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="mb-10 border-b border-slate-300 pb-7"><button onClick={() => onNavigate('products')} className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-700"><ArrowLeft className="h-4 w-4" /><SiteText section="ProductCategoryPage" name="back_to_all_products" /></button><div className="text-xs font-black uppercase tracking-widest text-red-700"><SiteText section="ProductCategoryPage" name="products" />{" "}{category.shortName}{" "}<SiteText section="ProductCategoryPage" name="series" /></div><h1 className="mt-2 text-3xl font-black text-slate-950">{category.name}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{category.longDescription}</p><div className="mt-4 flex flex-wrap gap-2">{category.applications.map(app => <span key={app} className="border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">{app}</span>)}</div></div>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Features Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{String(copy.featuresTitle)}</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              {category.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 leading-relaxed font-medium">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-xl">
              <h3 className="font-black text-lg">{String(copy.helpTitle)}</h3>
              <p className="text-sm text-amber-100 mt-2"><SiteText section="ProductCategoryPage" name="our_experts_can_help_you_select_the_perfect_compressor_for_your_specif" /></p>
              <button onClick={() => onNavigate('request')} className="mt-4 w-full px-4 py-2.5 bg-white text-amber-600 font-bold rounded-xl text-sm hover:bg-amber-50 transition-colors">{" "}<SiteText section="ProductCategoryPage" name="talk_to_an_expert" />{" "}</button>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{String(copy.modelsTitle)} ({products.length})</h2>
            {products.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
                <p className="text-slate-500"><SiteText section="ProductCategoryPage" name="more_products_in_this_category_coming_soon_contact_us_for_current_avai" /></p>
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
                        <div className="text-xs text-amber-600 font-black uppercase tracking-widest mb-1">{p.series}{" "}<SiteText section="ProductCategoryPage" name="series_2" /></div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-red-700 transition-colors">{p.model}</h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{p.description}</p>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <CompressorIcon className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{p.powerKw}{" "}<SiteText section="ProductCategoryPage" name="kw" /></div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold"><SiteText section="ProductCategoryPage" name="power" /></div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Activity className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{p.flowRateCfm}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold"><SiteText section="ProductCategoryPage" name="cfm" /></div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Gauge className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="text-sm font-black text-slate-900">{pressureLabel(p)}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold"><SiteText section="ProductCategoryPage" name="pressure" /></div>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {p.applications.slice(0, 2).map(a => (
                              <span key={a} className="px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold uppercase tracking-wider rounded">{a}</span>
                            ))}
                          </div>
                          <span className="text-amber-600 font-black text-xs uppercase tracking-wider flex items-center gap-1">{" "}<SiteText section="ProductCategoryPage" name="view_details" />{" "}<ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
