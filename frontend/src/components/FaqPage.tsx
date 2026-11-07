import { SiteText } from '@/lib/SiteText';
import { usePublicContent } from '@/lib/publicContent';
import { ChevronDown, MessageCircle, MessageSquareText } from 'lucide-react';
import { useState } from 'react';

export default function FaqPage({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  const { faqs } = usePublicContent();
  const [open, setOpen] = useState<number | null>(0);
  return <main className="bg-slate-50 pb-16">
    <section className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-[1400px] px-3 py-16 text-center sm:px-5 lg:px-8 lg:py-20"><div className="text-xs font-black uppercase tracking-[0.22em] text-red-700"><SiteText section="FaqPage" name="help_centre" /></div><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl"><SiteText section="FaqPage" name="frequently_asked_questions" /></h1><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600"><SiteText section="FaqPage" name="quick_answers_about_selecting_operating_and_supporting_your_firstair_c" /></p></div></section>
    <section className="mx-auto max-w-[1400px] px-3 py-12 sm:px-5 lg:px-8"><div className="space-y-3">{faqs.map(([question, answer], index) => <article key={question} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><button onClick={() => setOpen(current => current === index ? null : index)} aria-expanded={open === index} className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left font-extrabold text-slate-950 hover:bg-amber-50"><span>{question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-red-700 transition-transform ${open === index ? 'rotate-180' : ''}`} /></button>{open === index && <div className="border-t border-slate-100 px-6 py-5 text-sm leading-7 text-slate-600">{answer}</div>}</article>)}</div>
      <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-xl bg-slate-950 p-7 text-white sm:flex-row sm:items-center"><div className="flex gap-4"><MessageSquareText className="mt-1 h-6 w-6 shrink-0 text-amber-400" /><div><h2 className="text-xl font-black"><SiteText section="FaqPage" name="still_need_help" /></h2><p className="mt-1 text-sm leading-6 text-slate-300"><SiteText section="FaqPage" name="talk_to_our_team_about_your_compressor_requirement_service_or_technica" /></p></div></div><button onClick={() => onNavigate('contact')} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"><SiteText section="FaqPage" name="contact_us" />{" "}<MessageCircle className="h-4 w-4" /></button></div>
    </section>
  </main>;
}
