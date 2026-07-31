import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, FileText, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  salesPhone: string;
  social: {
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
}

const logoUrl = 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/logo.svg';

const productOrder = [
  'FAS-4', 'FAS-6', 'FAS-8', 'FAS-11', 'FAS-11(HE)',
  'FAS-15', 'FAS-18', 'FAS-22', 'FAS-30', 'FAS-37', 'FAS-45', 'FAS-55', 'FAS-75',
  'FASM08A', 'FASM11A', 'FASM15A', 'FASM18A', 'FASM22A', 'FASM30A', 'FASM37A',
  'FSG270A', 'FSG340A', 'FSG460A', 'FSG760A', 'FSG860A', 'FSG1060A',
];

type MenuProduct = { id: number | string; model: string; powerKw: number; flowRateCfm: string; imageUrl: string };

const productSeries = [
  { title: 'FAS Series', range: '4-11 kW', family: 'FAS', min: 4, max: 11 },
  { title: 'FAS Series', range: '15-250 kW', family: 'FAS', min: 15, max: 250 },
  { title: 'FSG Series', range: '45-185 kW', family: 'FSG', min: 45, max: 185 },
  { title: 'FASM Series', range: '7.5-37 kW', family: 'FASM', min: 7.5, max: 37 },
];

const accessoryOptions = ['Air Receiver', 'Dryer', 'Filters', 'VFD'];

const industryMenuItems = [
  { label: 'Oil and Gas', slug: 'oil-and-gas' },
  { label: 'Automotive', slug: 'automotive' },
  { label: 'Cement', slug: 'cement' },
  { label: 'Food & Beverage', slug: 'food-and-beverage' },
  { label: 'General Manufacturing', slug: 'general-manufacturing' },
  { label: 'Healthcare', slug: 'healthcare' },
  { label: 'Mining', slug: 'mining' },
  { label: 'Pharmaceutical', slug: 'pharmaceutical' },
  { label: 'Plastics', slug: 'plastics' },
  { label: 'Railway & Locomotive', slug: 'railway-and-locomotive' },
  { label: 'Woodworking', slug: 'woodworking' },
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
    const normalized = product.model.toUpperCase();
    const familyMatches = series.family === 'FAS'
      ? normalized.startsWith('FAS') && !normalized.startsWith('FASM')
      : normalized.startsWith(series.family);
    const power = product.powerKw || modelPower(product.model);
    return familyMatches && power >= series.min && power <= series.max;
  });
}

const navItems = [
  { id: 'home', label: 'Home' },
  {
    id: 'about-story',
    label: 'About Us',
    dropdownItems: [
      { id: 'about-story', label: 'Our Story', desc: 'Learn about firstAir and our compressor expertise', icon: BookOpen },
      { id: 'about-timeline', label: 'Timeline', desc: 'Explore important milestones in our journey', icon: FileText },
      { id: 'about-careers', label: 'Careers', desc: 'Discover opportunities to join our team', icon: ShieldCheck },
    ],
  },
  { id: 'products', label: 'Products', hasProducts: true },
  { id: 'industries', label: 'Industries', hasIndustries: true },
  { id: 'services', label: 'Services' },
  { id: 'news', label: 'News' },
  {
    id: 'support',
    label: 'Support',
    dropdownItems: [
      { id: 'distributors', label: 'Dealer Finder', desc: 'Find sales and service support near you', icon: Search },
      { id: 'technical', label: 'Technical Info', desc: 'Sizing, flow, pressure, and installation details', icon: FileText },
      { id: 'warranty', label: 'Warranty', desc: '5 year warranty guidance and support notes', icon: ShieldCheck },
    ],
  },
];

