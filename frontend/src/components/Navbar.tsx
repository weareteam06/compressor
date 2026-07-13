import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, FileText, Lock, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  salesPhone: string;
}

const logoUrl = 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/logo.svg';

const productOrder = [
  'FAS-4', 'FAS-6', 'FAS-8', 'FAS-11', 'FAS-11(HE)',
  'FAS-15', 'FAS-18', 'FAS-22', 'FAS-30', 'FAS-37', 'FAS-45', 'FAS-55', 'FAS-75',
  'FSG270A', 'FSG340A', 'FSG460A', 'FSG760A', 'FSG860A', 'FSG1060A',
];

type MenuProduct = { id: number | string; model: string; powerKw: number; flowRateCfm: string; imageUrl: string };

const productSeries = [
  { title: 'FAS Series', range: '4-11 kW', family: 'FAS', min: 4, max: 11 },
  { title: 'FAS Series', range: '15-250 kW', family: 'FAS', min: 15, max: 250 },
  { title: 'FSG Series', range: '45-185 kW', family: 'FSG', min: 45, max: 185 },
];

function modelPower(model: string) {
  return Number(model.match(/\d+(\.\d+)?/)?.[0] || 0);
}

function sortByModel(a: MenuProduct, b: MenuProduct) {
  const aIndex = productOrder.indexOf(a.model);
  const bIndex = productOrder.indexOf(b.model);
  if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
  if (aIndex >= 0) return -1;
  if (bIndex >= 0) return 1;
  return modelPower(a.model) - modelPower(b.model);
}

function productsForSeries(products: MenuProduct[], series: typeof productSeries[number]) {
  return products.filter(product => {
    const familyMatches = product.model.toUpperCase().startsWith(series.family);
    const power = product.powerKw || modelPower(product.model);
    return familyMatches && power >= series.min && power <= series.max;
  });
}

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'products', label: 'Products', hasProducts: true },
  { id: 'distributors', label: 'Dealers Network' },
  { id: 'about-story', label: 'About Us' },
  { id: 'resources', label: 'Resources', hasResources: true },
];

const resources = [
  { id: 'technical', label: 'Technical Info', desc: 'Sizing, flow, pressure, and installation details', icon: FileText },
  { id: 'warranty', label: 'Warranty', desc: '5 year warranty guidance and support notes', icon: ShieldCheck },
  { id: 'news', label: 'News', desc: 'Updates, announcements, and product information', icon: BookOpen },
];

