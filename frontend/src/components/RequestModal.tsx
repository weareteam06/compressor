import { SiteText } from '@/lib/SiteText';
import DocumentDownload from './DocumentDownload';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { submitLead, type Lead } from '@/lib/data';

type RequestOptions = { title?: string; product?: string; source?: string; type?: Lead['type']; downloadUrl?: string; message?: string; assignedDistributorId?: number; onSuccess?: () => void };
const RequestContext = createContext<(options?: RequestOptions) => void>(() => {});
export const useRequest = () => useContext(RequestContext);

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<RequestOptions | null>(null);
  return <RequestContext.Provider value={(options = {}) => setRequest(options)}>{children}{request && <RequestModal request={request} onClose={() => setRequest(null)} />}</RequestContext.Provider>;
}

function RequestModal({ request, onClose }: { request: RequestOptions; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', location: '', productOfInterest: request.product || '', industry: '', message: request.message || '', requiredPressure: '', requiredFad: '', operatingHours: '', currentCompressor: '', application: '', urgency: 'Normal', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const service = request.type === 'Service Request';
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending' || form.website) return;
    setStatus('sending');
    try {
      const { website: _website, urgency, ...details } = form;
      await submitLead({ ...details, assignedDistributorId: request.assignedDistributorId, type: request.type || 'Quote Request', source: request.source || request.title || 'Website Request', message: form.message || request.title || 'Quote request', requirementDetails: service ? `Urgency: ${urgency}; ${form.message}` : form.message, priority: service && urgency === 'Production stopped' ? 'Urgent' : service && urgency === 'High' ? 'High' : 'Medium' });
      setStatus('sent');
      request.onSuccess?.();
    } catch { setStatus('error'); }
  };
  const input = (field: keyof typeof form, label: string, required = false, type = 'text') => <label className="text-sm font-semibold text-slate-700">{label}{required && ' *'}<input name={field} type={type} required={required} value={form[field]} onChange={e => setForm(current => ({ ...current, [field]: e.target.value }))} className="mt-1 block w-full rounded-md border border-slate-300 p-3 text-slate-950" /></label>;
  return <dialog ref={dialog} onCancel={e => { e.preventDefault(); if (status !== 'sending') onClose(); }} aria-labelledby="request-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/70">
    <div className="flex items-center justify-between border-b p-6"><h2 id="request-title" className="text-2xl font-extrabold">{request.title || 'Request a Quote'}</h2><button type="button" disabled={status === 'sending'} onClick={onClose} aria-label="Close request form" className="rounded p-2 hover:bg-slate-100"><X /></button></div>
    {status === 'sent' ? <div role="status" className="p-8"><CheckCircle2 className="h-10 w-10 text-green-600" /><h3 className="mt-4 text-xl font-bold"><SiteText section="RequestModal" name="request_received" /></h3><p className="mt-3"><SiteText section="RequestModal" name="our_team_will_contact_you_about_your_requirement" /></p>{request.downloadUrl && <DocumentDownload url={request.downloadUrl} />}<button onClick={onClose} className="ml-4 mt-5 font-bold text-red-700"><SiteText section="RequestModal" name="close" /></button></div> : <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
      <input aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
      {input('name', 'Name', true)}{input('company', 'Company', service || !request.type || request.type === 'Quote Request')}{input('phone', 'Mobile number', true, 'tel')}{input('email', 'Email', false, 'email')}{input('location', 'City name', true)}{input('productOfInterest', 'Product / model')}{input('industry', 'Industry')}
      {service && <label className="text-sm font-semibold"><SiteText section="RequestModal" name="urgency" /><select className="mt-1 block w-full rounded-md border p-3" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}><option>Normal</option><option>High</option><option>Production stopped</option></select></label>}
      <details className="sm:col-span-2"><summary className="cursor-pointer text-sm font-bold"><SiteText section="RequestModal" name="application_and_technical_details_optional" /></summary><div className="mt-4 grid gap-4 sm:grid-cols-2">{input('requiredPressure', 'Required pressure')}{input('requiredFad', 'Required FAD')}{input('operatingHours', 'Operating hours / day')}{input('currentCompressor', 'Current compressor')}{input('application', 'Application')}</div></details>
      <label className="text-sm font-semibold sm:col-span-2"><SiteText section="RequestModal" name="requirement_details" /><textarea required={!request.downloadUrl} rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 p-3" /></label>
      {status === 'error' && <p role="alert" className="text-sm text-red-700 sm:col-span-2"><SiteText section="RequestModal" name="we_could_not_submit_your_request_your_details_are_saved_here_please_tr" /></p>}
      <button disabled={status === 'sending'} className="rounded-md bg-red-600 px-6 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2">{status === 'sending' ? 'Submitting…' : 'Submit request'}</button>
    </form>}
  </dialog>;
}
