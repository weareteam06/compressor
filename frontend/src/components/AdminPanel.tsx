import { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, LayoutDashboard, Package, FileText, LogOut, Building2, Users,
  CheckCircle2, AlertCircle, ChevronRight, Globe, Briefcase, Newspaper, Calendar,
  Cog, MapPin, Wrench, Edit2, Search, Bell, ShieldCheck,
} from 'lucide-react';
import type {
  Product, ProductCategory, Industry, Service, NewsArticle, TimelineEvent,
  JobOpening, Distributor, Lead, SiteConfig, UserAccount, UserPayload
} from '@/lib/data';
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminGetIndustries, adminCreateIndustry, adminUpdateIndustry, adminDeleteIndustry,
  adminGetServices, adminCreateService, adminUpdateService, adminDeleteService,
  adminGetNews, adminCreateNews, adminUpdateNews, adminDeleteNews,
  adminGetTimeline, adminCreateTimelineEvent, adminUpdateTimelineEvent, adminDeleteTimelineEvent,
  adminGetJobs, adminCreateJob, adminUpdateJob, adminDeleteJob,
  adminGetDistributors, adminCreateDistributor, adminUpdateDistributor, adminDeleteDistributor,
  adminGetLeads, adminUpdateLead, adminDeleteLead,
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, getCurrentUser,
  getSiteConfig, adminUpdateSiteConfig,
} from '@/lib/data';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
  onNavigateFrontend: (page: string) => void;
}

export type Tab = 'dashboard' | 'users' | 'categories' | 'products' | 'industries' | 'services' | 'news' | 'timeline' | 'careers' | 'distributors' | 'leads' | 'settings';
export type AdminTab = Tab;

// Form modal helpers
const FormField = ({ label, value, onChange, type = 'text', textarea, required, options }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{label}{required && ' *'}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold">
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : textarea ? (
      <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-sm font-medium resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" />
    )}
  </div>
);

