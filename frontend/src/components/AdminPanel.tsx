import { useState, useEffect } from 'react';
import { useSiteConfig } from '@/lib/siteConfig';
import { validateSiteConfig } from '@/lib/configValidation';
import {
  Plus, Trash2, X, LayoutDashboard, Package, FileText, LogOut, Building2, Users,
  CheckCircle2, AlertCircle, ChevronRight, Globe, Briefcase, Newspaper, Calendar,
  MapPin, Wrench, Edit2, Search, Bell, Megaphone, ShieldCheck, Images, Upload, Video, Layers,
} from 'lucide-react';
import type {
  Product, ProductCategory, Industry, Service, NewsArticle, TimelineEvent,
  JobOpening, Distributor, Lead, OfferAlert, SiteConfig, UserAccount, UserPayload, MediaAsset, CmsAudit, NavigationItem
} from '@/lib/data';
import { defaultPageContent } from '@/lib/pageContent';
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
  adminGetOffers, adminCreateOffer, adminUpdateOffer, adminDeleteOffer,
  adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, getCurrentUser,
  adminGetMedia, adminUploadMedia, adminDeleteMedia,
  getSiteConfig, adminUpdateSiteConfig, adminGetCmsAudit,
} from '@/lib/data';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onLogout: () => void;
  onNavigateFrontend: (page: string) => void;
}

export type Tab = 'dashboard' | 'users' | 'categories' | 'products' | 'brochures' | 'industries' | 'services' | 'news' | 'timeline' | 'careers' | 'offers' | 'distributors' | 'leads' | 'media' | 'settings';
export type AdminTab = Tab;

const adminProductSeries = [
  { key: 'fas-small', title: 'FAS Series', range: '4–11 kW', family: 'FAS', min: 4, max: 11 },
  { key: 'fas-large', title: 'FAS Series', range: '15–250 kW', family: 'FAS', min: 15, max: 250 },
  { key: 'fsl', title: 'FSL / FSLV Series', range: '30–220 kW · Low Pressure', family: 'FSL', min: 30, max: 220 },
  { key: 'fsg', title: 'FSG Series', range: '45–185 kW', family: 'FSG', min: 45, max: 185 },
  { key: 'fasm', title: 'FASM Series', range: '7.5-37 kW with Permanent Magnet motor and VFD', family: 'FASM', min: 7.5, max: 37 },
];

function productsInAdminSeries(products: Product[], series: typeof adminProductSeries[number]) {
  return products.filter(product => {
    const model = product.model.toUpperCase();
    const familyMatches = series.family === 'FAS'
      ? model.startsWith('FAS') && !model.startsWith('FASM')
      : model.startsWith(series.family);
    return familyMatches && product.powerKw >= series.min && product.powerKw <= series.max;
  }).sort((left, right) => left.powerKw - right.powerKw || left.model.localeCompare(right.model));
}

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

const JsonObjectField = ({ label, value, onChange }: { label: string; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }) => {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState('');
  const apply = () => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
      setError(''); onChange(parsed);
    } catch { setError('Enter a valid JSON object.'); }
  };
  return <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label><textarea rows={12} value={text} onChange={e => setText(e.target.value)} onBlur={apply} className={`w-full rounded-lg border px-3 py-2.5 font-mono text-xs outline-none ${error ? 'border-red-400' : 'border-slate-200 focus:border-red-500'}`} /><p className={`mt-1 text-[10px] ${error ? 'font-bold text-red-600' : 'text-slate-400'}`}>{error || 'Edit values only; keep field names unchanged. Changes apply after Save All Settings.'}</p></div>;
};

