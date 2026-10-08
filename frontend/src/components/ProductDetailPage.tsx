import { SiteText } from '@/lib/SiteText';
import { useRequest } from './RequestModal';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Download, Gauge, Images, Phone, Settings2, Zap } from 'lucide-react';
import type { Product } from '@/lib/data';
import { getProductById, getProducts } from '@/lib/data';
import CompressorIcon from '@/components/CompressorIcon';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props {
  productId: string;
  onNavigate: (page: string, param?: string) => void;
  onContact: (product: string) => void;
}

type DocumentRequest = { url: string; label: string };

export default function ProductDetailPage({ productId, onNavigate, onContact }: Props) {
  const openRequest = useRequest();
  const copy = usePageContent('productDetail', defaultPageContent.productDetail);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');


  useEffect(() => {
    setLoading(true);
    Promise.all([getProductById(productId), getProducts()]).then(([item, allProducts]) => {
      setProduct(item || null);
      setProducts(allProducts);
      setSelectedImage(item?.imageUrls?.[0] || item?.imageUrl || '');
      setLoading(false);
    });
  }, [productId]);

  const related = useMemo(() => product
    ? products.filter(item => item.id !== product.id && item.series === product.series).sort((a, b) => Math.abs(a.powerKw - product.powerKw) - Math.abs(b.powerKw - product.powerKw)).slice(0, 3)
    : [], [product, products]);
  const availableModels = useMemo(() => product ? products.filter(item => item.series === product.series).sort((a, b) => a.powerKw - b.powerKw) : [], [product, products]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">{String(copy.notFoundText)}</p></div>;

  const gallery = Array.from(new Set([product.imageUrl, ...(product.imageUrls || [])].filter(Boolean)));
  const coreSpecifications = [
    { label: String(copy.powerLabel), value: `${product.powerKw} kW / ${product.powerHp} HP`, icon: CompressorIcon },
    { label: String(copy.fadLabel), value: [product.flowRateCfm && `${product.flowRateCfm} CFM`, product.flowRateM3Min && `${product.flowRateM3Min} m³/min`].filter(Boolean).join(' / '), icon: Activity },
    { label: String(copy.pressureLabel), value: `${product.pressureMin}–${product.pressureMax} bar`, icon: Gauge },
    { label: String(copy.motorLabel), value: product.motorType || product.motorPower, icon: Zap },
  ].filter(item => item.value);
  const technicalRows = [
    ...product.specifications,
    { label: 'Voltage', value: product.voltage || '' }, { label: 'Frequency', value: product.frequency || '' },
    { label: 'Noise Level', value: product.noiseLevel || '' }, { label: 'Dimensions', value: product.dimensions || '' },
    { label: 'Weight', value: product.weight || '' },
  ].filter((item, index, rows) => item.value && rows.findIndex(other => other.label.toLowerCase() === item.label.toLowerCase()) === index);

  const setDocumentRequest = (document: DocumentRequest) => openRequest({ title: document.label, product: product.model, type: 'General Inquiry', source: `${document.label} Download`, downloadUrl: document.url });

  return <div className="min-h-screen bg-white pb-24">
    <div className="border-b border-slate-200"><div className="mx-auto max-w-[1180px] px-5 py-5 lg:px-8"><button onClick={() => onNavigate('products')} className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-red-700"><ArrowLeft className="h-4 w-4" />{String(copy.backLabel)}</button></div></div>

    <main className="mx-auto max-w-[1180px] px-5 py-12 lg:px-8">
      <section className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="relative overflow-hidden border border-red-100 bg-gradient-to-br from-amber-50 via-white to-red-50 p-8 shadow-lg"><img src={selectedImage || product.imageUrl} alt={`${product.model} industrial air compressor`} className="aspect-square w-full object-contain" /></div>
          {gallery.length > 1 && <div className="mt-3 grid grid-cols-5 gap-2">{gallery.map(url => <button key={url} onClick={() => setSelectedImage(url)} className={`border p-2 ${selectedImage === url ? 'border-red-600' : 'border-slate-200'}`}><img src={url} alt={`${product.model} product view`} loading="lazy" className="aspect-square w-full object-contain" /></button>)}</div>}
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.25em] text-red-700">{product.series} · {String(copy.eyebrow)}</div>
          <h1 className="brand-display mt-3 text-5xl font-black text-slate-950 lg:text-6xl">{product.model}</h1>
          <h2 className="mt-3 text-xl font-bold text-slate-800">{product.name}</h2>
          <p className="mt-5 text-base leading-7 text-slate-600">{product.longDescription || product.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">{coreSpecifications.map(({ label, value, icon: Icon }) => <div key={label} className="border border-slate-200 p-4"><Icon className="mb-2 h-5 w-5 text-red-600"/><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-black text-slate-950">{value}</div></div>)}</div>
          <div className="mt-7 flex flex-wrap gap-3">
            {product.datasheetUrl && <button onClick={() => setDocumentRequest({ url: product.datasheetUrl!, label: String(copy.datasheetLabel) })} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-black uppercase tracking-wide text-white"><Download className="h-4 w-4" />{String(copy.datasheetLabel)}</button>}
            {product.brochureUrl && <button onClick={() => setDocumentRequest({ url: product.brochureUrl!, label: String(copy.brochureLabel) })} className="inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white"><Download className="h-4 w-4" />{String(copy.brochureLabel)}</button>}
            <button onClick={() => onContact(product.model)} className="inline-flex items-center gap-2 bg-amber-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-950"><Phone className="h-4 w-4" />{String(copy.expertButton)}</button>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-7 lg:grid-cols-2">
        <ContentList title={String(copy.featuresTitle)} items={product.features} emptyText={String(copy.emptySectionText)} />
        <ContentList title={String(copy.benefitsTitle)} items={product.benefits || []} emptyText={String(copy.emptySectionText)} />
      </section>

      <section className="mt-14"><div className="mb-6 flex items-center gap-3"><Settings2 className="h-7 w-7 text-red-600"/><h2 className="brand-display text-3xl font-black">{String(copy.specificationsTitle)}</h2></div><div className="overflow-hidden border border-slate-200"><div className="grid sm:grid-cols-2">{technicalRows.map((row, index) => <div key={`${row.label}-${index}`} className="grid grid-cols-[minmax(120px,0.8fr)_1.2fr] border-b border-slate-200 px-5 py-4 odd:bg-slate-50 sm:[&:nth-last-child(-n+2)]:border-b-0"><div className="text-xs font-black uppercase tracking-wide text-slate-500">{row.label}</div><div className="font-bold text-slate-950">{row.value}</div></div>)}</div></div></section>

      <section className="mt-14 grid gap-7 lg:grid-cols-[1.2fr_0.8fr]">
        <div><h2 className="brand-display mb-6 text-3xl font-black">{String(copy.modelsTitle)}</h2><div className="overflow-x-auto border border-slate-200"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-950 text-white"><tr><th className="p-4">{String(copy.modelLabel)}</th><th className="p-4">{String(copy.powerLabel)}</th><th className="p-4">{String(copy.fadLabel)}</th><th className="p-4">{String(copy.pressureLabel)}</th></tr></thead><tbody>{availableModels.map(item => <tr key={item.id} className="cursor-pointer border-b border-slate-200 hover:bg-red-50" onClick={() => onNavigate('product-detail', String(item.id))}><td className="p-4 font-black text-red-700">{item.model}</td><td className="p-4">{item.powerKw}{" "}<SiteText section="ProductDetailPage" name="kw" /></td><td className="p-4">{item.flowRateCfm}{" "}<SiteText section="ProductDetailPage" name="cfm" /></td><td className="p-4">{item.pressureMin}–{item.pressureMax}{" "}<SiteText section="ProductDetailPage" name="bar" /></td></tr>)}</tbody></table></div></div>
        <ContentList title={String(copy.applicationsTitle)} items={product.applications} emptyText={String(copy.emptySectionText)} />
      </section>

      <section id="product-enquiry" className="mt-16 scroll-mt-28 bg-slate-950 p-7 text-white lg:p-10"><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">{String(copy.enquiryEyebrow)}</div><h2 className="brand-display mt-3 text-3xl font-black">{String(copy.enquiryTitle)}</h2><p className="mt-4 text-sm leading-6 text-slate-300">{String(copy.enquiryText)}</p><button onClick={() => onContact(product.model)} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-400">{String(copy.fullEnquiryLabel)} <ArrowRight className="h-4 w-4"/></button></div></div></section>

      {related.length > 0 && <section className="mt-16"><h2 className="brand-display mb-6 text-3xl font-black">{String(copy.relatedTitle)}</h2><div className="grid gap-5 md:grid-cols-3">{related.map(item => <button key={item.id} onClick={() => onNavigate('product-detail', String(item.id))} className="border border-slate-200 p-5 text-left hover:border-red-400"><img src={item.imageUrl} alt={item.model} loading="lazy" className="h-36 w-full object-contain"/><h3 className="mt-4 text-xl font-black">{item.model}</h3><p className="text-sm text-slate-600">{item.powerKw}{" "}<SiteText section="ProductDetailPage" name="kw_2" />{" "}{item.flowRateCfm}{" "}<SiteText section="ProductDetailPage" name="cfm" /></p></button>)}</div></section>}
    </main>


  </div>;
}

function ContentList({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return <div className="border border-slate-200 p-7"><h2 className="brand-display mb-5 text-2xl font-black">{title}</h2>{items.length > 0 ? <div className="space-y-3">{items.map(item => <div key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-red-600"/><span className="text-sm leading-6 text-slate-700">{item}</span></div>)}</div> : <div className="flex items-center gap-2 text-sm text-slate-400"><Images className="h-4 w-4"/>{emptyText}</div>}</div>;
}
