import { SiteText } from '@/lib/SiteText';
import { usePublicContent, type PublicContent } from '@/lib/publicContent';
import { productFamily, matchesCategory, categoryDisplay } from '@/lib/productSelection';
﻿import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, ChevronDown, Gauge, RotateCcw, Search, SlidersHorizontal, Zap } from 'lucide-react';
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

function variableSpeedModelName(model: string) {
  if (/^FASMV/i.test(model)) return model.replace(/^FASMV/i, 'FASM');
  if (/^FASM/i.test(model)) return model;
  if (/^FASMV|^FASV|^FSLV/i.test(model)) return model;
  if (/^FAS/i.test(model)) return model.replace(/^FAS/i, 'FASV');
  if (/^FSL/i.test(model)) return model.replace(/^FSL/i, 'FSLV');
  return `${model}V`;
}

function ProductCard({ product, onNavigate, imageUrl, variableSpeedView }: { product: Product; onNavigate: (page: string, param?: string) => void; imageUrl?: string; variableSpeedView?: boolean }) {
  const family = productFamily(product);
  const cardImageUrl = family === 'FAS' || family === 'FSL' || family === 'FSG' || family === 'FASM'
    ? product.imageUrl
    : imageUrl || product.imageUrl;
  const visibleModel = variableSpeedView ? variableSpeedModelName(product.model) : product.model;
  const pressureRange = pressureLabel(product).replace(/\s+Bar\(g\)$/, '');
  const cardFeatures = family === 'FSL'
    ? ['Dedicated low-pressure screw airend', 'Enlarged oil separator', 'Low-pressure minimum pressure valve']
    : family === 'FAS' && product.powerKw >= 15 && product.powerKw <= 250
      ? ['High efficient rotary screw air compressor', product.features[1] || 'Air cooled', 'Maintenance free design']
      : product.features.slice(0, 3);
  return (
    <article className="group bg-white border border-red-100 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-red-950/10 hover:border-amber-300 transition-all">
      <button onClick={() => onNavigate('product-detail', String(product.id))} className="w-full text-left">
        <div className="bg-[#fff7df] px-6 pt-5">
          <h3 className="brand-display font-black text-slate-950 text-2xl group-hover:text-red-700 transition-colors leading-tight">{visibleModel}</h3>
        </div>
        <div className="relative aspect-[1.35] bg-[#fff7df] flex items-center justify-center p-8 border-b border-red-50">
          <img src={cardImageUrl} alt={visibleModel} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="p-6">
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <div className="min-w-0 rounded-lg bg-slate-50 p-2.5">
              <Zap className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="power" /></div>
              <div className="mt-1 font-black leading-tight text-slate-950">
                <span className="block whitespace-nowrap text-[13px]">{product.powerKw}</span>
                <span className="block text-[10px] uppercase tracking-wide"><SiteText section="ProductsPage" name="kw" /></span>
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 p-2.5">
              <Activity className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="fad" /></div>
              <div className="mt-1 font-black leading-tight text-slate-950">
                <span className="block whitespace-nowrap text-[12px] tracking-tight">{product.flowRateCfm}</span>
                <span className="block text-[10px] uppercase tracking-wide">CFM</span>
              </div>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 p-2.5">
              <Gauge className="mb-1 h-4 w-4 text-red-600" />
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500"><SiteText section="ProductsPage" name="pressure" /></div>
              <div className="mt-1 font-black leading-tight text-slate-950">
                <span className="block whitespace-nowrap text-[13px]">{pressureRange}</span>
                <span className="block text-[10px] tracking-tight">Bar(g)</span>
              </div>
            </div>
          </div>

          <ul className="mt-5 space-y-1.5 text-xs text-slate-600">
            {cardFeatures.map(feature => (
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
  const { productOrder, productSeries, categoryDisplayNames, heroSlides } = usePublicContent();
  const heroSlideImages = useMemo<Record<string, string>>(
    () => Object.fromEntries(heroSlides.filter(slide => slide.imageUrl).map(slide => [slide.series.toUpperCase(), slide.imageUrl])),
    [heroSlides],
  );
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
  const [filtersOpen, setFiltersOpen] = useState(true);
  const variableSpeedView = seriesFilter.startsWith('variable-');

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
    const variableSpeedFilter = requestedSeries === 'fasm' ? 'variable-all' : requestedSeries;
    setSeriesFilter(variableSpeedFilter && ['fas', 'fas-small', 'fasm', 'fsl', 'fsg', 'variable-all', 'variable-fas-small', 'variable-fas-large', 'variable-fsl', 'variable-fasm'].includes(variableSpeedFilter) ? variableSpeedFilter : 'all');
    setQuery(searchParams.get('q') || '');
    setCategoryFilter('all'); setPowerFilter('all'); setPressureFilter('all'); setQuickFilter('all');
  }, [loading, searchParams]);

  useEffect(() => {
    if (loading) return;
    const requestedSeries = searchParams.get('series')?.toLowerCase();
    if (!requestedSeries || requestedSeries !== seriesFilter || variableSpeedView) return;
    const firstFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`series-${requestedSeries}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    return () => cancelAnimationFrame(firstFrame);
  }, [loading, searchParams, seriesFilter, variableSpeedView]);

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
        const matchesSeries = variableSpeedView
          ? seriesFilter === 'variable-all'
            ? productFamily(product) !== 'FSG'
            : seriesFilter === 'variable-fas-small'
              ? productFamily(product) === 'FAS' && product.powerKw <= 11
              : seriesFilter === 'variable-fas-large'
                ? productFamily(product) === 'FAS' && product.powerKw >= 15 && product.powerKw <= 250
                : seriesFilter === 'variable-fsl'
                  ? productFamily(product) === 'FSL'
                  : seriesFilter === 'variable-fasm'
                    ? productFamily(product) === 'FASM'
                    : productFamily(product) !== 'FSG'
          : seriesFilter === 'all'
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
  }, [categories, categoryFilter, powerFilter, pressureFilter, products, query, quickFilter, seriesFilter, sort, variableSpeedView]);

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
      <section className="relative z-10 mx-auto max-w-[1400px] px-3 pb-10 pt-10 sm:px-5 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 sm:p-3">
          <button type="button" onClick={() => setFiltersOpen(open => !open)} aria-expanded={filtersOpen} className="flex w-full items-center gap-2 px-1 py-1 text-left text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-red-600" />
            <h2 className="text-xs font-bold">{String(copy.selectionTitle)}</h2>
            {hasActiveFilters && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-700">Active</span>}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">{filtersOpen ? 'Hide filters' : 'Show filters'}<ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} /></span>
          </button>
          {filtersOpen && <>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
              else if (value.startsWith('variable-')) setSeriesFilter(value);
              else setSearchParams({ series: value }, { replace: true });
            }} className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100">
              {variableSpeedView ? <>
                <option value="variable-all">All variable speed compressors</option>
                <option value="variable-fas-small">FAS 4-11 kW Variable Speed</option>
                <option value="variable-fas-large">FAS 15-250 kW Variable Speed</option>
                <option value="variable-fsl">FSL Variable Speed</option>
                <option value="variable-fasm">FASM Variable Speed</option>
              </> : <>
                <option value="all">All series</option>
                <option value="fas">FAS · Fixed speed</option>
                <option value="fasm">FASM · Variable speed</option>
                <option value="fsl">FSL · Low pressure</option>
                <option value="fsg">FSG · High capacity</option>
              </>}
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
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-2">
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
              className={`rounded-md border px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                quickFilter === item.id
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-red-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          {hasActiveFilters && <button type="button" onClick={showAllProducts} className="ml-auto inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 hover:bg-slate-100 hover:text-red-700"><RotateCcw className="h-3.5 w-3.5" /><SiteText section="ProductsPage" name="clear_filters" /></button>}
          </div>
          </>}
        </div>
          </aside>
          <div className="min-w-0">

        <div className="space-y-12">
          {grouped.filter(series => series.products.length > 0).map(series => (
            <section id={`series-${series.family.toLowerCase()}`} key={series.key} className="scroll-mt-32">
              <div className="mb-5 flex flex-col gap-2 border-l-4 border-red-600 bg-slate-50 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{series.title}</div>
                  <h2 className="brand-display text-3xl font-black text-slate-950">{variableSpeedView ? `${series.key === 'fasm' ? '7.5-37 kW' : series.range.replace(/\s+Low Pressure$/i, '')} with Permanent Magnet Motor and VFD` : series.range}</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
                {series.products.map(product => (
                  <ProductCard key={product.id} product={product} imageUrl={heroSlideImages[productFamily(product)]} onNavigate={onNavigate} variableSpeedView={variableSpeedView} />
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
          </div>
        </div>
      </section>
    </div>
  );
}