const MediaField = ({ label, value, kind = 'image', media, onChange, onUpload }: {
  label: string;
  value: string;
  kind?: 'image' | 'video' | 'document';
  media: MediaAsset[];
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<MediaAsset | undefined>;
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const choices = media.filter(asset => asset.mediaType === kind);

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const asset = await onUpload(file);
    if (asset) onChange(asset.url);
    setUploading(false);
  };

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">{label}</label>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex min-h-48 items-center justify-center bg-slate-100">
          {!value ? (
            <div className="text-center text-slate-400">{kind === 'video' ? <Video className="mx-auto h-10 w-10" /> : kind === 'document' ? <FileText className="mx-auto h-10 w-10" /> : <Images className="mx-auto h-10 w-10" />}<p className="mt-2 text-xs font-bold">No {kind} selected</p></div>
          ) : kind === 'video' ? (
            <video key={value} src={value} controls muted preload="metadata" className="max-h-64 w-full object-contain" />
          ) : kind === 'document' ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 p-8 text-red-700 hover:text-red-800"><FileText className="h-14 w-14" /><span className="text-sm font-black">Open selected PDF brochure</span></a>
          ) : (
            <img src={value} alt="Selected media preview" className="max-h-64 max-w-full object-contain p-3" />
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-white hover:bg-amber-600">
            <Upload className="h-3.5 w-3.5" />{uploading ? 'Uploading…' : `Upload ${kind}`}
            <input type="file" className="hidden" disabled={uploading} accept={kind === 'video' ? 'video/mp4,video/webm' : kind === 'document' ? 'application/pdf,.pdf' : 'image/jpeg,image/png,image/webp,image/svg+xml'} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} />
          </label>
          <button type="button" onClick={() => setShowLibrary(current => !current)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700"><Images className="h-3.5 w-3.5" />Choose from library</button>
          {value && <button type="button" onClick={() => onChange('')} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-200">Remove</button>}
        </div>
        {showLibrary && (
          <div className="border-t border-slate-200 bg-slate-50 p-3">
            <p className="mb-3 text-xs font-bold text-slate-600">Select an existing {kind}</p>
            {choices.length ? <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
              {choices.map(asset => (
                <button type="button" key={asset.id} onClick={() => { onChange(asset.url); setShowLibrary(false); }} className={`overflow-hidden rounded-lg border-2 bg-white text-left transition hover:border-amber-400 ${value === asset.url ? 'border-amber-500' : 'border-transparent'}`}>
                  <div className="flex h-24 items-center justify-center bg-slate-100">{kind === 'video' ? <video src={asset.url} muted preload="metadata" className="h-full w-full object-cover" /> : kind === 'document' ? <FileText className="h-10 w-10 text-red-600" /> : <img src={asset.url} alt={asset.altText || asset.fileName} className="h-full w-full object-contain p-1" />}</div>
                  <p className="truncate px-2 py-2 text-[10px] font-bold text-slate-700">{asset.fileName}</p>
                </button>
              ))}
            </div> : <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">No {kind}s in the library yet. Upload one above.</p>}
          </div>
        )}
      </div>
      <p className="mt-1 text-[10px] text-slate-400">Accepted: {kind === 'video' ? 'MP4 or WebM' : kind === 'document' ? 'PDF' : 'JPG, PNG, WebP or SVG'}. The database address is assigned automatically.</p>
    </div>
  );
};

const ManagedPageField = ({ page, value, media, onChange, onUpload }: {
  page: string;
  value: Record<string, unknown>;
  media: MediaAsset[];
  onChange: (value: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<MediaAsset | undefined>;
}) => {
  const mediaEntries = Object.entries(value).filter(([key]) => /(image|video)Url$/i.test(key));
  const textEntries = Object.fromEntries(Object.entries(value).filter(([key]) => !/(image|video)Url$/i.test(key)));
  return (
    <div className="space-y-4">
      {mediaEntries.map(([key, current]) => (
        <MediaField key={key} label={key.replace(/([A-Z])/g, ' $1')} value={String(current || '')} kind={/videoUrl$/i.test(key) ? 'video' : 'image'} media={media} onChange={next => onChange({ ...value, [key]: next })} onUpload={onUpload} />
      ))}
      <JsonObjectField label={`${page} text content`} value={textEntries} onChange={next => {
        const retainedMedia = Object.fromEntries(mediaEntries);
        onChange({ ...next, ...retainedMedia });
      }} />
    </div>
  );
};

const MediaUploadDialog = ({ onClose, onUpload }: {
  onClose: () => void;
  onUpload: (file: File, altText: string, usageType: string) => Promise<MediaAsset | undefined>;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [usageType, setUsageType] = useState('general');
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = (selected?: File) => {
    if (!selected) return;
    const accepted = selected.type.startsWith('image/') || selected.type === 'video/mp4' || selected.type === 'video/webm';
    if (!accepted) { setError('Select a JPG, PNG, WebP, SVG, MP4, or WebM file.'); return; }
    if (selected.size > 50 * 1024 * 1024) { setError('The maximum upload size is 50 MB.'); return; }
    setError('');
    setFile(selected);
    if (!altText) setAltText(selected.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
  };

  const submit = async () => {
    if (!file) { setError('Select an image or video before uploading.'); return; }
    setSubmitting(true);
    const saved = await onUpload(file, altText.trim(), usageType);
    setSubmitting(false);
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><h2 className="text-xl font-black text-slate-950">Upload Media</h2><p className="text-xs text-slate-500">Preview and confirm the file before saving it to the database.</p></div>
          <button type="button" disabled={submitting} onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-6">
          <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-amber-500 hover:bg-amber-50/40">
            {!previewUrl ? (
              <div className="p-8 text-center"><Upload className="mx-auto h-10 w-10 text-amber-500" /><p className="mt-3 text-sm font-black text-slate-800">Choose an image or video</p><p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP, SVG, MP4 or WebM · maximum 50 MB</p></div>
            ) : file?.type.startsWith('video/') ? (
              <video src={previewUrl} controls muted className="max-h-80 w-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Selected upload preview" className="max-h-80 max-w-full object-contain p-3" />
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm" className="hidden" disabled={submitting} onChange={event => { selectFile(event.target.files?.[0]); event.target.value = ''; }} />
          </label>

          {file && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs"><span className="max-w-[70%] truncate font-bold text-slate-700">{file.name}</span><span className="font-semibold text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Alt text / description" value={altText} onChange={setAltText} />
            <FormField label="Used for" value={usageType} onChange={setUsageType} options={['general', 'products', 'industries', 'services', 'news', 'home-hero', 'page-banner']} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" disabled={submitting} onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={!file || submitting} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"><Upload className="h-4 w-4" />{submitting ? 'Uploading…' : 'Upload & Save'}</button>
        </div>
      </div>
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
      'Catalog motor power range: 4 kW to 185 kW',
      'IE3 energy efficiency class motors',
      'IP55 protection and Class F insulation',
    ],
  },
  warranty: {
    eyebrow: 'Warranty Information',
    title: '5 year extended warranty support with genuine firstAir parts',
    intro: 'firstAir warranty support is designed around correct maintenance, genuine parts, and regular service practices that protect compressor reliability.',
    points: [
      '5 year extended warranty program for eligible compressors',
      'Use genuine firstAir parts during recommended service intervals',
      'Keep maintenance records for warranty support',
      'Contact the support team for service, parts, and warranty guidance',
    ],
  },
};

const defaultHomeSettings: NonNullable<SiteConfig['home']> = {
  heroVideoUrl: '/api/media/hero-industrial.mp4',
  heroShowcaseImageUrl: '/api/media/hero-products-showcase.png',
  heroShowcaseAlt: 'firstAir FASM22, FSG340, and FAS37 compressor range',
  heroEyebrow: 'Industrial compressed-air solutions',
  heroFeatures: ['Fixed & variable speed', 'IE3 / IE4 motors', 'Local service support'],
  powerRange: '4–250 kW', pressureRange: '5–16 bar',
  rangeTitle: 'Choose the right air system',
  rangeIntro: 'A focused range for constant demand, variable demand, and high-capacity industrial applications.',
  whyTitle: 'Built for productive, efficient operation',
  whyIntro: 'Straightforward equipment, practical service access, and support that keeps production moving.',
  industriesTitle: 'Compressed air that fits your application',
  industriesIntro: 'Start with your industry and find equipment suited to your operating needs.',
  serviceTitle: 'Support beyond the compressor',
  serviceIntro: 'From choosing capacity to planned maintenance and genuine parts, our team supports performance throughout the equipment lifecycle.',
  serviceCardTitle: 'Need service or technical help?',
  serviceCardText: 'Connect with our team for application advice, service support, and compressor enquiries.',
  aboutTitle: 'Industrial experience. Straightforward solutions.',
  ctaTitle: 'Let’s find the right compressor for your business.',
  ctaText: 'Share your required pressure, flow, and application with our team.',
  ctaButton: 'Request a consultation',
  heroMetricLabels: ['Compressor families', 'Power range', 'Pressure range'],
  showcaseEyebrow: 'FAS · FASM · FSG', showcaseTitle: 'Engineered for every demand',
  familyCards: [
    { series: 'FAS', label: 'Fixed speed', title: 'Fixed Speed Screw Compressors', description: 'Dependable, easy-to-maintain compressors for steady industrial air demand.' },
    { series: 'FASM', label: 'Variable speed', title: 'Variable Speed Compressors', description: 'Permanent-magnet variable-speed systems for changing demand and lower energy use.' },
    { series: 'FSG', label: 'High capacity', title: 'High-Capacity Compressors', description: 'Robust compressor packages for large plants and demanding applications.' },
  ],
  rangeEyebrow: 'Our compressor range', modelsLabel: 'models', viewSeriesLabel: 'View series', viewAllProductsLabel: 'See all compressors',
  whyEyebrow: 'Why firstAir',
  benefits: [
    { title: 'Energy efficient', description: 'Efficient motors and variable-speed options help reduce wasted power.' },
    { title: 'Reliable by design', description: 'Industrial components for demanding daily operating conditions.' },
    { title: 'Easy to maintain', description: 'Service-friendly layouts make maintenance more practical.' },
    { title: 'Local support', description: 'Guidance for selection, commissioning, service, and genuine parts.' },
  ],
  industriesEyebrow: 'Solutions by industry', industryLinkLabel: 'Explore solution', serviceEyebrow: 'Service throughout the lifecycle',
  serviceItems: ['Installation & Commissioning', 'Preventive Maintenance', 'Breakdown Support', 'Genuine Spare Parts', 'AMC', 'Energy Audit'],
  servicesButton: 'Our services', callSalesButton: 'Call sales', aboutEyebrow: 'About firstAir', yearsLabel: 'years of expertise',
  motorValue: 'IE3/IE4', motorLabel: 'motor technology', industryValue: 'Made for industry', industryText: 'Practical systems for workshops and production plants.',
  aboutButton: 'Learn about our company',
  solutionCards: [], energyEyebrow: 'Energy efficiency', energyTitle: 'Reduce Your Compressed Air Energy Costs',
  energyIntro: 'Compressed air can be one of the largest energy consumers in an industrial facility.', energyText: 'FirstAir provides energy-efficient compressor solutions designed to deliver reliable compressed air while helping industries reduce operating costs.',
  energyHighlights: ['Energy Efficiency', 'Variable Speed Technology', 'Permanent Magnet Technology', 'System Optimization'], energyCta: 'Request an Energy Assessment',
  recommendationEyebrow: 'Compressor selection support', recommendationTitle: 'Not Sure Which Compressor You Need?', recommendationText: 'Tell us about your compressed-air requirement and our technical team will help you identify the right solution.', recommendationButton: 'Get My Compressor Recommendation', recommendationSuccessTitle: 'Requirement received', recommendationSuccessText: 'Our technical team will contact you.',
  recommendationLabels: { name: 'Name', company: 'Company Name', phone: 'Mobile Number', email: 'Email', industry: 'Industry', industryPlaceholder: 'Select industry', requiredPressure: 'Required Pressure', requiredFad: 'Required FAD', operatingHours: 'Operating Hours/Day', currentCompressor: 'Current Compressor', application: 'Application', location: 'Location', requirementDetails: 'Requirement Details', submitting: 'Submitting…', submitAnother: 'Submit another requirement', error: 'We could not submit your requirement. Please try again.' },
  serviceSectionCta: 'Request Service Support', serviceCards: [], statistics: [], customerLogosEyebrow: 'Customer trust', customerLogosTitle: 'Trusted by Industries Across India', customerLogos: [], industriesLimit: 8,
};

const NavigationEditor = ({ items, onChange }: { items: NavigationItem[]; onChange: (items: NavigationItem[]) => void }) => {
  const update = (index: number, value: NavigationItem) => onChange(items.map((item, itemIndex) => itemIndex === index ? value : item));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; onChange(next);
  };
  const add = () => onChange([...items, { id: `menu-${Date.now()}`, label: 'New menu item', page: 'home', active: false }]);
  return <div className="sm:col-span-2">
    <div className="mb-3 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-wider text-slate-700">Ordered Navigation Items</label><button type="button" onClick={add} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white"><Plus className="inline h-3.5 w-3.5" /> Add item</button></div>
    <div className="space-y-3">{items.map((item, index) => <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Label" value={item.label} onChange={(label: string) => update(index, { ...item, label })} />
        <FormField label="Page key" value={item.page || ''} onChange={(page: string) => update(index, { ...item, page, url: page ? undefined : item.url })} />
        <FormField label="Parameter" value={item.param || ''} onChange={(param: string) => update(index, { ...item, param })} />
        <FormField label="URL" value={item.url || ''} onChange={(url: string) => update(index, { ...item, url, page: url ? undefined : item.page })} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
        <label><input type="checkbox" checked={item.active !== false} onChange={event => update(index, { ...item, active: event.target.checked })} className="mr-1.5" />Visible</label>
        <label><input type="checkbox" checked={Boolean(item.external)} onChange={event => update(index, { ...item, external: event.target.checked })} className="mr-1.5" />External link</label>
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded bg-white px-2 py-1 disabled:opacity-30">↑ Move</button>
        <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded bg-white px-2 py-1 disabled:opacity-30">↓ Move</button>
        <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="ml-auto rounded bg-red-100 px-2 py-1 text-red-700">Remove</button>
      </div>
      <div className="mt-3"><JsonArrayField label="Dropdown children" value={item.children || []} onChange={children => update(index, { ...item, children: children as NavigationItem[] })} /></div>
    </div>)}</div>
  </div>;
};

function toDateTimeLocal(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function offerFormValue(offer: Partial<OfferAlert>) {
  return { ...offer, startsAt: toDateTimeLocal(offer.startsAt), endsAt: toDateTimeLocal(offer.endsAt) };
}

function offerPayloadValue(offer: Record<string, any>): Omit<OfferAlert, 'id' | 'createdAt' | 'updatedAt'> {
  const startsAt = new Date(offer.startsAt);
  const endsAt = new Date(offer.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new Error('Offer end date/time must be after the start date/time');
  }
  return { ...offer, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() } as Omit<OfferAlert, 'id' | 'createdAt' | 'updatedAt'>;
}

function offerState(offer: OfferAlert) {
  const now = Date.now();
  if (!offer.active) return 'Paused';
  if (new Date(offer.endsAt).getTime() <= now) return 'Expired';
  if (new Date(offer.startsAt).getTime() > now) return 'Scheduled';
  return 'Live';
}

function formatOfferDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminPanel({ activeTab, onTabChange, onLogout, onNavigateFrontend }: Props) {
  const { refreshConfig } = useSiteConfig();
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
  const [offers, setOffers] = useState<OfferAlert[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [cmsAudit, setCmsAudit] = useState<CmsAudit | null>(null);

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
    if (canManageContent) setMedia(await adminGetMedia());

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
        const [c, p, i, s, n, j, d, l, audit, offerItems] = await Promise.all([
          adminGetCategories(), adminGetProducts(), adminGetIndustries(), adminGetServices(),
          adminGetNews(), adminGetJobs(), adminGetDistributors(), adminGetLeads(), adminGetCmsAudit(), adminGetOffers(),
        ]);
        setCategories(c); setProducts(p); setIndustries(i); setServices(s);
        setNews(n); setJobs(j); setDistributors(d); setLeads(l);
        setOffers(offerItems);
        setCmsAudit(audit);
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
        const [c, productItems] = await Promise.all([adminGetCategories(), adminGetProducts()]);
        setCategories(c); setProducts(productItems);
        break;
      }
      case 'industries':
        {
          const items = await adminGetIndustries();
          setIndustries(items);
        }
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
      case 'offers':
        setOffers(await adminGetOffers());
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
      case 'media':
        setMedia(await adminGetMedia());
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
      try {
        await fn(id);
        notify('success', `${type} deleted successfully`);
        loadAll();
      } catch (error) {
        const message = error instanceof Error && error.message.includes('currently used')
          ? 'This media is currently used. Replace it in the related content before deleting it.'
          : `Could not delete this ${type}`;
        notify('error', message);
      }
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
        case 'offer': {
          const offerData = offerPayloadValue(data);
          isNew ? await adminCreateOffer(offerData) : await adminUpdateOffer(editing.id, offerData);
          break;
        }
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

  const uploadMedia = async (file: File | undefined, usageType = 'admin-upload', altText?: string): Promise<MediaAsset | undefined> => {
    if (!file) return undefined;
    try {
      setUploadingMedia(true);
      const uploaded = await adminUploadMedia(file, altText || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), usageType);
      notify('success', 'Media uploaded to the database');
      setMedia(current => [...current, uploaded]);
      return uploaded;
    } catch {
      notify('error', 'Media upload failed');
      return undefined;
    } finally {
      setUploadingMedia(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-red-600', show: canManageContent },
    { id: 'users', label: 'Users & Roles', icon: Users, color: 'text-slate-700', show: canManageUsers },
    { id: 'products', label: 'Products', icon: Package, color: 'text-red-600', show: canManageContent },
    { id: 'categories', label: 'Product Categories', icon: Layers, color: 'text-amber-700', show: canManageContent },
    { id: 'brochures', label: 'Product Brochures', icon: FileText, color: 'text-red-600', show: canManageContent },
    { id: 'industries', label: 'Industries', icon: Building2, color: 'text-emerald-600', show: canManageContent },
    { id: 'services', label: 'Services', icon: Wrench, color: 'text-orange-600', show: canManageContent },
    { id: 'news', label: 'News & Events', icon: Newspaper, color: 'text-rose-600', show: canManageContent },
    { id: 'timeline', label: 'Company Timeline', icon: Calendar, color: 'text-indigo-600', show: canManageContent },
    { id: 'careers', label: 'Job Openings', icon: Briefcase, color: 'text-cyan-600', show: canManageContent },
    { id: 'offers', label: 'Offer Alerts', icon: Megaphone, color: 'text-red-600', show: canManageContent },
    { id: 'distributors', label: 'Distributors', icon: MapPin, color: 'text-red-600', show: true },
    { id: 'leads', label: 'CRM Leads', icon: Users, color: 'text-green-600', show: true },
    { id: 'media', label: 'Media Library', icon: Images, color: 'text-violet-600', show: canManageContent },
    { id: 'settings', label: 'Site Settings', icon: Globe, color: 'text-amber-600', show: canManageContent },
  ].filter(item => item.show);

  const stats = [
    { label: 'Products', count: products.length, tab: 'products' as Tab, icon: Package, color: 'from-red-500 to-red-700' },
    { label: 'Industries', count: industries.length, tab: 'industries' as Tab, icon: Building2, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Services', count: services.length, tab: 'services' as Tab, icon: Wrench, color: 'from-orange-500 to-orange-700' },
    { label: 'News Articles', count: news.length, tab: 'news' as Tab, icon: Newspaper, color: 'from-rose-500 to-rose-700' },
    { label: 'Job Openings', count: jobs.filter(j => j.status === 'Open').length, tab: 'careers' as Tab, icon: Briefcase, color: 'from-cyan-500 to-cyan-700' },
    { label: 'Offer Alerts', count: offers.length, tab: 'offers' as Tab, icon: Megaphone, color: 'from-red-500 to-red-700' },
    { label: 'Distributors', count: distributors.length, tab: 'distributors' as Tab, icon: MapPin, color: 'from-red-500 to-red-700' },
    { label: 'Open Leads', count: leads.filter(l => !['Won', 'Lost', 'Closed'].includes(l.status)).length, tab: 'leads' as Tab, icon: Users, color: 'from-green-500 to-green-700' },
  ];

  const pageSettings = {
    technical: { ...defaultPageSettings.technical, ...(config?.pages?.technical || {}) },
    warranty: { ...defaultPageSettings.warranty, ...(config?.pages?.warranty || {}) },
  };
  const homeSettings = { ...defaultHomeSettings, ...(config?.home || {}) };
  const navigationSettings = config?.navigation || {
    logoUrl: '', logoAlt: config?.company.name || 'firstAir Compressor', languageLabel: 'EN', menuLabel: 'Menu',
    loginLabel: 'Login', searchLabel: 'Search', callLabel: 'Call', requestQuoteLabel: 'Request Quote', requestQuotePage: 'contact', items: [],
  };
  const managedPageContent = Object.fromEntries(Object.entries(defaultPageContent).map(([key, defaults]) => [key, { ...defaults, ...(config?.pageContent?.[key] || {}) }]));

  const updateHome = (updates: Partial<NonNullable<SiteConfig['home']>>) => {
    if (!config) return;
    setConfig({ ...config, home: { ...homeSettings, ...updates } });
  };
  const updateNavigation = (updates: Partial<NonNullable<SiteConfig['navigation']>>) => {
    if (!config) return;
    setConfig({ ...config, navigation: { ...navigationSettings, ...updates } });
  };
  const updateManagedPage = (page: string, value: Record<string, unknown>) => {
    if (!config) return;
    setConfig({ ...config, pageContent: { ...(config.pageContent || {}), [page]: value } });
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
  const startEdit = (type: string, item: any) => { setEditing(type === 'offer' ? offerFormValue(item) : { ...item }); setEditType(type); };

  if (loading || !config) return (
    <div className="min-h-screen bg-[#fff8df] text-slate-900 lg:flex">
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
          <div className="h-36 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 animate-pulse" />
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
    <div className="admin-theme min-h-screen bg-[#fff8df] text-slate-900 lg:flex">
      {/* Sidebar */}
      <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-64 shrink-0 bg-white border-r border-slate-200 shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500 bg-[#f9b916] font-black text-slate-950 shadow-lg shadow-amber-900/15">FA</div>
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
                    isActive ? 'bg-[#f9b916] text-slate-950 shadow-lg shadow-amber-900/15' : 'text-slate-600 hover:bg-amber-50 hover:text-slate-950'
                  }`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-red-700' : 'text-slate-400'}`} />
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
            <button onClick={() => onNavigateFrontend('home')} className="flex items-center gap-2 rounded-md border border-amber-500 bg-[#f9b916] px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all hover:bg-amber-400">
              <Globe className="w-4 h-4" /><span className="hidden sm:inline">View Website</span>
            </button>
            <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-md bg-slate-50 text-slate-500 border border-slate-100">
              <Bell className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md">
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
                    <button key={b.label} onClick={() => onTabChange(b.tab)} className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white py-3 text-sm font-bold text-slate-800 transition-all hover:border-amber-400 hover:bg-amber-50">
                      <Plus className="w-4 h-4" />{b.label}
                    </button>
                  ))}
                </div>
              </div>

              {cmsAudit && <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="text-base font-black text-slate-950">CMS publishing health</h3><p className="mt-1 text-sm text-slate-500">Database-backed content visibility and media accessibility checks.</p></div>
                  <div className={`rounded-full px-3 py-1 text-xs font-black ${cmsAudit.mediaMissingAltText ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{cmsAudit.mediaMissingAltText} media missing ALT text</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-3"><div className="text-xl font-black text-slate-950">{cmsAudit.siteSections.filter(section => section.active).length}</div><div className="text-xs font-bold text-slate-500">Published site sections</div></div>
                  {Object.entries(cmsAudit.inactive).map(([collection, count]) => <div key={collection} className="rounded-lg bg-slate-50 p-3"><div className="text-xl font-black text-slate-950">{count}</div><div className="text-xs font-bold capitalize text-slate-500">Inactive {collection}</div></div>)}
                </div>
              </div>}
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
                          <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900">{user.role}</span>
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
            <ListView title="Product Categories" subtitle="Manage solution groups, ordering, visibility, media, and internal or external destinations"
              onAdd={() => startCreate('category', { slug: '', name: '', shortName: '', description: '', longDescription: '', icon: 'Cog', imageUrl: '', external: false, externalUrl: '', features: [], applications: [], active: true, order: categories.length + 1 })}
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
            <ListView title="Products" subtitle={`${products.length} compressor models grouped by frontend series`}
              onAdd={() => startCreate('product', { categoryId: categories[0]?.id || '', categorySlugs: [], model: '', name: '', series: 'FAS', description: '', longDescription: '', imageUrl: '', imageUrls: [], brochureUrl: '', datasheetUrl: '', powerHp: 0, powerKw: 0, motorPower: '', pressureMin: 7, pressureMax: 13, flowRateCfm: '', flowRateM3Min: '', motorType: '', coolingMethod: '', voltage: '', frequency: '', noiseLevel: '', dimensions: '', weight: '', features: [], benefits: [], specifications: [], applications: [], active: true })}
              addLabel="Add Product">
              <div className="space-y-9">
                {adminProductSeries.map(series => {
                  const seriesProducts = productsInAdminSeries(products, series);
                  return (
                    <section key={series.key}>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-100 via-amber-50 to-white px-5 py-4 shadow-sm">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Product series</p>
                          <h2 className="mt-1 text-xl font-black text-slate-950">{series.title}</h2>
                          <p className="text-xs font-bold text-slate-600">{series.range}</p>
                        </div>
                        <span className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm">
                          {seriesProducts.length} {seriesProducts.length === 1 ? 'model' : 'models'}
                        </span>
                      </div>

                      {seriesProducts.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {seriesProducts.map(product => (
                            <article key={product.id} className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-md">
                              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 p-2">
                                <img src={product.imageUrl} alt={product.model} className="max-h-full max-w-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="font-black text-slate-950">{product.model}</h3>
                                    <p className="truncate text-xs text-slate-500">{product.name}</p>
                                  </div>
                                  <span className="shrink-0 rounded bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">{product.powerKw} kW</span>
                                </div>
                                <p className="mt-2 text-xs font-bold text-slate-700">{product.powerHp} HP · {product.pressureMin}–{product.pressureMax} bar</p>
                                <p className="mt-1 truncate text-[11px] text-slate-500">{product.flowRateCfm || 'Flow rate not set'} CFM</p>
                                <div className="mt-3 flex gap-2">
                                  <button onClick={() => startEdit('product', product)} className="inline-flex items-center rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200"><Edit2 className="mr-1 h-3 w-3" />Edit</button>
                                  <button onClick={() => handleDelete('product', product.id, adminDeleteProduct)} className="rounded bg-red-100 p-1.5 text-red-700 hover:bg-red-200" aria-label={`Delete ${product.model}`}><Trash2 className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                          No models have been added to this series yet.
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </ListView>
          )}

          {/* INDUSTRIES */}
          {tab === 'industries' && (
            <ListView title="Industries" subtitle="Industry-specific solutions"
              onAdd={() => startCreate('industry', { slug: '', name: '', shortDescription: '', fullDescription: '', imageUrl: '', imageAlt: '', challengeIntro: '', solutionIntro: '', applications: [], benefits: [], recommendedProducts: [], challenges: [], order: industries.length + 1, active: true })}
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
              onAdd={() => startCreate('service', { slug: '', name: '', shortDescription: '', fullDescription: '', serviceScope: '', iconName: 'Wrench', imageUrl: '', imageAlt: '', benefits: [], process: [], order: services.length + 1, active: true })}
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

          {/* OFFER ALERTS */}
          {tab === 'offers' && (
            <ListView title="Offer Alerts" subtitle="Schedule a flashing offer banner with content, an image, and an active date/time window"
              onAdd={() => {
                const start = new Date();
                const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
                start.setSeconds(0, 0); end.setSeconds(0, 0);
                startCreate('offer', {
                  title: '', message: '', content: '', imageUrl: '',
                  startsAt: toDateTimeLocal(start.toISOString()), endsAt: toDateTimeLocal(end.toISOString()), active: true,
                });
              }}
              addLabel="Add Offer Alert">
              <div className="space-y-4">
                {offers.length ? offers.map(offer => {
                  const state = offerState(offer);
                  const stateClass = state === 'Live' ? 'bg-green-100 text-green-700' : state === 'Scheduled' ? 'bg-amber-100 text-amber-800' : state === 'Paused' ? 'bg-slate-200 text-slate-600' : 'bg-red-100 text-red-700';
                  return (
                    <article key={offer.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-red-300 hover:shadow-md md:flex-row">
                      {offer.imageUrl ? <img src={offer.imageUrl} alt="" className="h-28 w-full rounded-lg bg-slate-100 object-cover md:w-44" /> : <div className="flex h-28 w-full items-center justify-center rounded-lg bg-red-50 text-red-600 md:w-44"><Megaphone className="h-9 w-9" /></div>}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${stateClass}`}>{state}</span>
                          {!offer.active && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">Hidden</span>}
                        </div>
                        <h3 className="mt-2 text-lg font-black text-slate-950">{offer.title || 'Untitled offer'}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{offer.message}</p>
                        {offer.content && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{offer.content}</p>}
                        <p className="mt-3 text-[11px] font-bold text-slate-400">{formatOfferDate(offer.startsAt)} → {formatOfferDate(offer.endsAt)}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => startEdit('offer', offer)} className="rounded bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200"><Edit2 className="mr-1 inline h-3 w-3" />Edit</button>
                          <button onClick={() => handleDelete('offer alert', offer.id, adminDeleteOffer)} className="rounded bg-red-100 p-1.5 text-red-700 hover:bg-red-200" aria-label={`Delete ${offer.title}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </article>
                  );
                }) : <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><Megaphone className="mx-auto h-12 w-12 text-slate-300" /><h2 className="mt-4 font-black text-slate-800">No offer alerts created</h2><p className="mt-2 text-sm text-slate-500">Create an offer and set its start and end date/time. It will appear publicly only during that window.</p></div>}
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
                        {(lead.requiredPressure || lead.existingWorkingPressure || lead.requiredFad || lead.existingFad || lead.existingInstallationMake || lead.existingCompressorPower || lead.application || lead.location || lead.state) && <div className="mt-3 grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                          <div><b>Required pressure:</b> {lead.requiredPressure || 'Not provided'}</div><div><b>Existing working pressure:</b> {lead.existingWorkingPressure || 'Not provided'}</div><div><b>Required FAD:</b> {lead.requiredFad || 'Not provided'}</div><div><b>Existing FAD:</b> {lead.existingFad || 'Not provided'}</div><div><b>Existing installation:</b> {lead.existingInstallationMake || 'Not provided'}</div><div><b>Operating hours/day:</b> {lead.operatingHours || 'Not provided'}</div>
                          <div><b>Existing compressor power:</b> {lead.existingCompressorPower || lead.currentCompressor || 'Not provided'}</div><div><b>Application:</b> {lead.application || 'Not provided'}</div><div><b>City:</b> {lead.location || 'Not provided'}</div><div><b>State:</b> {lead.state || 'Not provided'}</div>
                          {lead.requirementDetails && <div className="sm:col-span-2 lg:col-span-3"><b>Requirement:</b> {lead.requirementDetails}</div>}
                        </div>}
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
                        <a href={`mailto:${lead.email}`} className="rounded-lg border border-amber-500 bg-[#f9b916] px-3 py-2 text-center text-xs font-bold text-slate-950 hover:bg-amber-400">Reply</a>
                        {canManageContent && <button onClick={() => handleDelete('lead', lead.id, adminDeleteLead)} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"><Trash2 className="w-3 h-3" />Delete</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCT BROCHURES */}
          {tab === 'brochures' && (() => {
            const brochures = media.filter(asset => asset.mediaType === 'document' && asset.contentType === 'application/pdf');
            return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div><h1 className="text-2xl font-black text-slate-900">Product Brochures</h1><p className="mt-1 text-sm text-slate-500">Upload each PDF once, then assign it to any number of products from the product editor.</p></div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-red-700">
                  <Upload className="h-4 w-4" />{uploadingMedia ? 'Uploading…' : 'Upload PDF Brochure'}
                  <input type="file" accept="application/pdf,.pdf" disabled={uploadingMedia} className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, 'product-brochures'); event.target.value = ''; }} />
                </label>
              </div>
              {brochures.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{brochures.map(brochure => {
                const assigned = products.filter(product => product.brochureUrl === brochure.url);
                return <article key={brochure.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-amber-400 hover:shadow-md">
                  <a href={brochure.url} target="_blank" rel="noopener noreferrer" className="flex h-40 flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-50 to-amber-50 text-red-700"><FileText className="h-14 w-14" /><span className="text-xs font-black uppercase tracking-wider">View PDF</span></a>
                  <div className="p-5"><h2 className="truncate text-base font-black text-slate-900">{brochure.altText || brochure.fileName}</h2><p className="mt-1 truncate text-xs text-slate-500">{brochure.fileName} · {(brochure.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                    <div className="mt-4 border-t border-slate-100 pt-4"><div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Assigned products ({assigned.length})</div>{assigned.length ? <div className="mt-2 flex flex-wrap gap-1.5">{assigned.map(product => <span key={product.id} className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-900">{product.model}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">Not assigned yet</p>}</div>
                    <div className="mt-5 flex gap-2"><a href={brochure.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700">Open PDF</a><button disabled={assigned.length > 0} onClick={() => handleDelete('brochure', brochure.id, adminDeleteMedia)} title={assigned.length ? 'Remove brochure assignments from products before deleting' : 'Delete brochure'} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40">Delete</button></div>
                  </div>
                </article>;
              })}</div> : <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><FileText className="mx-auto h-12 w-12 text-slate-300" /><h2 className="mt-4 font-black text-slate-800">No brochures uploaded</h2><p className="mt-2 text-sm text-slate-500">Upload a PDF to make it available in every product form.</p></div>}
            </div>;
          })()}

          {/* MEDIA LIBRARY */}
          {tab === 'media' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Media Library</h1>
                  <p className="text-sm text-slate-500">Images and videos stored in the database and available across the website.</p>
                </div>
                <button type="button" onClick={() => setShowMediaUpload(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg hover:from-amber-400 hover:to-orange-400">
                  <Upload className="h-4 w-4" />{uploadingMedia ? 'Uploading…' : 'Upload Media'}
                </button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {media.filter(asset => asset.mediaType !== 'document').map(asset => (
                  <article key={asset.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-amber-400 hover:shadow-md">
                    <div className="flex h-48 items-center justify-center bg-slate-100">
                      {asset.mediaType === 'video' ? (
                        <video src={asset.url} muted controls preload="metadata" className="h-full w-full object-cover" />
                      ) : asset.mediaType === 'document' ? (
                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="flex h-full w-full flex-col items-center justify-center gap-2 text-red-700"><FileText className="h-14 w-14" /><span className="text-xs font-black">Open PDF</span></a>
                      ) : (
                        <img src={asset.url} alt={asset.altText || asset.fileName} loading="lazy" className="h-full w-full object-contain p-2" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-black text-slate-900">{asset.fileName}</h2>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{asset.usageType} · {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {asset.mediaType === 'video' ? <Video className="h-5 w-5 shrink-0 text-violet-600" /> : asset.mediaType === 'document' ? <FileText className="h-5 w-5 shrink-0 text-red-600" /> : <Images className="h-5 w-5 shrink-0 text-amber-600" />}
                      </div>
                      <p className="mt-3 truncate rounded bg-slate-50 px-2 py-1.5 font-mono text-[10px] text-slate-600">{asset.url}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(asset.url).then(() => notify('success', 'Media URL copied'))} className="rounded bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">Copy URL</button>
                        <button onClick={() => handleDelete('media item', asset.id, adminDeleteMedia)} className="rounded bg-red-100 p-1.5 text-red-700 hover:bg-red-200" aria-label={`Delete ${asset.fileName}`}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-5 lg:p-7">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="text-2xl font-black text-slate-900">Homepage &amp; Site Content</h1>
                <p className="text-slate-500 text-sm">Edit the current landing page, company information, contact details, and support pages</p>
              </div>

              <form onSubmit={async e => {
                e.preventDefault();
                try {
                  validateSiteConfig(config);
                  await adminUpdateSiteConfig(config!);
                  notify('success', 'Settings saved');
                  await loadAll();
                  refreshConfig();
                } catch {
                  notify('error', 'Settings could not be saved. Check the content fields and your connection, then try again.');
                }
              }} className="space-y-6 max-w-3xl">
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
                  <h3 className="font-black text-slate-900">Homepage Content</h3>
                  <p className="mb-4 mt-1 text-xs text-slate-500">Controls the live sections of the redesigned landing page.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MediaField label="Hero Background Video" value={homeSettings.heroVideoUrl} kind="video" media={media} onChange={(value) => updateHome({ heroVideoUrl: value })} onUpload={(file) => uploadMedia(file, 'home-hero')} />
                    <MediaField label="Hero Product Image" value={homeSettings.heroShowcaseImageUrl} media={media} onChange={(value) => updateHome({ heroShowcaseImageUrl: value })} onUpload={(file) => uploadMedia(file, 'home-hero')} />
                    <div className="sm:col-span-2"><FormField label="Hero Product Image Alt Text" value={homeSettings.heroShowcaseAlt} onChange={(v: string) => updateHome({ heroShowcaseAlt: v })} /></div>
                    <FormField label="Hero Eyebrow" value={homeSettings.heroEyebrow} onChange={(v: string) => updateHome({ heroEyebrow: v })} />
                    <FormField label="Hero Feature Labels" value={homeSettings.heroFeatures.join(', ')} onChange={(v: string) => updateHome({ heroFeatures: v.split(',').map(x => x.trim()).filter(Boolean) })} />
                    <FormField label="Power Range" value={homeSettings.powerRange} onChange={(v: string) => updateHome({ powerRange: v })} />
                    <FormField label="Pressure Range" value={homeSettings.pressureRange} onChange={(v: string) => updateHome({ pressureRange: v })} />
                    <FormField label="Product Range Heading" value={homeSettings.rangeTitle} onChange={(v: string) => updateHome({ rangeTitle: v })} />
                    <FormField label="Why firstAir Heading" value={homeSettings.whyTitle} onChange={(v: string) => updateHome({ whyTitle: v })} />
                    <div className="sm:col-span-2"><FormField label="Product Range Introduction" value={homeSettings.rangeIntro} onChange={(v: string) => updateHome({ rangeIntro: v })} textarea /></div>
                    <div className="sm:col-span-2"><FormField label="Why firstAir Introduction" value={homeSettings.whyIntro} onChange={(v: string) => updateHome({ whyIntro: v })} textarea /></div>
                    <FormField label="Industries Heading" value={homeSettings.industriesTitle} onChange={(v: string) => updateHome({ industriesTitle: v })} />
                    <FormField label="Service Heading" value={homeSettings.serviceTitle} onChange={(v: string) => updateHome({ serviceTitle: v })} />
                    <div className="sm:col-span-2"><FormField label="Industries Introduction" value={homeSettings.industriesIntro} onChange={(v: string) => updateHome({ industriesIntro: v })} textarea /></div>
                    <div className="sm:col-span-2"><FormField label="Service Introduction" value={homeSettings.serviceIntro} onChange={(v: string) => updateHome({ serviceIntro: v })} textarea /></div>
                    <FormField label="Service Card Heading" value={homeSettings.serviceCardTitle} onChange={(v: string) => updateHome({ serviceCardTitle: v })} />
                    <FormField label="About Heading" value={homeSettings.aboutTitle} onChange={(v: string) => updateHome({ aboutTitle: v })} />
                    <div className="sm:col-span-2"><FormField label="Service Card Text" value={homeSettings.serviceCardText} onChange={(v: string) => updateHome({ serviceCardText: v })} textarea /></div>
                    <FormField label="Final CTA Heading" value={homeSettings.ctaTitle} onChange={(v: string) => updateHome({ ctaTitle: v })} />
                    <FormField label="Final CTA Button" value={homeSettings.ctaButton} onChange={(v: string) => updateHome({ ctaButton: v })} />
                    <div className="sm:col-span-2"><FormField label="Final CTA Text" value={homeSettings.ctaText} onChange={(v: string) => updateHome({ ctaText: v })} textarea /></div>
                    <div className="sm:col-span-2"><JsonArrayField label="Product Solution Cards" value={homeSettings.solutionCards} onChange={solutionCards => updateHome({ solutionCards: solutionCards as typeof homeSettings.solutionCards })} /></div>
                    <FormField label="Energy Eyebrow" value={homeSettings.energyEyebrow} onChange={(energyEyebrow: string) => updateHome({ energyEyebrow })} />
                    <FormField label="Energy Heading" value={homeSettings.energyTitle} onChange={(energyTitle: string) => updateHome({ energyTitle })} />
                    <div className="sm:col-span-2"><FormField label="Energy Introduction" value={homeSettings.energyIntro} onChange={(energyIntro: string) => updateHome({ energyIntro })} textarea /></div>
                    <div className="sm:col-span-2"><FormField label="Energy Supporting Text" value={homeSettings.energyText} onChange={(energyText: string) => updateHome({ energyText })} textarea /></div>
                    <FormField label="Energy Highlights" value={homeSettings.energyHighlights.join(', ')} onChange={(value: string) => updateHome({ energyHighlights: value.split(',').map(item => item.trim()).filter(Boolean) })} />
                    <FormField label="Energy CTA" value={homeSettings.energyCta} onChange={(energyCta: string) => updateHome({ energyCta })} />
                    <FormField label="Recommendation Eyebrow" value={homeSettings.recommendationEyebrow} onChange={(recommendationEyebrow: string) => updateHome({ recommendationEyebrow })} />
                    <FormField label="Recommendation Heading" value={homeSettings.recommendationTitle} onChange={(recommendationTitle: string) => updateHome({ recommendationTitle })} />
                    <div className="sm:col-span-2"><FormField label="Recommendation Text" value={homeSettings.recommendationText} onChange={(recommendationText: string) => updateHome({ recommendationText })} textarea /></div>
                    <FormField label="Recommendation Button" value={homeSettings.recommendationButton} onChange={(recommendationButton: string) => updateHome({ recommendationButton })} />
                    <FormField label="Recommendation Success Heading" value={homeSettings.recommendationSuccessTitle} onChange={(recommendationSuccessTitle: string) => updateHome({ recommendationSuccessTitle })} />
                    <div className="sm:col-span-2"><FormField label="Recommendation Success Text" value={homeSettings.recommendationSuccessText} onChange={(recommendationSuccessText: string) => updateHome({ recommendationSuccessText })} textarea /></div>
                    <div className="sm:col-span-2"><JsonObjectField label="Recommendation Form Labels" value={homeSettings.recommendationLabels} onChange={recommendationLabels => updateHome({ recommendationLabels: recommendationLabels as Record<string, string> })} /></div>
                    <FormField label="Service Support CTA" value={homeSettings.serviceSectionCta} onChange={(serviceSectionCta: string) => updateHome({ serviceSectionCta })} />
                    <div className="sm:col-span-2"><JsonArrayField label="Service & Support Cards" value={homeSettings.serviceCards} onChange={serviceCards => updateHome({ serviceCards: serviceCards as typeof homeSettings.serviceCards })} /></div>
                    <FormField label="Industries Shown" value={homeSettings.industriesLimit} onChange={(industriesLimit: number) => updateHome({ industriesLimit })} type="number" />
                    <div className="sm:col-span-2"><JsonArrayField label="Verified Company Statistics" value={homeSettings.statistics} onChange={statistics => updateHome({ statistics: statistics as typeof homeSettings.statistics })} /></div>
                    <FormField label="Customer Logos Eyebrow" value={homeSettings.customerLogosEyebrow} onChange={(customerLogosEyebrow: string) => updateHome({ customerLogosEyebrow })} />
                    <FormField label="Customer Logos Heading" value={homeSettings.customerLogosTitle} onChange={(customerLogosTitle: string) => updateHome({ customerLogosTitle })} />
                    <div className="sm:col-span-2"><JsonArrayField label="Approved Customer Logos" value={homeSettings.customerLogos} onChange={customerLogos => updateHome({ customerLogos: customerLogos as typeof homeSettings.customerLogos })} /></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-black text-slate-900">Frontend Page Content</h3>
                  <p className="mb-5 mt-1 text-xs leading-5 text-slate-500">These fields mirror the current frontend labels, headings, supporting text, image paths, and button text. Database overrides preserve the existing frontend layout and styling.</p>
                  <div className="space-y-6">
                    {Object.entries(managedPageContent).map(([page, value]) => <details key={page} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black capitalize text-slate-900">{page.replace(/([A-Z])/g, ' $1')}</summary><div className="mt-4"><ManagedPageField page={page} value={value} media={media} onChange={next => updateManagedPage(page, next)} onUpload={(file) => uploadMedia(file, `${page}-page`)} /></div></details>)}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-black text-slate-900">Header &amp; Navigation</h3>
                  <p className="mb-4 mt-1 text-xs text-slate-500">Controls the public logo, header actions, ordered menu hierarchy, visibility, and link destinations.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MediaField label="Header Logo" value={navigationSettings.logoUrl} media={media} onChange={logoUrl => updateNavigation({ logoUrl })} onUpload={file => uploadMedia(file, 'site-logo')} />
                    <div className="sm:col-span-2"><FormField label="Logo Alt Text" value={navigationSettings.logoAlt} onChange={(logoAlt: string) => updateNavigation({ logoAlt })} required /></div>
                    <FormField label="Language Label" value={navigationSettings.languageLabel} onChange={(languageLabel: string) => updateNavigation({ languageLabel })} />
                    <FormField label="Menu Label" value={navigationSettings.menuLabel} onChange={(menuLabel: string) => updateNavigation({ menuLabel })} />
                    <FormField label="Login Label" value={navigationSettings.loginLabel} onChange={(loginLabel: string) => updateNavigation({ loginLabel })} />
                    <FormField label="Search Label" value={navigationSettings.searchLabel} onChange={(searchLabel: string) => updateNavigation({ searchLabel })} />
                    <FormField label="Mobile Call Label" value={navigationSettings.callLabel} onChange={(callLabel: string) => updateNavigation({ callLabel })} />
                    <FormField label="Request Quote Label" value={navigationSettings.requestQuoteLabel} onChange={(requestQuoteLabel: string) => updateNavigation({ requestQuoteLabel })} />
                    <FormField label="Request Quote Page Key" value={navigationSettings.requestQuotePage} onChange={(requestQuotePage: string) => updateNavigation({ requestQuotePage })} />
                    <NavigationEditor items={navigationSettings.items} onChange={items => updateNavigation({ items })} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-black text-slate-900">Public Website Content</h3>
                  <p className="mb-4 mt-1 text-xs text-slate-500">Manage hero slides, FAQs, series comparisons, technical checklists, brochure links and footer branding. Empty lists hide those entries. Use URLs from the media library for images and documents.</p>
                  <JsonObjectField label="Public content" value={config.publicContent as unknown as Record<string, unknown>} onChange={publicContent => setConfig({ ...config, publicContent: publicContent as unknown as SiteConfig['publicContent'] })} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-black text-slate-900">SEO Metadata</h3>
                  <p className="mb-4 mt-1 text-xs text-slate-500">Manage route-level titles, descriptions, keywords, social images, canonical paths, and indexing status.</p>
                  <JsonObjectField label="SEO routes" value={config.seo || {}} onChange={seo => setConfig({ ...config, seo: seo as NonNullable<SiteConfig['seo']> })} />
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-black text-slate-900 mb-4">About</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Hero Eyebrow" value={config.about.heroEyebrow || ''} onChange={(heroEyebrow: string) => setConfig({ ...config, about: { ...config.about, heroEyebrow } })} />
                    <FormField label="Hero Title" value={config.about.heroTitle || ''} onChange={(heroTitle: string) => setConfig({ ...config, about: { ...config.about, heroTitle } })} />
                    <div className="sm:col-span-2"><FormField label="Hero Introduction" value={config.about.heroIntro || ''} onChange={(heroIntro: string) => setConfig({ ...config, about: { ...config.about, heroIntro } })} textarea /></div>
                    <MediaField label="Hero Image" value={config.about.heroImageUrl || ''} kind="image" media={media} onChange={heroImageUrl => setConfig({ ...config, about: { ...config.about, heroImageUrl } })} onUpload={file => uploadMedia(file, 'about-hero')} />
                    <FormField label="Hero Image ALT Text" value={config.about.heroImageAlt || ''} onChange={(heroImageAlt: string) => setConfig({ ...config, about: { ...config.about, heroImageAlt } })} />
                  </div>
                  <FormField label="Short Story" value={config.about.storyShort} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, storyShort: v } })} textarea required />
                  <div className="mt-4">
                    <FormField label="Full Story" value={config.about.storyLong} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, storyLong: v } })} textarea required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <FormField label="Mission" value={config.about.mission} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, mission: v } })} textarea />
                    <FormField label="Vision" value={config.about.vision} onChange={(v: string) => setConfig({ ...config, about: { ...config.about, vision: v } })} textarea />
                  </div>
                  <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                    <JsonArrayField label="About Highlights" value={config.about.highlights || []} onChange={highlights => setConfig({ ...config, about: { ...config.about, highlights: highlights as NonNullable<SiteConfig['about']['highlights']> } })} />
                    <JsonArrayField label="Verified Company Statistics" value={config.about.statistics || []} onChange={statistics => setConfig({ ...config, about: { ...config.about, statistics: statistics as NonNullable<SiteConfig['about']['statistics']> } })} />
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
                    <FormField label="Instagram" value={config.social.instagram || ''} onChange={(v: string) => setConfig({ ...config, social: { ...config.social, instagram: v } })} />
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
              if (/(image|video|brochure)Url$/i.test(key)) {
                const kind = /videoUrl$/i.test(key) ? 'video' : /brochureUrl$/i.test(key) ? 'document' : 'image';
                return <MediaField key={key} label={key.replace(/([A-Z])/g, ' $1')} value={String(val || '')} kind={kind} media={media} onChange={next => setEditing({ ...editing, [key]: next })} onUpload={(file) => uploadMedia(file, kind === 'document' ? 'product-brochures' : editType || 'content')} />;
              }
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
              const isLong = typeof val === 'string' && (key.includes('description') || key.includes('content') || key.includes('Description') || (editType === 'offer' && key === 'message'));
              const type = typeof val === 'number' ? 'number' : editType === 'offer' && /At$/i.test(key) ? 'datetime-local' : 'text';
              const required = editType === 'offer' && ['title', 'message', 'startsAt', 'endsAt'].includes(key);
              return <div key={key} className={isLong ? 'sm:col-span-2' : ''}><FormField label={key} value={val} onChange={(v: any) => setEditing({ ...editing, [key]: v })} type={type} textarea={isLong} required={required} /></div>;
            })}
          </div>
        </Modal>
      )}
      {showMediaUpload && <MediaUploadDialog onClose={() => setShowMediaUpload(false)} onUpload={(file, altText, usageType) => uploadMedia(file, usageType, altText)} />}
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