export default function Navbar({ onNavigate, currentPage, salesPhone }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    import('@/lib/data').then(m => {
      m.getProducts().then(items => {
        setProducts(
          items
            .filter(item => /^(FAS[-\s]?\d+|FSG\d+)/i.test(item.model))
            .map(item => ({ id: item.id, model: item.model, powerKw: item.powerKw, flowRateCfm: item.flowRateCfm, imageUrl: item.imageUrl }))
            .sort(sortByModel)
        );
      });
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string, param?: string) => {
    onNavigate(page, param);
    setMobileOpen(false);
    setMobileSubOpen(null);
    setOpenDropdown(null);
  };

  return (
    <>
      <div className="hidden lg:block bg-slate-950 text-white text-xs border-b border-amber-400/60">
        <div className="max-w-[1280px] mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="text-amber-200 font-semibold">Air cooled rotary screw compressors from 3 kW to 37 kW</span>
            <span className="h-3 w-px bg-amber-300/30" />
            <a href={`tel:${salesPhone}`} className="flex items-center gap-2 font-bold hover:text-red-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              {salesPhone}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('login')} className="flex items-center gap-1.5 hover:text-red-300 transition-colors font-bold">
              <Lock className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      <nav className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-red-100 transition-shadow ${scrolled ? 'shadow-xl shadow-red-950/10' : 'shadow-sm'}`}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <button onClick={() => handleNav('home')} className="flex items-center gap-3 flex-shrink-0">
              <img src={logoUrl} alt="firstAir Compressor" className="h-10 lg:h-12 w-auto" />
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = currentPage === item.id || (item.id === 'products' && currentPage.startsWith('product'));

                if (item.hasProducts) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        onClick={() => handleNav(item.id)}
                        className={`px-3.5 py-2 rounded-md text-sm font-black uppercase tracking-wide flex items-center gap-1 transition-all ${
                          isActive ? 'text-red-700 bg-amber-100 border border-amber-200' : 'text-slate-800 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute top-full left-0 pt-3 z-50">
                          <div className="w-[560px] bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="grid grid-cols-[0.9fr_1.1fr]">
                              <div className="bg-slate-950 text-white p-5 border-t-4 border-amber-400">
                                <div className="text-amber-300 font-black text-[10px] uppercase tracking-[0.25em] mb-2">Product Series</div>
                                <h3 className="text-2xl font-black leading-tight">Compressor ranges by kW class</h3>
                                <p className="text-white/65 text-sm mt-3 leading-relaxed">Browse FAS and FSG compressors by the same three series shown in the product brochures.</p>
                                <button onClick={() => handleNav('products')} className="mt-5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-black uppercase tracking-wide">
                                  View all products
                                </button>
                              </div>
                              <div className="p-3 max-h-[420px] overflow-y-auto">
                                {productSeries.map(series => {
                                  const seriesProducts = productsForSeries(products, series);
                                  return (
                                    <div key={`${series.family}-${series.range}`} className="mb-3 last:mb-0">
                                      <div className="px-3 py-3 rounded-md bg-red-700 text-white border border-red-800 shadow-sm">
                                        <div className="text-[11px] font-black uppercase tracking-[0.2em]">{series.title}</div>
                                        <div className="text-xs font-bold text-red-100">{series.range}</div>
                                      </div>
                                      {seriesProducts.length > 0 ? seriesProducts.map(product => (
                                        <button
                                          key={product.id}
                                          onClick={() => handleNav('product-detail', String(product.id))}
                                          className="w-full text-left ml-2 mt-1 px-3 py-3 rounded-md border-l-2 border-red-100 hover:bg-red-50 hover:border-red-400 transition-colors group"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-sm bg-white border border-slate-100">
                                              <img src={product.imageUrl} alt={product.model} className="max-h-11 max-w-full object-contain" />
                                            </span>
                                            <div>
                                              <div className="font-black text-slate-900 group-hover:text-red-700">{product.model}</div>
                                              <div className="text-xs text-slate-500">{product.powerKw} kW | {product.flowRateCfm} CFM</div>
                                            </div>
                                            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-300 group-hover:text-red-600" />
                                          </div>
                                        </button>
                                      )) : (
                                        <div className="px-3 py-3 text-xs font-bold text-slate-400">Products will appear here when added.</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.hasResources) {
                  const isResourceActive = ['technical', 'warranty', 'news'].includes(currentPage);
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                        className={`px-3.5 py-2 rounded-md text-sm font-black uppercase tracking-wide flex items-center gap-1 transition-all ${
                          isResourceActive ? 'text-red-700 bg-amber-100 border border-amber-200' : 'text-slate-800 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute top-full right-0 pt-3 z-50">
                          <div className="w-[360px] bg-white rounded-lg shadow-2xl border border-slate-100 p-3">
                            {resources.map(resource => {
                              const Icon = resource.icon;
                              return (
                                <button
                                  key={resource.id}
                                  onClick={() => handleNav(resource.id)}
                                  className="w-full text-left rounded-md px-3 py-3 hover:bg-red-50 transition-colors group"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-md bg-slate-100 group-hover:bg-red-600 group-hover:text-white text-red-700 flex items-center justify-center transition-colors">
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="font-black text-slate-950 group-hover:text-red-700">{resource.label}</div>
                                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{resource.desc}</div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`px-3.5 py-2 rounded-md text-sm font-black uppercase tracking-wide transition-all ${
                      isActive ? 'text-red-700 bg-amber-100 border border-amber-200' : 'text-slate-800 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={() => handleNav('contact')}
                className="ml-3 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-md shadow-lg shadow-red-600/20 transition-colors uppercase tracking-wide border-b-4 border-amber-400"
              >
                Contact Us
              </button>
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <button onClick={() => handleNav('products')} className="p-2 rounded-md text-slate-700 hover:bg-slate-100" aria-label="Search products">
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navItems.map(item => {
                if (item.hasProducts) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setMobileSubOpen(mobileSubOpen === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-black uppercase tracking-wide text-slate-800 hover:bg-slate-50"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubOpen === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileSubOpen === item.id && (
                        <div className="ml-3 pl-3 border-l-2 border-red-100 py-2 space-y-1">
                          {productSeries.map(series => (
                            <div key={`${series.family}-${series.range}-mobile`}>
                              <div className="px-3 py-2 mt-2 rounded-md bg-red-700 text-[10px] font-black uppercase tracking-widest text-white">
                                {series.title} <span className="text-red-100 normal-case tracking-normal">({series.range})</span>
                              </div>
                              {productsForSeries(products, series).map(product => (
                                <button
                                  key={product.id}
                                  onClick={() => handleNav('product-detail', String(product.id))}
                                  className="w-full text-left px-3 py-2 rounded-md text-sm font-bold text-slate-700 hover:text-red-700 hover:bg-red-50"
                                >
                                  <span className="flex items-center gap-3">
                                    <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-sm bg-white border border-slate-100">
                                      <img src={product.imageUrl} alt={product.model} className="max-h-9 max-w-full object-contain" />
                                    </span>
                                    <span>
                                      {product.model}
                                      <span className="block text-xs font-medium text-slate-500">{product.powerKw} kW | {product.flowRateCfm} CFM</span>
                                    </span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          ))}
                          <button onClick={() => handleNav('products')} className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700">
                            View all products
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className="block w-full text-left px-3 py-3 rounded-md text-sm font-black uppercase tracking-wide text-slate-800 hover:bg-slate-50 hover:text-red-700"
                  >
                    {item.label}
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button onClick={() => handleNav('contact')} className="px-4 py-3 bg-red-600 text-white text-sm font-black rounded-md uppercase tracking-wide">
                  Contact Us
                </button>
                <button onClick={() => handleNav('login')} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-950 text-white text-sm font-black rounded-md uppercase tracking-wide">
                  <Lock className="w-4 h-4 text-red-400" />
                  Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}


