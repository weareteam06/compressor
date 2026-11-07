import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, FileText, Globe2, Mail, MapPin, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  currentPage: string;
  salesPhone: string;
  email: string;
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
  'FSL30A-4.5', 'FSLV30A-4.5', 'FSL37A-4.5', 'FSLV37A-4.5', 'FSL55A-4.5', 'FSLV55A-4.5',
  'FSL75A-4.5', 'FSLV75-4.5', 'FSL90A-4.5', 'FSLV90A-4.5', 'FSL110A-4.5', 'FSLV110A-4.5',
  'FSL132A-4.5', 'FSLV132A-4.5', 'FSL160A-4.5', 'FSLV160A-4.5', 'FSL185A-4.5', 'FSLV185A-4.5',
  'FSL220A-4.5', 'FSLV220A-4.5',
  'FSG270A', 'FSG340A', 'FSG460A', 'FSG760A', 'FSG860A', 'FSG1060A',
];

type MenuProduct = { id: number | string; model: string; powerKw: number; flowRateCfm: string; imageUrl: string };

const productSeries = [
  { label: 'FAS 4-11 kW Fixed Speed', title: 'FAS Series', range: '4-11 kW', family: 'FAS', min: 4, max: 11 },
  { label: 'FAS 15-250 kW Fixed Speed', title: 'FAS Series', range: '15-250 kW', family: 'FAS', min: 15, max: 250 },
  { label: 'FASM Variable Speed', title: 'FASM Series', range: '7.5-37 kW', family: 'FASM', min: 7.5, max: 37 },
  { label: 'FSL Low Pressure', title: 'FSL / FSLV Series', range: '30-220 kW', family: 'FSL', min: 30, max: 220 },
  { label: 'FSG High Capacity', title: 'FSG Series', range: '45-185 kW', family: 'FSG', min: 45, max: 185 },
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
      { id: 'warranty', label: 'Warranty', desc: '5 year extended warranty guidance and support notes', icon: ShieldCheck },
    ],
  },
];

export default function Navbar({ onNavigate, currentPage, salesPhone, email, social }: NavbarProps) {
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
      <nav className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-xl shadow-slate-950/10' : 'shadow-sm'}`}>
        <div className="flex h-9 items-center justify-between bg-slate-950 px-4 text-[10px] font-semibold text-white lg:hidden">
          <a href={`tel:${salesPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-amber-400" />{salesPhone}</a>
          <button onClick={() => handleNav('distributors')} className="uppercase tracking-[0.1em] text-slate-200">Find a dealer</button>
        </div>
        <div className="hidden bg-slate-950 text-white lg:block">
          <div className="mx-auto flex h-10 max-w-[1400px] items-center justify-between px-3 text-[11px] font-semibold sm:px-5 lg:px-8">
            <div className="flex items-center gap-2 text-slate-300"><MapPin className="h-3.5 w-3.5 text-amber-400" />Industrial compressed-air solutions across India</div>
            <div className="flex h-full items-center divide-x divide-white/15">
              <a href={`tel:${salesPhone.replace(/\s/g, '')}`} className="flex h-full items-center gap-2 px-4 text-slate-200 transition hover:bg-white/10 hover:text-white"><Phone className="h-3.5 w-3.5 text-amber-400" />{salesPhone}</a>
              <a href={`mailto:${email}`} className="flex h-full items-center gap-2 px-4 text-slate-200 transition hover:bg-white/10 hover:text-white"><Mail className="h-3.5 w-3.5 text-amber-400" />{email}</a>
              <button onClick={() => handleNav('distributors')} className="h-full px-4 uppercase tracking-[0.12em] text-slate-200 transition hover:bg-white/10 hover:text-white">Dealer finder</button>
              {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" aria-label="firstAir on LinkedIn" className="flex h-full items-center px-4 text-xs font-black text-slate-200 transition hover:bg-white/10 hover:text-white">in</a>}
              <span className="flex h-full items-center gap-2 px-4 text-white"><Globe2 className="h-3.5 w-3.5 text-amber-400" />EN</span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-[86px]">
            <button onClick={() => handleNav('home')} className="flex items-center gap-3 flex-shrink-0">
              <img src={logoUrl} alt="firstAir Compressor" className="h-9 w-auto lg:h-12" />
            </button>

            <div className="hidden h-full items-center lg:flex">
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
                        className={`flex h-[86px] items-center gap-1 border-b-[3px] px-4 text-[13px] font-bold uppercase tracking-[0.06em] transition-all ${
                          isActive ? 'border-red-600 text-red-700' : 'border-transparent text-slate-800 hover:border-amber-400 hover:text-red-700'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute left-[-100px] top-full z-50">
                          <div className={`${selectedSeries ? 'w-[1060px]' : 'w-[560px]'} bg-white rounded-lg shadow-2xl border border-slate-100 overflow-hidden transition-[width] duration-200`}>
                            <div className={`grid ${selectedSeries ? 'grid-cols-[250px_240px_570px]' : 'grid-cols-[250px_310px]'}`}>
                              <div className="bg-slate-950 text-white p-5 border-t-4 border-amber-400">
                                <div className="text-amber-300 font-black text-[10px] uppercase tracking-[0.25em] mb-2">Product Series</div>
                                <h3 className="text-2xl font-black leading-tight">FirstAir Compressor Series</h3>
                                {/* <p className="text-white/65 text-sm mt-3 leading-relaxed">Browse FAS and FSG compressors by the same three series shown in the product brochures.</p> */}
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
                                        <span className="block text-[11px] font-black uppercase tracking-[0.2em]">{series.label}</span>
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
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">{selectedSeries.label}</div>
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
                        className={`flex h-[86px] items-center gap-1 border-b-[3px] px-4 text-[13px] font-bold uppercase tracking-[0.06em] transition-all ${
                          currentPage.startsWith('industr') ? 'border-red-600 text-red-700' : 'border-transparent text-slate-800 hover:border-amber-400 hover:text-red-700'
                        }`}
                      >
                        Industries
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute left-0 top-full z-50">
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
                        className={`flex h-[86px] items-center gap-1 border-b-[3px] px-4 text-[13px] font-bold uppercase tracking-[0.06em] transition-all ${
                          isResourceActive ? 'border-red-600 text-red-700' : 'border-transparent text-slate-800 hover:border-amber-400 hover:text-red-700'
                        }`}
                      >
                        {item.label}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute right-0 top-full z-50">
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
                    className={`h-[86px] border-b-[3px] px-4 text-[13px] font-bold uppercase tracking-[0.06em] transition-all ${
                      isActive ? 'border-red-600 text-red-700' : 'border-transparent text-slate-800 hover:border-amber-400 hover:text-red-700'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <button
                onClick={() => handleNav('contact')}
                className="ml-4 bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-slate-950"
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
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
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
                                <span>{series.label}</span>
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
