import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2 } from 'lucide-react';
import { useEffect } from 'react';
import type { Product, SiteConfig } from '@/lib/data';
import { getProducts, submitLead } from '@/lib/data';

interface ContactPageProps {
  config: SiteConfig;
  preselectedProduct?: string;
}

export default function ContactPage({ config, preselectedProduct }: ContactPageProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '',
    type: 'Quote Request' as 'Quote Request' | 'Service Request' | 'General Inquiry' | 'Distributor Inquiry' | 'Career',
    productOfInterest: preselectedProduct || '',
    industry: '',
    message: preselectedProduct ? `I am interested in receiving a quote for ${preselectedProduct}.` : '',
  });

  useEffect(() => {
    getProducts().then(items => {
      setProducts(
        items
          .filter(item => /^(FAS[-\s]?\d+|FSG\d+)/i.test(item.model))
          .sort((a, b) => a.powerKw - b.powerKw)
      );
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead({
        name: formData.name, email: formData.email, phone: formData.phone, company: formData.company,
        type: formData.type, source: 'Contact Form', productOfInterest: formData.productOfInterest, industry: formData.industry,
        message: formData.message,
      });
      setSubmitted(true);
    } finally { setIsSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-16 px-4">
        <div className="text-center max-w-lg mx-auto bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Thank You!</h2>
          <p className="text-slate-600 mt-3 leading-relaxed">
            Your inquiry has been received. Our team will contact you within 24 hours to discuss your compressed air requirements.
          </p>
          <button
            onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', company: '', phone: '', type: 'Quote Request', productOfInterest: '', industry: '', message: '' }); }}
            className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-sm hover:bg-red-700 transition-colors"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <section className="page-hero border-t-4 border-red-600 bg-gradient-to-br from-[#fff8df] via-[#ffd765] to-[#f9b916] py-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="text-red-700 font-black text-xs uppercase tracking-widest mb-3">Contact Us</div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tight">Send Us A Message</h1>
          <p className="mt-4 text-lg font-medium text-slate-700 max-w-2xl">
            Use the form below for firstAir product inquiries, technical information, warranty questions, or service support.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Inquiry Form</h2>
            <p className="text-sm text-slate-500 mb-8">Fields marked with * are required.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Name *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Company</label>
                  <input type="text" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Phone *</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">How can we help? *</label>
                  <select required value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-bold text-slate-800">
                    <option value="Quote Request">Quote Request</option>
                    <option value="General Inquiry">General Inquiry</option>                    
                    <option value="Service Request">Service Request</option>
                    <option value="Distributor Inquiry">Distributor Inquiry</option>
                    <option value="Career">Career Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Industry</label>
                  <input type="text" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))}
                    placeholder="e.g. Workshop, manufacturing, plant air"
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Product / Service of Interest</label>
                <select
                  value={formData.productOfInterest}
                  onChange={e => setFormData(p => ({ ...p, productOfInterest: e.target.value }))}
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold bg-white"
                >
                  <option value="">Select product or service</option>
                  <option value="Help me choose a compressor">Help me choose a compressor</option>
                  <option value="Technical information">Technical information</option>
                  <option value="Warranty information">Warranty information</option>
                  <option value="Service and spare parts">Service and spare parts</option>
                  {products.map(product => (
                    <option key={product.id} value={product.model}>
                      {product.model} - {product.powerKw} kW / {product.flowRateCfm} CFM
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Message</label>
                <textarea rows={5} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your requirements: required pressure, airflow CFM, application, site details..."
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-medium resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm shadow-xl uppercase tracking-wider text-sm transition-all disabled:opacity-50">
                {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>) : (<><Send className="w-5 h-5" /> Submit Inquiry</>)}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-sm border border-amber-500 bg-[#f9b916] p-8 text-slate-950 shadow-xl shadow-amber-900/15">
              <Building2 className="w-8 h-8 text-red-700 mb-3" />
              <h3 className="text-xl font-black mb-1">firstAir Compressor</h3>
              <p className="text-red-800 text-sm mb-6 font-bold">{config.contact.headquarters.name}</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-red-700 mt-1 flex-shrink-0" /><span className="text-sm text-slate-700 leading-relaxed">{config.contact.headquarters.address}</span></div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-red-700 flex-shrink-0" /><div className="text-sm"><span className="text-slate-600">Phone: </span><a href={`tel:${config.contact.factoryPhone}`} className="font-bold hover:text-red-700">{config.contact.factoryPhone}</a></div></div>
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-red-700 flex-shrink-0" /><a href={`mailto:${config.contact.email}`} className="text-sm font-bold hover:text-red-700">{config.contact.email}</a></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
              <h3 className="font-black text-slate-900 mb-4">Regional Offices</h3>
              <div className="space-y-4">
                {config.contact.regionalOffices.map(o => (
                  <div key={o.region} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-1">{o.region}</div>
                    <div className="font-bold text-slate-900 text-sm">{o.contactPerson}</div>
                    <div className="text-xs text-slate-500">{o.designation}</div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="text-slate-600">{o.address}</div>
                      <a href={`tel:${o.phone}`} className="block text-red-700 font-bold hover:text-red-800">{o.phone}</a>
                      <a href={`mailto:${o.email}`} className="block text-red-700 font-bold hover:text-red-800">{o.email}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
