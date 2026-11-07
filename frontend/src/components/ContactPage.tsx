import { SiteText } from '@/lib/SiteText';
﻿import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2 } from 'lucide-react';
import type { SiteConfig } from '@/lib/data';
import { submitLead } from '@/lib/data';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface ContactPageProps {
  config: SiteConfig;
  preselectedProduct?: string;
}

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function ContactPage({ config, preselectedProduct }: ContactPageProps) {
  const copy = usePageContent('contact', defaultPageContent.contact);
  const headquarters = config.contact.headquarters.address.startsWith('Contact firstAir')
    ? {
        name: 'FS Compressors India Pvt. Ltd.',
        address: 'Plot No. S-3, Phase-II, Chakan MIDC, Village Sawardari, Khed, Pune 410501, Maharashtra',
      }
    : { ...config.contact.headquarters, name: 'FS Compressors India Pvt. Ltd.' };
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '', city: '', state: '',
    type: 'Quote Request' as 'Quote Request' | 'Service Request' | 'General Inquiry' | 'Distributor Inquiry' | 'Career',
    productOfInterest: preselectedProduct || '',
    industry: '',
    requiredPressure: '', existingWorkingPressure: '', requiredFad: '', existingInstallationMake: '', operatingHours: '', existingCompressorPower: '', application: '',
    message: preselectedProduct ? `I am interested in receiving a quote for ${preselectedProduct}.` : '',
  });
  const compressorSelection = formData.productOfInterest === 'Help me choose a compressor';
  const requirementDetails = compressorSelection
    ? [
        ['Required Working Pressure (Bar(g))', formData.requiredPressure],
        ['Existing Working Pressure (Bar/g)', formData.existingWorkingPressure],
        ['Required FAD', formData.requiredFad],
        ['Existing Installation (Make)', formData.existingInstallationMake],
        ['Operating Hours / Day', formData.operatingHours],
        ['Existing Compressor Power (KW)', formData.existingCompressorPower],
        ['Application', formData.application],
      ].filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value}`).join('; ')
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitLead({
        name: formData.name, email: formData.email, phone: formData.phone, company: formData.company, location: formData.city, state: formData.state,
        type: formData.type, source: 'Contact Form', productOfInterest: formData.productOfInterest, industry: formData.industry,
        message: formData.message, requiredPressure: formData.requiredPressure, existingWorkingPressure: formData.existingWorkingPressure, requiredFad: formData.requiredFad,
        existingInstallationMake: formData.existingInstallationMake, operatingHours: formData.operatingHours,
        existingCompressorPower: formData.existingCompressorPower, application: formData.application,
        requirementDetails: requirementDetails || undefined,
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
          <h2 className="text-3xl font-black text-slate-900">{String(copy.successTitle)}</h2>
          <p className="text-slate-600 mt-3 leading-relaxed">{" "}<SiteText section="ContactPage" name="your_inquiry_has_been_received_our_team_will_contact_you_within_24_hou" />{" "}</p>
          <button
          onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', company: '', phone: '', city: '', state: '', type: 'Quote Request', productOfInterest: '', industry: '', requiredPressure: '', existingWorkingPressure: '', requiredFad: '', existingInstallationMake: '', operatingHours: '', existingCompressorPower: '', application: '', message: '' }); }}
            className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-sm hover:bg-red-700 transition-colors"
          >{" "}<SiteText section="ContactPage" name="submit_another_inquiry" />{" "}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-16">
        <div className="mb-8 border-b border-slate-300 pb-6"><div className="text-xs font-black uppercase tracking-widest text-red-700"><SiteText section="ContactPage" name="contact_enquiry" /></div><h1 className="mt-2 text-3xl font-black text-slate-950">{String(copy.heroTitle)}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600"><SiteText section="ContactPage" name="product_enquiries_technical_information_warranty_questions_and_service" /></p></div>
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-2">{String(copy.formTitle)}</h2>
            <p className="text-sm text-slate-500 mb-8"><SiteText section="ContactPage" name="fields_marked_with_are_required" /></p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="name" /></label>
                  <input type="text" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="company" /></label>
                  <input type="text" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="email" /></label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="phone" /></label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="city" /></label>
                  <input type="text" required value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="state" /></label>
                  <select required value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm font-semibold bg-white">
                    <option value="">Select state or union territory</option>
                    {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="how_can_we_help" /></label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="industry" /></label>
                  <input type="text" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))}
                    placeholder="e.g. Workshop, manufacturing, plant air"
                    className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="product_service_of_interest" /></label>
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
                  {/*products.map(product => (
                    <option key={product.id} value={product.model}>
                      {product.model} - {product.powerKw} kW / {product.flowRateCfm} CFM
                    </option>
                  ))*/}
                </select>
              </div>

              {compressorSelection && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <h3 className="text-sm font-bold text-slate-900">Requirements in Detail (Optional)</h3>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Required Working Pressure (Bar(g))</label><input type="text" value={formData.requiredPressure} onChange={e => setFormData(p => ({ ...p, requiredPressure: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Existing Working Pressure (Bar/g)</label><input type="text" value={formData.existingWorkingPressure} onChange={e => setFormData(p => ({ ...p, existingWorkingPressure: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Required FAD (CFM)</label><input type="text" value={formData.requiredFad} onChange={e => setFormData(p => ({ ...p, requiredFad: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Existing Installation (Make)</label><input type="text" value={formData.existingInstallationMake} onChange={e => setFormData(p => ({ ...p, existingInstallationMake: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Operating Hours / Day</label><input type="text" value={formData.operatingHours} onChange={e => setFormData(p => ({ ...p, operatingHours: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Existing Compressor Power (KW)</label><input type="text" value={formData.existingCompressorPower} onChange={e => setFormData(p => ({ ...p, existingCompressorPower: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                    <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Application</label><input type="text" value={formData.application} onChange={e => setFormData(p => ({ ...p, application: e.target.value }))} className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-semibold" /></div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"><SiteText section="ContactPage" name="message" /></label>
                <textarea rows={5} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your requirements: required pressure, airflow CFM, application, site details..."
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-red-500 outline-none text-sm font-medium resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-sm shadow-xl uppercase tracking-wider text-sm transition-all disabled:opacity-50">
                {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}<SiteText section="ContactPage" name="sending" /></>) : (<><Send className="w-5 h-5" />{" "}<SiteText section="ContactPage" name="submit_inquiry" /></>)}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-sm border border-amber-500 bg-[#f9b916] p-8 text-slate-950 shadow-xl shadow-amber-900/15">
              <Building2 className="w-8 h-8 text-red-700 mb-3" />
              <p className="text-slate-950 text-lg mb-6 font-extrabold">{headquarters.name}</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-red-700 mt-1 flex-shrink-0" /><span className="text-sm text-slate-700 leading-relaxed">{headquarters.address}</span></div>
                <div className="rounded-sm border border-amber-600 bg-amber-400 px-6 py-5">
                  <h3 className="text-sm font-extrabold text-slate-950">Sales</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <a href={`tel:${config.contact.salesPhone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 hover:text-red-700">
                      <Phone className="h-4 w-4 flex-shrink-0 text-red-700" />
                      <span>{config.contact.salesPhone}</span>
                    </a>
                    <a href={`mailto:${config.contact.email}`} className="flex items-center gap-3 hover:text-red-700">
                      <Mail className="h-4 w-4 flex-shrink-0 text-red-700" />
                      <span>{config.contact.email}</span>
                    </a>
                  </div>
                </div>
                <div className="rounded-sm border border-amber-600 bg-amber-400 px-6 py-5">
                  <h3 className="text-sm font-extrabold text-slate-950">Service</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <a href={`tel:${config.contact.servicePhone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 hover:text-red-700">
                      <Phone className="h-4 w-4 flex-shrink-0 text-red-700" />
                      <span>{config.contact.servicePhone}</span>
                    </a>
                    <a href={`mailto:${config.contact.serviceEmail}`} className="flex items-center gap-3 hover:text-red-700">
                      <Mail className="h-4 w-4 flex-shrink-0 text-red-700" />
                      <span>{config.contact.serviceEmail}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
