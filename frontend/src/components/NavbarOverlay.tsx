import { SiteText } from '@/lib/SiteText';
import LanguageSelector from './LanguageSelector';
import { useEffect, useRef, useState } from 'react';
import { BriefcaseBusiness, ChevronRight, Mail, Phone, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import type { NavigationItem, SiteConfig } from '@/lib/data';

interface Props { onNavigate: (page: string, param?: string) => void; currentPage: string; config: SiteConfig }
const fallbackItems: NavigationItem[] = [
  { id: 'home', label: 'Home', page: 'home' }, { id: 'products', label: 'Products', page: 'products' },
  { id: 'industries', label: 'Industries', page: 'industries' }, { id: 'services', label: 'Service & Support', page: 'services' },
  { id: 'about', label: 'About Us', page: 'about-story' }, { id: 'contact', label: 'Contact Us', page: 'contact' },
];
const productMenu = [
  { prefix: 'FAS 4-11 kW', options: [{ label: 'Fixed Speed', param: 'fas-small' }, { label: 'Variable Speed', param: 'variable-fas-small' }] },
  { prefix: 'FAS 15-250 kW', options: [{ label: 'Fixed Speed', param: 'fas' }, { label: 'Variable Speed', param: 'variable-fas-large' }] },
  { prefix: 'FASM', options: [{ label: 'Variable Speed', param: 'variable-fasm' }] },
  { prefix: 'FSLV', options: [{ label: 'Low Pressure', param: 'variable-fsl' }] },
  { prefix: 'FSG', options: [{ label: 'Electric Portable', param: 'fsg' }] },
];

export default function NavbarOverlay({ onNavigate, currentPage, config }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchContainer = useRef<HTMLDivElement>(null);
  const loginContainer = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchForm = useRef<HTMLFormElement>(null);
  const closeSearch = () => { setSearchOpen(false); searchButton.current?.focus(); };
  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!searchContainer.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [searchOpen]);
  useEffect(() => {
    if (!loginOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!loginContainer.current?.contains(event.target as Node)) setLoginOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [loginOpen]);
  const nav = config.navigation;
  const items = (nav?.items || fallbackItems).filter(item => item.active !== false);
  const phoneHref = config.contact.salesPhone.replace(/[^+\d]/g, '');

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setSearchOpen(false); if (searchContainer.current?.contains(document.activeElement)) searchButton.current?.focus(); } }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);

  const navigate = (page: string, param?: string) => { onNavigate(page, param); setOpen(false); setSearchOpen(false); setLoginOpen(false); setExpanded(null); };
  const openItem = (item: NavigationItem) => {
    if (item.url) { item.external ? window.open(item.url, '_blank', 'noopener,noreferrer') : window.location.assign(item.url); setOpen(false); return; }
    navigate(item.id === 'about' ? 'about-story' : item.page || item.id, item.param);
  };

  return <>
    <header className="sticky inset-x-0 top-0 z-40 border-b border-amber-500 bg-[#f9b916]/95 text-slate-950 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-5 lg:px-8"><div className="grid h-[100px] grid-cols-[1fr_auto] grid-rows-[36px_64px] items-center lg:grid-rows-[32px_68px]">
        <button onClick={() => navigate('home')} aria-label={`${nav?.logoAlt || config.company.name} home`} className="col-start-1 row-start-2 justify-self-start lg:row-start-1 lg:row-span-2"><img src={nav?.logoUrl || 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/logo.svg'} alt={nav?.logoAlt || config.company.name} className="h-10 w-auto sm:h-12 lg:h-16" /></button>
        <div className="col-span-2 col-start-1 row-start-1 flex h-full items-center justify-end text-[11px] font-semibold lg:col-span-1 lg:col-start-2">
          <button onClick={() => navigate('request')} className="mr-3 rounded bg-red-600 px-4 py-1.5 text-xs font-bold text-white">{nav?.requestQuoteLabel || 'Request Quote'}</button>
          <a href={`tel:${phoneHref}`} className="hidden h-full items-center gap-2 border-x border-black/10 px-3 lg:flex hover:bg-white/20"><Phone className="h-3.5 w-3.5" />{config.contact.salesPhone}</a>
          <a href={`mailto:${config.contact.email}`} className="hidden h-full items-center gap-2 border-r border-black/10 px-3 xl:flex hover:bg-white/20"><Mail className="h-4 w-4" />{config.contact.email}</a>
          <LanguageSelector />
          <div ref={loginContainer} className="relative h-full"><button onClick={() => setLoginOpen(value => !value)} className="flex h-full items-center px-4 hover:bg-white/20" aria-label="Open login options" aria-expanded={loginOpen}><UserRound className="h-4 w-4" /></button>{loginOpen && <div className="absolute right-0 top-full z-30 w-52 overflow-hidden rounded-b-lg border border-black/10 bg-white py-1 text-slate-950 shadow-xl"><button onClick={() => navigate('dealer-login')} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold hover:bg-amber-50"><BriefcaseBusiness className="h-4 w-4 text-red-700" /><SiteText section="NavbarOverlay" name="dealer_login" /></button><button onClick={() => navigate('employee-login')} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold hover:bg-amber-50"><ShieldCheck className="h-4 w-4 text-red-700" /><SiteText section="NavbarOverlay" name="employee_login" /></button></div>}</div>
          <div ref={searchContainer} className="relative z-10 h-8 w-9 shrink-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
            <form ref={searchForm} id="header-search" role="search" aria-hidden={!searchOpen} inert={!searchOpen} onSubmit={event => { event.preventDefault(); if (query.trim()) { navigate('search', query.trim()); searchButton.current?.focus(); } }} className={`absolute right-0 top-0 flex h-8 items-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/15 transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none ${searchOpen ? 'w-[min(320px,calc(100vw-24px))] opacity-100' : 'pointer-events-none w-0 opacity-0'}`}>
              <input ref={searchInput} required aria-label="Search products" placeholder="Search products..." value={query} onChange={event => setQuery(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent pl-3 text-sm font-normal outline-none" />
              <button type="button" onClick={closeSearch} aria-label="Close search" className="mr-9 shrink-0 p-1.5 text-slate-500 hover:text-slate-950"><X className="h-3.5 w-3.5" /></button>
            </form>
            <button ref={searchButton} type="button" onClick={() => { if (searchOpen) searchForm.current?.requestSubmit(); else { setOpen(false); setSearchOpen(true); } }} aria-label={searchOpen ? 'Submit search' : (nav?.searchLabel || 'Search')} aria-expanded={searchOpen} aria-controls="header-search" className="relative z-10 flex h-8 w-9 items-center justify-center rounded-md hover:bg-black/5 focus-visible:outline focus-visible:outline-2"><Search className="h-4 w-4" /></button>
          </div>
        </div>
        <button onClick={() => { setSearchOpen(false); setOpen(true); }} className="col-start-2 row-start-2 flex items-center gap-5 justify-self-end py-2 text-sm font-bold uppercase tracking-[0.12em] lg:col-start-2 lg:row-start-2" aria-label={nav?.menuLabel || 'Open menu'} aria-expanded={open}><span className="hidden sm:inline">{nav?.menuLabel || 'Menu'}</span><span className="flex w-9 flex-col gap-2 lg:w-14"><span className="h-[3px] bg-slate-950" /><span className="h-[3px] bg-slate-950" /><span className="h-[3px] bg-slate-950" /></span></button>
      </div></div>
    </header>
    <div onClick={() => setOpen(false)} className={`fixed inset-0 z-[1000] bg-slate-950/70 transition-opacity ${open ? 'visible opacity-100' : 'invisible opacity-0'}`} />
    <aside className={`fixed right-0 top-0 z-[1010] flex h-dvh w-full max-w-[500px] flex-col bg-[#f9b916] shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!open} inert={!open}>
      <div className="flex h-24 items-center justify-between border-b border-black/15 px-7 sm:px-10"><div className="flex gap-4 text-xs font-bold uppercase"><button onClick={() => navigate('dealer-login')} className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" /><SiteText section="NavbarOverlay" name="dealer_login" /></button><button onClick={() => navigate('employee-login')} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><SiteText section="NavbarOverlay" name="employee_login" /></button></div><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-10 w-10" /></button></div>
      <nav className="flex-1 overflow-y-auto px-7 py-7 sm:px-10" aria-label="Main navigation">{items.map(item => {
        const isProducts = item.id === 'products';
        const children = item.id === 'about' || isProducts ? [] : (item.children || []).filter(child => child.active !== false && child.id !== 'about-careers' && child.label.trim().toLowerCase() !== 'careers'), hasChildren = isProducts || children.length > 0, isExpanded = expanded === item.id;
        const active = currentPage === item.id || currentPage.startsWith(item.id);
        return <div key={item.id} className="border-b border-black/10"><button onClick={() => hasChildren ? setExpanded(isExpanded ? null : item.id) : openItem(item)} className={`flex w-full items-center justify-between py-4 text-left text-base font-extrabold uppercase tracking-[0.06em] ${active ? 'text-red-700' : ''}`} aria-expanded={hasChildren ? isExpanded : undefined}>{item.label}{hasChildren && <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}</button>{hasChildren && <div className={`grid transition-[grid-template-rows] ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden"><div className="mb-4 border-l-2 border-red-600 pl-5">{isProducts ? <ProductMenuOptions onNavigate={navigate} /> : children.map(child => <button key={child.id} onClick={() => openItem(child)} className="flex w-full items-center justify-between py-2.5 text-left text-sm font-semibold hover:text-red-700">{child.label}<ChevronRight className="h-4 w-4" /></button>)}</div></div></div>}</div>;
      })}</nav>
      <div className="grid grid-cols-2 gap-3 border-t border-black/15 p-6"><a href={`tel:${phoneHref}`} className="flex items-center justify-center gap-2 rounded-md border border-black/30 bg-white/50 px-4 py-3 text-sm font-black"><Phone className="h-4 w-4" />{nav?.callLabel || 'Call'}</a><button onClick={() => navigate('request')} className="rounded-md bg-red-600 px-4 py-3 text-sm font-black text-white">{nav?.requestQuoteLabel || 'Request Quote'}</button></div>
    </aside>
  </>;
}

function ProductMenuOptions({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  return <div className="space-y-1">
    {productMenu.map(item => <div key={item.prefix} className="py-1.5 text-sm font-semibold">
      <span>{item.prefix} </span>
      {item.options.map((option, index) => <span key={option.param}>{index > 0 && <span className="mx-1 text-slate-700">/</span>}<button type="button" onClick={() => onNavigate('products', option.param)} className="hover:text-red-700">{option.label}</button></span>)}
    </div>)}
  </div>;
}
