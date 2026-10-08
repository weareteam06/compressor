import { SiteText } from '@/lib/SiteText';
import { usePublicContent, type PublicContent } from '@/lib/publicContent';
import { productFamily, matchesCategory, categoryDisplay } from '@/lib/productSelection';
﻿import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, Gauge, RotateCcw, Search, SlidersHorizontal, Zap } from 'lucide-react';
import type { Product, ProductCategory } from '@/lib/data';
import { getProductCategories, getProducts } from '@/lib/data';
import { cfmMax, pressureLabel } from '@/lib/productGuidance';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';
import { useSearchParams } from 'react-router-dom';

interface ProductsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

function firstAirProducts(products: Product[], productOrder: string[]) {
  return products
    .filter(product => Boolean(product.model))
    .sort((a, b) => {
      const aIndex = productOrder.indexOf(a.model);
      const bIndex = productOrder.indexOf(b.model);
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.powerKw - b.powerKw;
    });
}

function productsForSeries(products: Product[], series: PublicContent['productSeries'][number]) {
  return products.filter(product => {
    const familyMatches = productFamily(product) === series.family;
    return familyMatches && product.powerKw >= series.min && product.powerKw <= series.max;
  });
}

function ProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: string, param?: string) => void }) {
  const { productGuidance } = usePublicContent();
  const guidance = productGuidance.find(rule => (!rule.family || rule.family === productFamily(product)) && product.powerKw >= rule.minPowerKw);
  const badge = guidance?.duty || '';
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
          <img src={product.imageUrl} alt={product.model} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="p-6">
          <h3 className="brand-display font-black text-slate-950 text-2xl group-hover:text-red-700 transition-colors leading-tight">{product.model}</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{product.description}</p>
          <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-900">{" "}<SiteText section="ProductsPage" name="best_for" />{" "}{guidance?.bestFor || ''}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <Zap className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="power" /></div>
              <div className="mt-1 font-black text-slate-950">{product.powerKw}{" "}<SiteText section="ProductsPage" name="kw" /></div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Activity className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="fad" /></div>
              <div className="mt-1 font-black text-slate-950">{product.flowRateCfm}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Gauge className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="pressure" /></div>
              <div className="mt-1 font-black text-slate-950">{pressureLabel(product)}</div>
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

          <div className="mt-5 flex items-center justify-center gap-2 bg-red-600 hover:bg-slate-950 text-white rounded-lg px-5 py-3 font-black text-sm transition-colors shadow-lg shadow-red-600/15">{" "}<SiteText section="ProductsPage" name="view_details" />{" "}<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </button>
    </article>
  );
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  const { productOrder, productSeries, categoryDisplayNames } = usePublicContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const copy = usePageContent('products', defaultPageContent.products);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [powerFilter, setPowerFilter] = useState('all');
  const [pressureFilter, setPressureFilter] = useState('all');
  const [sort, setSort] = useState('power-asc');
  const [quickFilter, setQuickFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    Promise.all([getProducts(), getProductCategories()]).then(([p, categoryItems]) => {
      setProducts(firstAirProducts(p, productOrder));
      setCategories(categoryItems.map(category => categoryDisplay(category, categoryDisplayNames)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const requestedSeries = searchParams.get('series')?.toLowerCase();
    setSeriesFilter(requestedSeries && ['fas', 'fas-small', 'fasm', 'fsl', 'fsg'].includes(requestedSeries) ? requestedSeries : 'all');
    setQuery(searchParams.get('q') || '');
    setCategoryFilter('all'); setPowerFilter('all'); setPressureFilter('all'); setQuickFilter('all');
  }, [loading, searchParams]);

  useEffect(() => {
    if (loading) return;
    const requestedSeries = searchParams.get('series')?.toLowerCase();
    if (!requestedSeries || requestedSeries !== seriesFilter) return;
    const firstFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`series-${requestedSeries}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    return () => cancelAnimationFrame(firstFrame);
  }, [loading, searchParams, seriesFilter]);

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
        const matchesSeries = seriesFilter === 'all'
          || (seriesFilter === 'fas-small' && productFamily(product) === 'FAS' && product.powerKw <= 11)
          || productFamily(product).toLowerCase() === seriesFilter;
        const selectedCategory = categories.find(category => category.slug === categoryFilter);
        const matchesProductCategory = matchesCategory(product, selectedCategory);
        const matchesPower = powerFilter === 'all'
          || (powerFilter === 'up-to-11' && product.powerKw <= 11)
          || (powerFilter === '15-37' && product.powerKw >= 15 && product.powerKw <= 37)
          || (powerFilter === '45-75' && product.powerKw >= 45 && product.powerKw <= 75)
          || (powerFilter === '110-plus' && product.powerKw >= 110);
        const requiredPressure = pressureFilter === 'all' ? 0 : Number(pressureFilter);
        const matchesPressure = product.pressureMax >= requiredPressure;
        const matchesQuickFilter =
          quickFilter === 'all' ||
          (quickFilter === 'compact' && product.powerKw <= 11) ||
          (quickFilter === 'plant-air' && product.powerKw >= 15 && product.powerKw <= 55) ||
          (quickFilter === 'high-flow' && cfmMax(product) >= 250) ||
          (quickFilter === 'wide-pressure' && product.pressureMax >= 13);
        return matchesText && matchesProductCategory && matchesSeries && matchesPower && matchesPressure && matchesQuickFilter;
      })
      .sort((a, b) => {
        if (sort === 'power-asc') return a.powerKw - b.powerKw || a.model.localeCompare(b.model, undefined, { numeric: true });
        if (sort === 'flow-desc') return cfmMax(b) - cfmMax(a);
        if (sort === 'flow-asc') return cfmMax(a) - cfmMax(b);
        if (sort === 'model') return a.model.localeCompare(b.model, undefined, { numeric: true });
        return b.powerKw - a.powerKw;
      });
  }, [categories, categoryFilter, powerFilter, pressureFilter, products, query, quickFilter, seriesFilter, sort]);

  const hasActiveFilters = Boolean(query) || categoryFilter !== 'all' || seriesFilter !== 'all' || powerFilter !== 'all' || pressureFilter !== 'all' || quickFilter !== 'all';
  const clearFilters = () => {
    setQuery('');
    setSeriesFilter('all');
    setPowerFilter('all');
    setPressureFilter('all');
    setQuickFilter('all');
    setCategoryFilter('all');
  };
  const showAllProducts = () => {
    clearFilters();
    setSearchParams({}, { replace: true });
  };

  const grouped = useMemo(() => productSeries.map(series => ({
    ...series,
    products: productsForSeries(filtered, series),
  })), [filtered, productSeries]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="relative z-10 mx-auto max-w-[1280px] px-5 pb-10 pt-10 lg:px-8">
        <div className="mb-6 border-b border-slate-200 pb-6">
          <div><div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{String(copy.heroEyebrow)}</div><h1 className="brand-display mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{String(copy.heroTitle)}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{String(copy.heroIntro)}</p></div>
        </div>

        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-700"><SlidersHorizontal className="h-4 w-4 text-red-600" /><h2 className="text-xs font-bold">{String(copy.selectionTitle)}</h2></div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.5fr_1.2fr_1.1fr_1fr_1fr_1fr]">
            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={String(copy.searchPlaceholder)}
                aria-label={String(copy.searchPlaceholder)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <select aria-label="Compressor type" value={categoryFilter} onChange={event => { clearFilters(); setCategoryFilter(event.target.value); }} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="all">{String(copy.allCategoriesLabel)}</option>
              {categories.filter(category => !category.external).map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
            <select aria-label="Compressor series" value={seriesFilter} onChange={event => {
              const value = event.target.value;
              if (value === 'all') showAllProducts();
              else setSearchParams({ series: value }, { replace: true });
            }} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="all">All series</option>
              <option value="fas">FAS · Fixed speed</option>
              <option value="fasm">FASM · Variable speed</option>
              <option value="fsl">FSL · Low pressure</option>
              <option value="fsg">FSG · High capacity</option>
            </select>
            <select aria-label="Motor power range" value={powerFilter} onChange={event => setPowerFilter(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="all">All power ranges</option>
              <option value="up-to-11">4–11 kW</option>
              <option value="15-37">15–37 kW</option>
              <option value="45-75">45–75 kW</option>
              <option value="110-plus">110–250 kW</option>
            </select>
            <select aria-label="Required working pressure" value={pressureFilter} onChange={event => setPressureFilter(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="all">All pressures</option>
              <option value="8">8 bar capable</option>
              <option value="10">10 bar capable</option>
              <option value="12">12 bar capable</option>
              <option value="16">16 bar capable</option>
            </select>
            <select aria-label="Sort products" value={sort} onChange={event => setSort(event.target.value)} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              <option value="power-desc">Highest power</option>
              <option value="power-asc">Lowest Power</option>
              <option value="flow-desc">Highest Flow</option>
              <option value="flow-asc">Lowest Flow</option>
              <option value="model">Model Name</option>
            </select>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All models' },
            { id: 'compact', label: 'Up to 11 kW' },
            { id: 'plant-air', label: '15–55 kW' },
            { id: 'high-flow', label: '250+ CFM' },
            { id: 'wide-pressure', label: '13–16 bar capable' },
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
          {hasActiveFilters && <button type="button" onClick={showAllProducts} className="ml-auto inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-600 hover:bg-slate-100 hover:text-red-700"><RotateCcw className="h-3.5 w-3.5" /><SiteText section="ProductsPage" name="clear_filters" /></button>}
        </div>

        {seriesFilter !== 'all' && (
          <div className="mb-6 flex flex-col gap-3 border-l-4 border-red-600 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-800"><SiteText section="ProductsPage" name="showing_only_the" />{" "}{seriesFilter === 'fas-small' ? 'FAS 4–11 kW' : seriesFilter.toUpperCase()}{" "}<SiteText section="ProductsPage" name="product_series" /></p>
            <button type="button" onClick={showAllProducts} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-red-700 hover:text-red-800">
              <RotateCcw className="h-4 w-4" /><SiteText section="ProductsPage" name="view_all_product_series" />{" "}</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-500 font-bold"><SiteText section="ProductsPage" name="showing" />{" "}{filtered.length}{" "}<SiteText section="ProductsPage" name="of" />{" "}{products.length} {String(copy.resultsLabel)}</div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-bold">
            <SlidersHorizontal className="w-4 h-4 text-red-600" />{" "}<SiteText section="ProductsPage" name="filter_by_series_power_pressure_and_airflow" />{" "}</div>
        </div>

        <div className="space-y-12">
          {grouped.filter(series => series.products.length > 0).map(series => (
            <section id={`series-${series.family.toLowerCase()}`} key={series.key} className="scroll-mt-32">
              <div className="mb-5 flex flex-col gap-2 border-l-4 border-red-600 bg-slate-50 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{series.title}</div>
                  <h2 className="brand-display text-3xl font-black text-slate-950">{series.range}</h2>
                </div>
                <div className="text-sm font-bold text-slate-500">{series.products.length}{" "}<SiteText section="ProductsPage" name="products" /></div>
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
            <p className="text-slate-500 font-medium">{String(copy.emptyText)}</p>
            <button type="button" onClick={showAllProducts} className="mt-5 inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"><RotateCcw className="h-4 w-4" />{String(copy.clearFiltersLabel)}</button>
          </div>
        )}
      </section>
    </div>
  );
}


