import { useEffect, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Download, Gauge, Phone, Settings2, ShieldCheck, X } from 'lucide-react';
import type { Product } from '@/lib/data';
import { getProductById, getProducts, submitLead } from '@/lib/data';
import { bestFor, buyerDescription, maintenanceNotes, optionalAccessories, pressureLabel, similarProducts } from '@/lib/productGuidance';
import CompressorIcon from '@/components/CompressorIcon';

interface Props {
  productId: string;
  onNavigate: (page: string, param?: string) => void;
  onContact: (product: string) => void;
}

export default function ProductDetailPage({ productId, onNavigate, onContact }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);
  const [downloadForm, setDownloadForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    Promise.all([getProductById(productId), getProducts()]).then(([p, allProducts]) => {
      setProduct(p || null);
      setProducts(allProducts);
      setLoading(false);
    });
  }, [productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Product not found.</p></div>;

  const pressure = pressureLabel(product);
  const visibleFeatures = product.features.filter(feature => !/dimension|height|width|length|weight/i.test(feature));
  const brochureUrl = product.brochureUrl || '/catalogs/FAS-15-250KW.pdf';
  const similar = similarProducts(product, products);

  const handleDownloadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDownloadSubmitting(true);
    const downloadWindow = window.open('', '_blank');
    try {
      await submitLead({
        name: downloadForm.name,
        email: downloadForm.email,
        phone: downloadForm.phone,
        company: '',
        type: 'General Inquiry',
        source: 'Brochure Download',
        productOfInterest: product.model,
        message: `Catalog download request for ${product.model}. Brochure: ${brochureUrl}`,
      });
      if (downloadWindow) downloadWindow.location.href = brochureUrl;
      else window.location.href = brochureUrl;
      setDownloadOpen(false);
      setDownloadForm({ name: '', email: '', phone: '' });
    } finally {
      setDownloadSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-red-100 bg-white">
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-5">
          <button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-red-700 hover:text-red-800 text-sm font-black uppercase tracking-wide">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </button>
        </div>
      </div>

      <section className="max-w-[1180px] mx-auto px-5 lg:px-8 py-14">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-start">
          <div className="relative bg-gradient-to-br from-[#fff7df] via-white to-red-50 border border-red-100 rounded-xl p-8 overflow-hidden shadow-xl shadow-red-950/5">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-red-500 to-slate-950" />
            <img src={product.imageUrl} alt={product.model} className="w-full aspect-square object-contain" />
          </div>

          <div>
            <div className="text-red-600 font-black text-xs uppercase tracking-[0.25em] mb-3">Air Compressors</div>
            <h1 className="brand-display text-5xl lg:text-6xl font-black">{product.model}</h1>
            <p className="text-lg text-slate-600 mt-5 leading-relaxed">{buyerDescription(product)}</p>
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-amber-700">Best For</div>
              <div className="mt-1 text-sm font-bold leading-relaxed text-amber-950">{bestFor(product)}</div>
            </div>

            <h2 className="text-2xl font-black mt-10 mb-5">Data sheet</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: CompressorIcon, label: 'Power', value: `${product.powerKw} kW` },
                { icon: Activity, label: 'CFM', value: product.flowRateCfm },
                { icon: Gauge, label: 'Working pressure', value: pressure },
              ].filter(item => item.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="border border-red-100 p-4 rounded-xl bg-white shadow-sm">
                  <Icon className="w-5 h-5 text-red-600 mb-3" />
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div>
                  <div className="font-black text-lg mt-1">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => setDownloadOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase tracking-wide text-sm shadow-lg shadow-red-600/20">
                <Download className="w-4 h-4" /> Download Brochure
              </button>
              <button onClick={() => onContact(product.model)} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl uppercase tracking-wide text-sm shadow-lg shadow-amber-300/25">
                <Phone className="w-4 h-4" /> Reach Us
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="grid gap-7 lg:grid-cols-3">
            <div className="rounded-xl border border-red-100 p-8 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-black mb-6">More Info</h2>
              <div className="space-y-3">
              {visibleFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-medium leading-relaxed">{feature}</span>
                </div>
              ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8">
              <Settings2 className="mb-5 h-8 w-8 text-red-600" />
              <h2 className="text-2xl font-black">Optional Accessories</h2>
              <div className="mt-5 space-y-3">
                {optionalAccessories(product).map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <span className="text-sm font-medium leading-relaxed text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-8 shadow-sm">
            <ShieldCheck className="mb-5 h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-black">Maintenance Notes</h2>
            <div className="mt-5 space-y-3">
              {maintenanceNotes(product).map(item => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <span className="text-sm font-medium leading-relaxed text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50 p-8">
            <Phone className="mb-5 h-8 w-8 text-red-600" />
            <h2 className="text-2xl font-black text-slate-950">Ask for sizing help</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Share your required pressure, estimated CFM, working hours, and application. The team can confirm the right model, receiver, dryer, and filter package.
            </p>
            <button onClick={() => onContact(product.model)} className="mt-6 inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-red-700">
              Get Quote <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="brand-display mb-6 text-3xl font-black text-slate-950">Similar Models</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {similar.map(item => (
                <button key={item.id} onClick={() => onNavigate('product-detail', String(item.id))} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-red-300 hover:bg-red-50">
                  <div className="flex h-36 items-center justify-center rounded-lg bg-white">
                    <img src={item.imageUrl} alt={item.model} className="max-h-32 max-w-full object-contain" />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-950 group-hover:text-red-700">{item.model}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{item.powerKw} kW | {item.flowRateCfm} CFM</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setDownloadOpen(true)} className="flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-wide text-white">
            <Download className="h-4 w-4" /> Brochure
          </button>
          <button onClick={() => onContact(product.model)} className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white">
            <Phone className="h-4 w-4" /> Get Quote
          </button>
        </div>
      </div>

      {downloadOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">Download Brochure</div>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{product.model} Catalog</h2>
              </div>
              <button onClick={() => setDownloadOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 text-slate-700 hover:bg-slate-200" aria-label="Close download form">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDownloadSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700">Name *</label>
                <input
                  required
                  value={downloadForm.name}
                  onChange={event => setDownloadForm(form => ({ ...form, name: event.target.value }))}
                  className="w-full rounded-sm border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700">Email <span className="normal-case text-slate-400">(optional)</span></label>
                <input
                  type="email"
                  value={downloadForm.email}
                  onChange={event => setDownloadForm(form => ({ ...form, email: event.target.value }))}
                  className="w-full rounded-sm border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  value={downloadForm.phone}
                  onChange={event => setDownloadForm(form => ({ ...form, phone: event.target.value }))}
                  className="w-full rounded-sm border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
              <button type="submit" disabled={downloadSubmitting} className="flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60">
                {downloadSubmitting ? 'Preparing Download...' : <><Download className="h-4 w-4" /> Download Catalog</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