const JsonArrayField = ({ label, value, onChange }: { label: string; value: unknown[]; onChange: (value: unknown[]) => void }) => {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState('');

  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setError('Expected a JSON array.');
        return;
      }
      setError('');
      onChange(parsed);
    } catch {
      setError('Invalid JSON. Fix the format before saving.');
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{label}</label>
      <textarea
        rows={8}
        value={text}
        onChange={event => setText(event.target.value)}
        onBlur={apply}
        className={`w-full px-3 py-2.5 rounded-lg border outline-none text-xs font-mono resize-y ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-red-500'}`}
      />
      <p className={`text-[10px] mt-1 ${error ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
        {error || 'Edit as JSON array. Example: [{ "label": "Weight", "value": "230 kg" }]'}
      </p>
    </div>
  );
};

const Modal = ({ title, onClose, children, onSave, saveLabel = 'Save' }: any) => (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">{children}</div>
      <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
        <button onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-sm rounded-lg">Cancel</button>
        <button onClick={onSave} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-lg shadow-lg">{saveLabel}</button>
      </div>
    </div>
  </div>
);

const defaultPageSettings = {
  technical: {
    eyebrow: 'Technical Information',
    title: 'Technical documents for selecting and operating FAS compressors',
    intro: 'Use the product data sheets and technical information to compare air discharge, pressure, power, dimensions, weight, and package options across the FAS compressor range.',
    points: [
      'Operating pressure: 8 to 10 bar(g)',
      'Air discharge range: 0.52 m3/min to 5.94 m3/min',
      'Motor nominal power range: 4 kW to 37 kW',
      'IE3 energy efficiency class motors',
      'IP55 protection and Class F insulation',
    ],
  },
  warranty: {
    eyebrow: 'Warranty Information',
    title: '5 year warranty support with genuine firstAir parts',
    intro: 'firstAir warranty support is designed around correct maintenance, genuine parts, and regular service practices that protect compressor reliability.',
    points: [
      '5 year warranty program for eligible compressors',
      'Use genuine firstAir parts during recommended service intervals',
      'Keep maintenance records for warranty support',
      'Contact the support team for service, parts, and warranty guidance',
    ],
  },
};

export default function AdminPanel({ activeTab, onTabChange, onLogout, onNavigateFrontend }: Props) {
  const tab = activeTab;
  const [notif, setNotif] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // All stores
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Editing state
  const [editing, setEditing] = useState<any>(null);
  const [editType, setEditType] = useState<string>('');

  useEffect(() => { loadAll(); }, [tab]);

  const loadAll = async () => {
    setLoading(true);
    const me = await getCurrentUser();
    setCurrentUser(me);
    const canManageContent = me.role === 'SUPER_ADMIN' || me.role === 'ADMIN';
    const canManageUsers = me.role === 'SUPER_ADMIN';
    const cfg = await getSiteConfig();
    setConfig(cfg);

    if (!canManageContent) {
      const [d, l] = await Promise.all([adminGetDistributors(), adminGetLeads()]);
      setDistributors(d); setLeads(l);
      if (tab !== 'leads' && tab !== 'distributors') onTabChange('leads');
      setLoading(false);
      return;
    }

    if (tab === 'users' && !canManageUsers) {
      onTabChange('dashboard');
      setLoading(false);
      return;
    }

    switch (tab) {
      case 'dashboard': {
        const [c, p, i, s, n, j, d, l] = await Promise.all([
          adminGetCategories(), adminGetProducts(), adminGetIndustries(), adminGetServices(),
          adminGetNews(), adminGetJobs(), adminGetDistributors(), adminGetLeads(),
        ]);
        setCategories(c); setProducts(p); setIndustries(i); setServices(s);
        setNews(n); setJobs(j); setDistributors(d); setLeads(l);
        break;
      }
      case 'users': {
        const [u, d] = await Promise.all([adminGetUsers(), adminGetDistributors()]);
        setUsers(u); setDistributors(d);
        break;
      }
      case 'categories':
        setCategories(await adminGetCategories());
        break;
      case 'products': {
        const [c, p] = await Promise.all([adminGetCategories(), adminGetProducts()]);
        setCategories(c); setProducts(p);
        break;
      }
      case 'industries':
        setIndustries(await adminGetIndustries());
        break;
      case 'services':
        setServices(await adminGetServices());
        break;
      case 'news':
        setNews(await adminGetNews());
        break;
      case 'timeline':
        setTimeline(await adminGetTimeline());
        break;
      case 'careers':
        setJobs(await adminGetJobs());
        break;
      case 'distributors':
        setDistributors(await adminGetDistributors());
        break;
      case 'leads': {
        const [d, l, u] = await Promise.all([adminGetDistributors(), adminGetLeads(), adminGetUsers()]);
        setDistributors(d); setLeads(l); setUsers(u);
        break;
      }
      case 'settings':
        break;
    }
    setLoading(false);
  };

  const notify = (type: 'success' | 'error', text: string) => {
    setNotif({ type, text });
    setTimeout(() => setNotif(null), 3500);
  };

  const handleDelete = async (type: string, id: number | string, fn: (id: number | string) => Promise<any>) => {
    if (window.confirm(`Delete this ${type}?`)) {
      await fn(id);
      notify('success', `${type} deleted successfully`);
      loadAll();
    }
  };

  const handleSave = async () => {
    if (!editing || !editType) return;
    try {
      const isNew = !editing.id;
      const data = { ...editing };
      delete data.id;

      switch (editType) {
        case 'category':
          isNew ? await adminCreateCategory(data) : await adminUpdateCategory(editing.id, data); break;
        case 'product':
          isNew ? await adminCreateProduct(data) : await adminUpdateProduct(editing.id, data); break;
        case 'industry':
          isNew ? await adminCreateIndustry(data) : await adminUpdateIndustry(editing.id, data); break;
        case 'service':
          isNew ? await adminCreateService(data) : await adminUpdateService(editing.id, data); break;
        case 'news':
          isNew ? await adminCreateNews(data) : await adminUpdateNews(editing.id, data); break;
        case 'timeline':
          isNew ? await adminCreateTimelineEvent(data) : await adminUpdateTimelineEvent(editing.id, data); break;
        case 'job':
          isNew ? await adminCreateJob(data) : await adminUpdateJob(editing.id, data); break;
        case 'distributor':
          isNew ? await adminCreateDistributor(data) : await adminUpdateDistributor(editing.id, data); break;
        case 'user':
          isNew ? await adminCreateUser(data as UserPayload) : await adminUpdateUser(editing.id, data as Partial<UserPayload>); break;
      }
      notify('success', `${editType} saved successfully`);
      setEditing(null);
      setEditType('');
      loadAll();
    } catch (err) {
      notify('error', 'Save failed');
    }
  };

  const canManageContent = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const canManageUsers = currentUser?.role === 'SUPER_ADMIN';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-red-600', show: canManageContent },
    { id: 'users', label: 'Users & Roles', icon: Users, color: 'text-slate-700', show: canManageUsers },
    { id: 'categories', label: 'Product Categories', icon: Cog, color: 'text-purple-600', show: canManageContent },
    { id: 'products', label: 'Products', icon: Package, color: 'text-red-600', show: canManageContent },
    { id: 'industries', label: 'Industries', icon: Building2, color: 'text-emerald-600', show: canManageContent },
    { id: 'services', label: 'Services', icon: Wrench, color: 'text-orange-600', show: canManageContent },
    { id: 'news', label: 'News & Events', icon: Newspaper, color: 'text-rose-600', show: canManageContent },
    { id: 'timeline', label: 'Company Timeline', icon: Calendar, color: 'text-indigo-600', show: canManageContent },
    { id: 'careers', label: 'Job Openings', icon: Briefcase, color: 'text-cyan-600', show: canManageContent },
    { id: 'distributors', label: 'Distributors', icon: MapPin, color: 'text-red-600', show: true },
    { id: 'leads', label: 'CRM Leads', icon: Users, color: 'text-green-600', show: true },
    { id: 'settings', label: 'Site Settings', icon: Globe, color: 'text-amber-600', show: canManageContent },
  ].filter(item => item.show);

  const stats = [
    { label: 'Product Categories', count: categories.length, tab: 'categories' as Tab, icon: Cog, color: 'from-purple-500 to-purple-700' },
    { label: 'Products', count: products.length, tab: 'products' as Tab, icon: Package, color: 'from-red-500 to-red-700' },
    { label: 'Industries', count: industries.length, tab: 'industries' as Tab, icon: Building2, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Services', count: services.length, tab: 'services' as Tab, icon: Wrench, color: 'from-orange-500 to-orange-700' },
    { label: 'News Articles', count: news.length, tab: 'news' as Tab, icon: Newspaper, color: 'from-rose-500 to-rose-700' },
    { label: 'Job Openings', count: jobs.filter(j => j.status === 'Open').length, tab: 'careers' as Tab, icon: Briefcase, color: 'from-cyan-500 to-cyan-700' },
    { label: 'Distributors', count: distributors.length, tab: 'distributors' as Tab, icon: MapPin, color: 'from-red-500 to-red-700' },
    { label: 'Open Leads', count: leads.filter(l => !['Won', 'Lost', 'Closed'].includes(l.status)).length, tab: 'leads' as Tab, icon: Users, color: 'from-green-500 to-green-700' },
  ];

  const pageSettings = {
    technical: { ...defaultPageSettings.technical, ...(config?.pages?.technical || {}) },
    warranty: { ...defaultPageSettings.warranty, ...(config?.pages?.warranty || {}) },
  };

  const updateInfoPage = (page: 'technical' | 'warranty', updates: Partial<typeof defaultPageSettings.technical>) => {
    if (!config) return;
    setConfig({
      ...config,
      pages: {
        ...(config.pages || {}),
        [page]: {
          ...pageSettings[page],
          ...updates,
        },
      },
    });
  };

  const startCreate = (type: string, template: any) => { setEditing(template); setEditType(type); };
  const startEdit = (type: string, item: any) => { setEditing({ ...item }); setEditType(type); };

  if (loading || !config) return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 lg:flex">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-red-600/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-2 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="h-10 w-72 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-10 w-44 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <main className="p-6 lg:p-8 space-y-5">
          <div className="h-36 rounded-xl bg-gradient-to-r from-red-700 to-red-500 animate-pulse" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-lg bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="h-80 rounded-lg bg-white border border-slate-200 animate-pulse" />
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 lg:flex">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 shrink-0 bg-white border-r border-slate-200 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/20">FA</div>
          <div className="min-w-0">
            <div className="font-black text-lg leading-tight text-slate-950">firstAir Admin</div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">Control Center</div>
          </div>
        </div>

        <nav className="p-3 space-y-5">
          <div>
            <div className="text-[11px] font-black text-slate-900 px-2 mb-2">Home</div>
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button key={item.id} onClick={() => onTabChange(item.id as Tab)}
                  className={`flex min-w-max lg:min-w-0 items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all w-full text-left ${
                    isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1">{item.label}</span>
                  {!isActive && <ChevronRight className="w-3.5 h-3.5 hidden lg:block text-slate-300" />}
                </button>
              );
            })}
            </div>
          </div>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-3 w-full max-w-sm">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full h-10 rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => onNavigateFrontend('home')} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-all shadow-sm">
              <Globe className="w-4 h-4" /><span className="hidden sm:inline">View Website</span>
            </button>
            <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-md bg-slate-50 text-slate-500 border border-slate-100">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-black text-slate-950">{currentUser?.displayName || currentUser?.username || 'Administrator'}</div>
                <div className="text-xs text-slate-500">{currentUser?.role || 'ADMIN'}</div>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white rounded-md text-xs font-bold transition-all border border-red-100">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 p-4 lg:p-8">
          <div className="mx-auto max-w-[1640px]">
          {notif && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold text-sm shadow-lg ${
              notif.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <span>{notif.text}</span>
            </div>
          )}

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-5 lg:p-7">
              <div className="mb-8">
                <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">Dashboard</div>
                <h1 className="text-2xl font-black text-slate-950">Administration Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor content inventory, CRM workload, and operational modules from one console.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label} onClick={() => onTabChange(s.tab)}
                      className="bg-white rounded-lg p-4 text-left border border-slate-200 hover:border-red-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-2xl font-black text-slate-950">{s.count}</div>
                          <div className="text-xs font-bold mt-1 text-slate-500">{s.label}</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 border border-slate-200 rounded-lg p-5 bg-slate-50">
                <h3 className="text-base font-black text-slate-950 mb-1">Priority Actions</h3>
                <p className="text-slate-400 text-sm mb-6">Manage products, categories, industries, services, news, careers, distributors, leads, and global site settings — all from one place.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Add Product', tab: 'products' as Tab },
                    { label: 'Post News', tab: 'news' as Tab },
                    { label: 'Add Distributor', tab: 'distributors' as Tab },
                    { label: 'Review Leads', tab: 'leads' as Tab },
                  ].map(b => (
                    <button key={b.label} onClick={() => onTabChange(b.tab)} className="bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />{b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && canManageUsers && (
            <ListView title="Users & Roles" subtitle={`${users.length} portal users with role-based access`}
              onAdd={() => startCreate('user', { username: '', password: '', displayName: '', email: '', role: 'USER', organizationId: '', distributorId: undefined, active: true })}
              addLabel="Add User">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-500 tracking-wider">
                      <th className="text-left py-3 px-3">User</th>
                      <th className="text-left py-3 px-3">Role</th>
                      <th className="text-left py-3 px-3">Distributor</th>
                      <th className="text-left py-3 px-3">Status</th>
                      <th className="text-right py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-black text-slate-900">{user.displayName || user.username}</div>
                          <div className="text-xs text-slate-500">{user.username} · {user.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">{user.role}</span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          {user.distributorId ? distributors.find(d => d.id === user.distributorId)?.name || `#${user.distributorId}` : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black ${user.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => startEdit('user', { ...user, password: '' })} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete('user', user.id, adminDeleteUser)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ListView>
          )}

          {/* CATEGORIES */}
          {tab === 'categories' && (
            <ListView title="Product Categories" subtitle="Manage the 8 main product categories"
              onAdd={() => startCreate('category', { slug: '', name: '', shortName: '', description: '', longDescription: '', icon: 'Cog', imageUrl: '', features: [], applications: [], order: categories.length + 1 })}
              addLabel="Add Category">
              <div className="grid sm:grid-cols-2 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="border border-slate-200 rounded-xl p-4 hover:border-red-300 transition-colors flex gap-3">
                    <img src={c.imageUrl} alt={c.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-amber-600 font-black uppercase">{c.shortName}</div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight truncate">{c.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => startEdit('category', c)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                        <button onClick={() => handleDelete('category', c.id, adminDeleteCategory)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <ListView title="Products" subtitle={`${products.length} products across ${categories.length} categories`}
              onAdd={() => startCreate('product', { categoryId: categories[0]?.id || '', model: '', name: '', series: '', description: '', longDescription: '', imageUrl: '', powerHp: 0, powerKw: 0, pressureMin: 7, pressureMax: 13, flowRateCfm: '', flowRateM3Min: '', features: [], specifications: [], applications: [] })}
              addLabel="Add Product">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-500 tracking-wider">
                  <th className="text-left py-3 px-3">Image</th><th className="text-left py-3 px-3">Model</th><th className="text-left py-3 px-3">Category</th><th className="text-left py-3 px-3">Power</th><th className="text-right py-3 px-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3"><img src={p.imageUrl} alt={p.model} className="w-14 h-12 rounded-lg object-cover" /></td>
                      <td className="py-3 px-3"><div className="font-black text-slate-900">{p.model}</div><div className="text-xs text-slate-500">{p.series} Series</div></td>
                      <td className="py-3 px-3 text-xs text-slate-600">{categories.find(c => c.id === p.categoryId)?.shortName || '—'}</td>
                      <td className="py-3 px-3 font-bold text-red-700">{p.powerHp} HP / {p.powerKw} kW</td>
                      <td className="py-3 px-3 text-right"><div className="flex justify-end gap-1.5">
                        <button onClick={() => startEdit('product', p)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete('product', p.id, adminDeleteProduct)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ListView>
          )}

          {/* INDUSTRIES */}
          {tab === 'industries' && (
            <ListView title="Industries" subtitle="Industry-specific solutions"
              onAdd={() => startCreate('industry', { slug: '', name: '', shortDescription: '', fullDescription: '', imageUrl: '', applications: [], recommendedProducts: [], challenges: [] })}
              addLabel="Add Industry">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map(i => (
                  <div key={i.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-colors">
                    <img src={i.imageUrl} alt={i.name} className="w-full h-28 object-cover" />
                    <div className="p-4">
                      <h4 className="font-black text-slate-900 text-sm">{i.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{i.shortDescription}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startEdit('industry', i)} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded hover:bg-emerald-200"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                        <button onClick={() => handleDelete('industry', i.id, adminDeleteIndustry)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* SERVICES */}
          {tab === 'services' && (
            <ListView title="Services" subtitle="Service offerings management"
              onAdd={() => startCreate('service', { slug: '', name: '', shortDescription: '', fullDescription: '', iconName: 'Wrench', imageUrl: '', benefits: [], process: [] })}
              addLabel="Add Service">
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map(s => (
                  <div key={s.id} className="border border-slate-200 rounded-xl p-4 hover:border-orange-300 transition-colors">
                    <h4 className="font-black text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.shortDescription}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => startEdit('service', s)} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded hover:bg-orange-200"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                      <button onClick={() => handleDelete('service', s.id, adminDeleteService)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* NEWS */}
          {tab === 'news' && (
            <ListView title="News & Events" subtitle="Manage articles, press releases and events"
              onAdd={() => startCreate('news', { slug: '', title: '', category: 'Blog', date: new Date().toISOString().split('T')[0], excerpt: '', content: '', imageUrl: '', author: 'Admin', featured: false })}
              addLabel="Add Article">
              <div className="space-y-3">
                {news.map(n => (
                  <div key={n.id} className="border border-slate-200 rounded-xl p-4 hover:border-rose-300 transition-colors flex gap-4">
                    <img src={n.imageUrl} alt={n.title} className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-full">{n.category}</span>
                        {n.featured && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Featured</span>}
                        <time className="text-xs text-slate-400 font-bold">{n.date}</time>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm truncate">{n.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{n.excerpt}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => startEdit('news', n)} className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded hover:bg-rose-200"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                        <button onClick={() => handleDelete('news', n.id, adminDeleteNews)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* TIMELINE */}
          {tab === 'timeline' && (
            <ListView title="Company Timeline" subtitle="Historical milestones"
              onAdd={() => startCreate('timeline', { year: new Date().getFullYear(), title: '', description: '' })}
              addLabel="Add Event">
              <div className="space-y-2">
                {timeline.sort((a, b) => a.year - b.year).map(t => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors flex items-start gap-4">
                    <div className="w-16 text-3xl font-black text-indigo-600">{t.year}</div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => startEdit('timeline', t)} className="p-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete('timeline', t.id, adminDeleteTimelineEvent)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* CAREERS */}
          {tab === 'careers' && (
            <ListView title="Job Openings" subtitle="Manage career opportunities"
              onAdd={() => startCreate('job', { title: '', department: 'Sales', location: '', type: 'Full-time', description: '', requirements: [], postedDate: new Date().toISOString().split('T')[0], status: 'Open' })}
              addLabel="Add Job">
              <div className="space-y-3">
                {jobs.map(j => (
                  <div key={j.id} className="border border-slate-200 rounded-xl p-4 hover:border-cyan-300 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-[10px] font-black uppercase tracking-widest rounded-full">{j.department}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">{j.type}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${j.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{j.status}</span>
                        </div>
                        <h4 className="font-black text-slate-900">{j.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">📍 {j.location} · Posted {j.postedDate}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => startEdit('job', j)} className="p-2 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete('job', j.id, adminDeleteJob)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* DISTRIBUTORS */}
          {tab === 'distributors' && (
            <ListView title="Distributors" subtitle="Regional distribution network"
              onAdd={() => startCreate('distributor', { name: '', region: 'West', contactPerson: '', designation: '', city: '', state: '', fullAddress: '', phone: '', email: '', authorizedProducts: [], status: 'Active' })}
              addLabel="Add Distributor">
              <div className="grid sm:grid-cols-2 gap-4">
                {distributors.map(d => (
                  <div key={d.id} className="border border-slate-200 rounded-xl p-4 hover:border-red-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-red-600">{d.region}</div>
                        <h4 className="font-black text-slate-900">{d.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${d.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{d.status}</span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Contact:</strong> {d.contactPerson}</p>
                      <p><strong>📍</strong> {d.city}, {d.state}</p>
                      <p><strong>📞</strong> {d.phone}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => startEdit('distributor', d)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Edit2 className="w-3 h-3 inline mr-1" />Edit</button>
                      <button onClick={() => handleDelete('distributor', d.id, adminDeleteDistributor)} className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </ListView>
          )}

          {/* LEADS */}
          {tab === 'leads' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-5 lg:p-7">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="text-2xl font-black text-slate-900">CRM Leads</h1>
                <p className="text-slate-500 text-sm">{leads.length} visible inquiries · {leads.filter(l => !['Won', 'Lost', 'Closed'].includes(l.status)).length} active pipeline items</p>
              </div>
              <div className="space-y-3">
                {leads.map(lead => (
                  <div key={lead.id} className={`rounded-2xl border-2 p-5 transition-all ${lead.status === 'New' ? 'border-green-400 bg-green-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex flex-col lg:flex-row gap-4 justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{lead.type}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                            lead.priority === 'Urgent' ? 'bg-red-600 text-white' :
                            lead.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            lead.priority === 'Low' ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
                          }`}>{lead.priority || 'Medium'}</span>
                          {lead.source && <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{lead.source}</span>}
                          {lead.industry && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full">{lead.industry}</span>}
                          <time className="text-xs text-slate-400 font-bold">{lead.leadNumber || lead.date}</time>
                        </div>
                        <h3 className="font-black text-slate-900">{lead.name} <span className="text-slate-500 font-bold text-sm">({lead.company})</span></h3>
                        <p className="text-xs text-slate-600 mt-0.5">{lead.email} · {lead.phone}</p>
                        {lead.productOfInterest && <p className="text-xs text-red-700 font-bold mt-1">Interested in: {lead.productOfInterest}</p>}
                        <p className="text-xs text-slate-500 mt-1">
                          Assigned to {users.find(u => u.id === lead.assignedUserId)?.displayName || lead.assignedTo || 'Unassigned'}
                          {lead.assignedDistributorId ? ` · ${distributors.find(d => d.id === lead.assignedDistributorId)?.name || 'Distributor #' + lead.assignedDistributorId}` : ''}
                          {lead.followUpDate ? ` · Follow-up ${lead.followUpDate}` : ''}
                        </p>
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 italic">"{lead.message}"</div>
                        <div className="mt-3">
                          <input type="text" defaultValue={lead.notes} onBlur={e => adminUpdateLead(lead.id, { notes: e.target.value }).then(() => notify('success', 'Notes saved'))}
                            placeholder="Internal notes..." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 outline-none text-xs font-medium" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 lg:w-56">
                        <select value={lead.status} onChange={e => adminUpdateLead(lead.id, { status: e.target.value as any }).then(loadAll)}
                          className={`px-3 py-2 rounded-lg font-black text-xs text-center cursor-pointer outline-none ${
                            lead.status === 'New' ? 'bg-green-500 text-white' :
                            ['Qualified', 'Quoted', 'Won'].includes(lead.status) ? 'bg-red-600 text-white' :
                            lead.status === 'Contacted' ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-800'
                          }`}>
                          {['New', 'Assigned', 'Contacted', 'Quoted', 'Qualified', 'Won', 'Lost', 'Closed'].map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <select value={lead.priority || 'Medium'} onChange={e => adminUpdateLead(lead.id, { priority: e.target.value as any }).then(loadAll)}
                          className="px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none">
                          {['Low', 'Medium', 'High', 'Urgent'].map(priority => <option key={priority} value={priority}>{priority}</option>)}
                        </select>
                        {canManageContent && (
                          <>
                            <select value={lead.assignedUserId || ''} onChange={e => adminUpdateLead(lead.id, { assignedUserId: e.target.value ? Number(e.target.value) : undefined, status: lead.status === 'New' ? 'Assigned' : lead.status }).then(loadAll)}
                              className="px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none">
                              <option value="">Assign user</option>
                              {users.filter(u => u.active).map(user => <option key={user.id} value={user.id}>{user.displayName || user.username}</option>)}
                            </select>
                            <select value={lead.assignedDistributorId || ''} onChange={e => adminUpdateLead(lead.id, { assignedDistributorId: e.target.value ? Number(e.target.value) : undefined, status: lead.status === 'New' ? 'Assigned' : lead.status }).then(loadAll)}
                              className="px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none">
                              <option value="">Assign distributor</option>
                              {distributors.filter(d => d.status === 'Active').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </>
                        )}
                        <input type="date" value={lead.followUpDate || ''} onChange={e => adminUpdateLead(lead.id, { followUpDate: e.target.value }).then(loadAll)}
                          className="px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs outline-none" />
                        <a href={`mailto:${lead.email}`} className="text-center px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs">Reply</a>
                        {canManageContent && <button onClick={() => handleDelete('lead', lead.id, adminDeleteLead)} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"><Trash2 className="w-3 h-3" />Delete</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-5 lg:p-7">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="text-2xl font-black text-slate-900">Site Settings</h1>
                <p className="text-slate-500 text-sm">Configure global website content</p>
              </div>

              <form onSubmit={async e => { e.preventDefault(); await adminUpdateSiteConfig(config!); notify('success', 'Settings saved'); loadAll(); }} className="space-y-6 max-w-3xl">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Company Info</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Company Name" value={config.company.name} onChange={(v: string) => setConfig({ ...config, company: { ...config.company, name: v } })} required />
                    <FormField label="Tagline" value={config.company.tagline} onChange={(v: string) => setConfig({ ...config, company: { ...config.company, tagline: v } })} required />
                    <FormField label="Founded Year" value={config.company.foundedYear} onChange={(v: number) => setConfig({ ...config, company: { ...config.company, foundedYear: v } })} type="number" />
                    <FormField label="Years of Excellence" value={config.company.yearsOfExcellence} onChange={(v: number) => setConfig({ ...config, company: { ...config.company, yearsOfExcellence: v } })} type="number" />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Hero Section</h3>
                  <FormField label="Hero Title" value={config.hero.title} onChange={(v: string) => setConfig({ ...config, hero: { ...config.hero, title: v } })} required />
                  <div className="mt-4">
                    <FormField label="Hero Subtitle" value={config.hero.subtitle} onChange={(v: string) => setConfig({ ...config, hero: { ...config.hero, subtitle: v } })} textarea required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <FormField label="Primary CTA" value={config.hero.cta} onChange={(v: string) => setConfig({ ...config, hero: { ...config.hero, cta: v } })} />
                    <FormField label="Secondary CTA" value={config.hero.secondaryCta} onChange={(v: string) => setConfig({ ...config, hero: { ...config.hero, secondaryCta: v } })} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">About</h3>
                  <FormField label="Short Story" value={config.about.storyShort} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, storyShort: v } })} textarea required />
                  <div className="mt-4">
                    <FormField label="Full Story" value={config.about.storyLong} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, storyLong: v } })} textarea required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <FormField label="Mission" value={config.about.mission} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, mission: v } })} textarea />
                    <FormField label="Vision" value={config.about.vision} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, vision: v } })} textarea />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Contact Info</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Factory Phone" value={config.contact.factoryPhone} onChange={(v: string) => setConfig({ ...config, contact: { ...config.contact, factoryPhone: v } })} required />
                    <FormField label="Sales Phone" value={config.contact.salesPhone} onChange={(v: string) => setConfig({ ...config, contact: { ...config.contact, salesPhone: v } })} required />
                    <FormField label="Email" value={config.contact.email} onChange={(v: string) => setConfig({ ...config, contact: { ...config.contact, email: v } })} required />
                    <FormField label="Headquarters Name" value={config.contact.headquarters.name} onChange={(v: string) => setConfig({ ...config, contact: { ...config.contact, headquarters: { ...config.contact.headquarters, name: v } } })} />
                    <div className="sm:col-span-2">
                      <FormField label="Headquarters Address" value={config.contact.headquarters.address} onChange={(v: string) => setConfig({ ...config, contact: { ...config.contact, headquarters: { ...config.contact.headquarters, address: v } } })} textarea />
                    </div>
                    <div className="sm:col-span-2">
                      <JsonArrayField label="Regional Offices" value={config.contact.regionalOffices} onChange={(value) => setConfig({ ...config, contact: { ...config.contact, regionalOffices: value as SiteConfig['contact']['regionalOffices'] } })} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Technical Information Page</h3>
                  <FormField label="Eyebrow" value={pageSettings.technical.eyebrow} onChange={(v: string) => updateInfoPage('technical', { eyebrow: v })} />
                  <div className="mt-4">
                    <FormField label="Title" value={pageSettings.technical.title} onChange={(v: string) => updateInfoPage('technical', { title: v })} textarea />
                  </div>
                  <div className="mt-4">
                    <FormField label="Intro" value={pageSettings.technical.intro} onChange={(v: string) => updateInfoPage('technical', { intro: v })} textarea />
                  </div>
                  <div className="mt-4">
                    <FormField label="Bullet Points" value={pageSettings.technical.points.join(', ')} onChange={(v: string) => updateInfoPage('technical', { points: v.split(',').map(x => x.trim()).filter(Boolean) })} textarea />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Warranty Page</h3>
                  <FormField label="Eyebrow" value={pageSettings.warranty.eyebrow} onChange={(v: string) => updateInfoPage('warranty', { eyebrow: v })} />
                  <div className="mt-4">
                    <FormField label="Title" value={pageSettings.warranty.title} onChange={(v: string) => updateInfoPage('warranty', { title: v })} textarea />
                  </div>
                  <div className="mt-4">
                    <FormField label="Intro" value={pageSettings.warranty.intro} onChange={(v: string) => updateInfoPage('warranty', { intro: v })} textarea />
                  </div>
                  <div className="mt-4">
                    <FormField label="Bullet Points" value={pageSettings.warranty.points.join(', ')} onChange={(v: string) => updateInfoPage('warranty', { points: v.split(',').map(x => x.trim()).filter(Boolean) })} textarea />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">Social Links</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="LinkedIn" value={config.social.linkedin || ''} onChange={(v: string) => setConfig({ ...config, social: { ...config.social, linkedin: v } })} />
                    <FormField label="Facebook" value={config.social.facebook || ''} onChange={(v: string) => setConfig({ ...config, social: { ...config.social, facebook: v } })} />
                    <FormField label="YouTube" value={config.social.youtube || ''} onChange={(v: string) => setConfig({ ...config, social: { ...config.social, youtube: v } })} />
                    <FormField label="Twitter" value={config.social.twitter || ''} onChange={(v: string) => setConfig({ ...config, social: { ...config.social, twitter: v } })} />
                  </div>
                </div>

                <button type="submit" className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-xl uppercase tracking-wider text-sm">Save All Settings</button>
              </form>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal title={`${editing.id ? 'Edit' : 'Create'} ${editType}`} onClose={() => { setEditing(null); setEditType(''); }} onSave={handleSave}>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(editing).filter(k => k !== 'id').map(key => {
              const val = editing[key];
              if (Array.isArray(val)) {
                if (val.some(item => typeof item === 'object' && item !== null)) {
                  return (
                    <div key={key} className="sm:col-span-2">
                      <JsonArrayField label={key} value={val} onChange={(nextValue) => setEditing({ ...editing, [key]: nextValue })} />
                    </div>
                  );
                }
                return (
                  <div key={key} className="sm:col-span-2">
                    <FormField label={key} value={val.join(', ')} onChange={(v: string) => setEditing({ ...editing, [key]: v.split(',').map(x => x.trim()).filter(Boolean) })} textarea />
                    <p className="text-[10px] text-slate-400 mt-1">Separate items with commas</p>
                  </div>
                );
              }
              if (typeof val === 'object' && val !== null) return null;
              if (typeof val === 'boolean') {
                return (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">{key}</label>
                    <select value={String(val)} onChange={e => setEditing({ ...editing, [key]: e.target.value === 'true' })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold">
                      <option value="true">Yes</option><option value="false">No</option>
                    </select>
                  </div>
                );
              }
              const isLong = typeof val === 'string' && (key.includes('description') || key.includes('content') || key.includes('Description'));
              const type = typeof val === 'number' ? 'number' : 'text';
              return <div key={key} className={isLong ? 'sm:col-span-2' : ''}><FormField label={key} value={val} onChange={(v: any) => setEditing({ ...editing, [key]: v })} type={type} textarea={isLong} /></div>;
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ListView({ title, subtitle, onAdd, addLabel, children }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-5 lg:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg text-sm hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" />{addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

// Inline missing icon
const FileText2 = FileText;
export { FileText2 };