export default function Navbar({ onNavigate, currentPage, salesPhone, social }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [openSeries, setOpenSeries] = useState<string | null>(null);
  const [mobileOpenSeries, setMobileOpenSeries] = useState<string | null>(null);

  useEffect(() => {
    import('@/lib/data').then(m => {
      m.getProducts().then(items => {
        setProducts(
          items
            .filter(item => /^(FAS[-\s]?\d+|FASM\d+|FSG\d+)/i.test(item.model))
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

  const selectedSeries = productSeries.find(series => `${series.family}-${series.range}` === openSeries);
  const selectedSeriesProducts = selectedSeries ? productsForSeries(products, selectedSeries) : [];

  return (
    <>
      <div className="hidden lg:block bg-[#171717] text-white text-xs border-b border-amber-400/60">
        <div className="max-w-[1280px] mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="text-amber-200 font-semibold">Air cooled rotary screw compressors from 3 kW to 37 kW</span>
            <span className="h-3 w-px bg-amber-300/30" />
            <a href={`tel:${salesPhone}`} className="flex items-center gap-2 font-bold hover:text-red-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              {salesPhone}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="mr-1 text-sm font-semibold text-white/85">Engage With Us</span>
            {[
              { label: 'LinkedIn', href: social.linkedin || 'https://www.linkedin.com/' },
              { label: 'YouTube', href: social.youtube || 'https://www.youtube.com/' },
              { label: 'Instagram', href: social.instagram || 'https://www.instagram.com/' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={`Open ${label}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-white hover:text-slate-950"
              >
                {label === 'LinkedIn' && <span className="rounded-sm border-2 border-current px-0.5 text-[12px] font-black leading-[14px]">in</span>}
                {label === 'YouTube' && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                    <path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" />
                  </svg>
                )}
                {label === 'Instagram' && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <nav className={`sticky top-0 z-50 bg-[#f9b916]/95 backdrop-blur border-b border-amber-500 transition-shadow ${scrolled ? 'shadow-xl shadow-amber-950/15' : 'shadow-sm'}`}>
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
                      onMouseLeave={() => {
                        setOpenDropdown(null);
                        setOpenSeries(null);
                      }}
                    >
                      <button
                        onClick={() => handleNav(item.id)}
                        className={`px-3.5 py-2 rounded-md text-sm font-black uppercase tracking-wide flex items-center gap-1 transition-all ${
                          isActive ? 'text-black border-b-4 border-red-600 rounded-none' : 'text-black hover:text-red-700 hover:bg-amber-300/60'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute top-full left-[-100px] pt-3 z-50">
                          <div className={`${selectedSeries ? 'w-[1060px]' : 'w-[560px]'} bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden transition-[width] duration-200`}>
                            <div className={`grid ${selectedSeries ? 'grid-cols-[250px_240px_570px]' : 'grid-cols-[250px_310px]'}`}>
                              <div className="bg-slate-950 text-white p-5 border-t-4 border-amber-400">
                                <div className="text-amber-300 font-black text-[10px] uppercase tracking-[0.25em] mb-2">Product Series</div>
                                <h3 className="text-2xl font-black leading-tight">FirstAir Compressor Series</h3>
                                {/* <p className="text-white/65 text-sm mt-3 leading-relaxed">Browse FAS and FSG compressors by the same three series shown in the product brochures.</p> */}
                                <button onClick={() => handleNav('products')} className="mt-5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-black uppercase tracking-wide">
                                  View all products
                                </button>
                              </div>
                              <div className="border-r border-amber-100 p-3">
                                <div className="px-1 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Choose a series</div>
                                {productSeries.map(series => {
                                  const seriesKey = `${series.family}-${series.range}`;
                                  const isSeriesOpen = openSeries === seriesKey;
                                  return (
                                    <div key={seriesKey} className="mb-2 last:mb-0 overflow-hidden rounded-md border border-amber-200">
                                      <button
                                        type="button"
                                        onClick={() => setOpenSeries(isSeriesOpen ? null : seriesKey)}
                                        className={`flex w-full items-center justify-between px-3 py-3 text-left text-black transition-colors ${isSeriesOpen ? 'bg-amber-400 ring-2 ring-inset ring-red-600/20' : 'bg-[#f9b916] hover:bg-amber-400'}`}
                                        aria-expanded={isSeriesOpen}
                                      >
                                        <span><span className="block text-[11px] font-black uppercase tracking-[0.2em]">{series.title}</span><span className="text-xs font-bold">{series.range}</span></span>
                                        <ChevronDown className={`h-4 w-4 -rotate-90 transition-transform ${isSeriesOpen ? 'translate-x-0.5 text-red-700' : ''}`} />
                                      </button>
                                    </div>
                                  );
                                })}
                                <div className="mt-3 overflow-hidden rounded-md border border-slate-300">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSeries(openSeries === 'ACCESSORIES' ? null : 'ACCESSORIES')}
                                    className={`flex w-full items-center justify-between px-3 py-3 text-left transition-colors ${
                                      openSeries === 'ACCESSORIES' ? 'bg-slate-950 text-white' : 'bg-white text-slate-950 hover:bg-amber-50'
                                    }`}
                                    aria-expanded={openSeries === 'ACCESSORIES'}
                                  >
                                    <span>
                                      <span className="block text-[11px] font-black uppercase tracking-[0.12em]">Air Compressor</span>
                                      <span className="text-xs font-bold">Accessories</span>
                                    </span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${openSeries === 'ACCESSORIES' ? 'rotate-180 text-amber-300' : ''}`} />
                                  </button>
                                  {openSeries === 'ACCESSORIES' && (
                                    <div className="border-t border-slate-200 bg-white p-1.5">
                                      {accessoryOptions.map(option => (
                                        <button
                                          key={option}
                                          onClick={() => handleNav('products')}
                                          className="flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-amber-100 hover:text-red-700"
                                        >
                                          {option}
                                          <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-300" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {selectedSeries && (
                                <div className="max-h-[420px] overflow-y-auto bg-[#fffdf7] p-3">
                                  <div className="sticky top-0 z-10 mb-2 border-b border-amber-200 bg-[#fffdf7] px-2 pb-3 pt-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">{selectedSeries.title}</div>
                                    <div className="mt-0.5 text-sm font-black text-slate-950">Products from {selectedSeries.range}</div>
                                  </div>
                                  {selectedSeriesProducts.length > 0 ? <div className="grid grid-cols-3 gap-2">{selectedSeriesProducts.map(product => (
                                        <button
                                          key={product.id}
                                          onClick={() => handleNav('product-detail', String(product.id))}
                                          className="group flex min-h-[150px] flex-col rounded-md border border-amber-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-red-500 hover:shadow-md"
                                        >
                                          <div className="flex h-full flex-col">
                                            <span className="flex h-[72px] w-full items-center justify-center rounded-sm bg-[#fff8df] p-2">
                                              <img src={product.imageUrl} alt={product.model} className="max-h-16 max-w-full object-contain" />
                                            </span>
                                            <div className="mt-2 flex items-end justify-between gap-2">
                                              <div className="min-w-0">
                                                <div className="truncate font-black text-slate-900 group-hover:text-red-700">{product.model}</div>
                                                <div className="text-[10px] font-semibold text-slate-500">{product.powerKw} kW | {product.flowRateCfm} CFM</div>
                                              </div>
                                              <ChevronDown className="h-3.5 w-3.5 shrink-0 -rotate-90 text-slate-300 group-hover:text-red-600" />
                                            </div>
                                          </div>
                                        </button>
                                  ))}</div> : (
                                        <div className="px-3 py-3 text-xs font-bold text-slate-400">Products will appear here when added.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.hasIndustries) {
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        onClick={() => handleNav('industries')}
                        className={`px-3.5 py-2 rounded-md text-sm font-black uppercase tracking-wide flex items-center gap-1 transition-all ${
                          currentPage.startsWith('industr') ? 'text-black border-b-4 border-red-600 rounded-none' : 'text-black hover:text-red-700 hover:bg-amber-300/60'
                        }`}
                      >
                        Industries
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute left-0 top-full z-50 pt-3">
                          <div className="w-[310px] overflow-hidden border-t-4 border-amber-400 bg-white shadow-2xl">
                            <div className="py-2">
                              {industryMenuItems.map(industry => (
                                <button
                                  key={industry.slug}
                                  onClick={() => handleNav('industry-detail', industry.slug)}
                                  className="group/industry flex w-full items-center justify-between border-b border-slate-100 px-5 py-3 text-left text-sm font-bold text-slate-800 transition-colors last:border-b-0 hover:bg-[#fff8df] hover:text-red-700"
                                >
                                  <span>{industry.label}</span>
                                  <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-slate-300 transition-all group-hover/industry:translate-x-1 group-hover/industry:text-red-600" />
                                </button>
                              ))}
                              <button onClick={() => handleNav('industries')} className="mx-4 mt-2 flex items-center gap-2 py-2 text-xs font-black uppercase tracking-wider text-red-700 hover:text-red-800">
                                View all industries
                                <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.dropdownItems) {
                  const isResourceActive = item.dropdownItems.some(resource => resource.id === currentPage);
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
                          isResourceActive ? 'text-black border-b-4 border-red-600 rounded-none' : 'text-black hover:text-red-700 hover:bg-amber-300/60'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute top-full right-0 pt-3 z-50">
                          <div className="w-[360px] bg-white rounded-lg shadow-2xl border border-slate-100 p-3">
                            {item.dropdownItems.map(resource => {
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
                      isActive ? 'text-black border-b-4 border-red-600 rounded-none' : 'text-black hover:text-red-700 hover:bg-amber-300/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={() => handleNav('contact')}
                className="ml-3 px-5 py-2.5 bg-black hover:bg-red-700 text-white text-sm font-black rounded-sm shadow-lg transition-colors uppercase tracking-wide border-b-4 border-red-600"
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
          <div className="lg:hidden border-t border-amber-500 bg-[#fff8df] max-h-[80vh] overflow-y-auto">
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
                          {productSeries.map(series => {
                            const seriesKey = `${series.family}-${series.range}`;
                            const isSeriesOpen = mobileOpenSeries === seriesKey;
                            return <div key={`${seriesKey}-mobile`}>
                              <button type="button" onClick={() => setMobileOpenSeries(isSeriesOpen ? null : seriesKey)} className="mt-2 flex w-full items-center justify-between rounded-md bg-[#f9b916] px-3 py-3 text-[10px] font-black uppercase tracking-widest text-black" aria-expanded={isSeriesOpen}>
                                <span>{series.title} <span className="normal-case tracking-normal">({series.range})</span></span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isSeriesOpen ? 'rotate-180' : ''}`} />
                              </button>
                              {isSeriesOpen && productsForSeries(products, series).map(product => (
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
                          })}
                          <div className="mt-3 overflow-hidden rounded-md border border-slate-300">
                            <button
                              type="button"
                              onClick={() => setMobileOpenSeries(mobileOpenSeries === 'ACCESSORIES' ? null : 'ACCESSORIES')}
                              className={`flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest ${
                                mobileOpenSeries === 'ACCESSORIES' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                              }`}
                              aria-expanded={mobileOpenSeries === 'ACCESSORIES'}
                            >
                              Air Compressor Accessories
                              <ChevronDown className={`h-4 w-4 transition-transform ${mobileOpenSeries === 'ACCESSORIES' ? 'rotate-180' : ''}`} />
                            </button>
                            {mobileOpenSeries === 'ACCESSORIES' && (
                              <div className="border-t border-slate-200 bg-white py-1">
                                {accessoryOptions.map(option => (
                                  <button
                                    key={`${option}-mobile`}
                                    onClick={() => handleNav('products')}
                                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-red-700"
                                  >
                                    {option}
                                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-400" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleNav('products')} className="w-full text-left px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700">
                            View all products
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.hasIndustries) {
                  return (
                    <div key={item.id}>
                      <button onClick={() => setMobileSubOpen(mobileSubOpen === item.id ? null : item.id)} className="w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-black uppercase tracking-wide text-slate-800 hover:bg-white">
                        Industries
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubOpen === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileSubOpen === item.id && (
                        <div className="ml-3 border-l-2 border-red-200 py-1 pl-3">
                          {industryMenuItems.map(industry => (
                            <button key={`${industry.slug}-mobile`} onClick={() => handleNav('industry-detail', industry.slug)} className="flex w-full items-center justify-between border-b border-amber-100 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 last:border-b-0 hover:bg-white hover:text-red-700">
                              <span>{industry.label}</span>
                              <ChevronDown className="h-3.5 w-3.5 shrink-0 -rotate-90 text-slate-400" />
                            </button>
                          ))}
                          <button onClick={() => handleNav('industries')} className="px-3 py-2 text-xs font-black uppercase tracking-wide text-red-700">View all industries</button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.dropdownItems) {
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setMobileSubOpen(mobileSubOpen === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-black uppercase tracking-wide text-slate-800 hover:bg-white"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubOpen === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileSubOpen === item.id && (
                        <div className="ml-3 space-y-1 border-l-2 border-red-200 py-1 pl-3">
                          {item.dropdownItems.map(link => (
                            <button
                              key={link.id}
                              onClick={() => handleNav(link.id)}
                              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-white hover:text-red-700"
                            >
                              {link.label}
                            </button>
                          ))}
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

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button onClick={() => handleNav('contact')} className="px-4 py-3 bg-red-600 text-white text-sm font-black rounded-md uppercase tracking-wide">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
