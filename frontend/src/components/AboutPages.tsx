import { SiteText } from '@/lib/SiteText';
import { useRequest } from './RequestModal';
import { useEffect, useState } from 'react';
import { Target, Eye, Calendar, Briefcase, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SiteConfig, TimelineEvent, JobOpening } from '@/lib/data';
import { getTimeline, getJobOpenings } from '@/lib/data';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props {
  config: SiteConfig;
  page: 'about-story' | 'about-timeline' | 'about-careers';
  onNavigate: (page: string) => void;
}

export default function AboutPages({ config, page, onNavigate }: Props) {
  const openRequest = useRequest();
  const aboutCopy = usePageContent('about', defaultPageContent.about);
  const timelineCopy = usePageContent('timeline', defaultPageContent.timeline);
  const careersCopy = usePageContent('careers', defaultPageContent.careers);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);

  useEffect(() => {
    if (page === 'about-timeline') getTimeline().then(setTimeline);
    if (page === 'about-careers') getJobOpenings().then(setJobs);
  }, [page]);

  const pageTitle = page === 'about-story' ? config.about.heroTitle || 'About FirstAir' : page === 'about-timeline' ? String(timelineCopy.heroTitle) : String(careersCopy.heroTitle);
  const pageSubtitle = page === 'about-story' ? config.about.heroIntro || config.about.storyShort : page === 'about-timeline' ? 'Milestones that shaped our journey' : 'Join our team of dedicated professionals';
  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {page === 'about-story' && (
        <AboutStory config={config} copy={aboutCopy} onNavigate={onNavigate} />
      )}

      {page === 'about-timeline' && (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16">
          <PageTitle title={pageTitle} subtitle={pageSubtitle} />
          <div className="relative">
            <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 via-red-400 to-red-700 rounded-full" />
            <div className="space-y-12">
              {timeline.map((event, idx) => (
                <div key={event.id} className={`relative flex items-start gap-6 lg:gap-12 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 ml-0 lg:ml-0 lg:w-1/2 ${idx % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'} pl-12 lg:pl-0`}>
                    <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-4 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                      <div className={`flex items-center gap-2 mb-2 ${idx % 2 === 0 ? 'lg:justify-end' : ''}`}>
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-3xl font-black text-amber-600">{event.year}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mb-2">{event.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {page === 'about-careers' && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
          <PageTitle title={pageTitle} subtitle={pageSubtitle} />
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-200 mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4">{String(careersCopy.introTitle)}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{" "}<SiteText section="AboutPages" name="we_have_been_a_trusted_name_in_the_compressed_air_industry_for_over_17" />{" "}</p>
            <p className="text-slate-600 leading-relaxed mt-4">{" "}<SiteText section="AboutPages" name="explore_how_you_can_become_part_of_our_diverse_team_and_continue_the_l" />{" "}</p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-6">{String(careersCopy.openingsTitle)} ({jobs.length})</h2>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">{job.department}</span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">{job.type}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-red-700 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 font-semibold">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" />{new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{job.description}</p>
                    <div className="mt-4">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2"><SiteText section="AboutPages" name="requirements" /></div>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.map((r, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openRequest({ title: `Apply: ${job.title}`, type: 'Career', source: 'Careers' })} className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm flex-shrink-0">{" "}<SiteText section="AboutPages" name="apply_now" />{" "}<ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="bg-slate-100 rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium"><SiteText section="AboutPages" name="no_current_openings_please_check_back_soon" /></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AboutStory({ config, copy, onNavigate }: { config: SiteConfig; copy: Record<string, unknown>; onNavigate: (page: string) => void }) {
  const openRequest = useRequest();
  const highlights = (config.about.highlights || []).filter(item => item.active !== false);
  const statistics = (config.about.statistics || []).filter(item => item.active !== false && item.verified);
  const aboutHeroImage = '/hero-products-showcase-transparent.png';
  return <main>
    <section className="mx-auto max-w-[1200px] px-5 py-12 lg:px-8"><div className="grid overflow-hidden bg-white lg:grid-cols-[0.9fr_1.1fr]"><div className="flex flex-col justify-between bg-amber-400 p-8 lg:p-10"><div><div className="text-xs font-black uppercase tracking-[0.22em] text-red-800">{config.about.heroEyebrow || String(copy.heroEyebrow)}</div><h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 lg:text-5xl">{config.about.heroTitle}</h1><p className="mt-5 leading-7 text-slate-800">{config.about.heroIntro}</p></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => onNavigate('products')} className="bg-slate-950 px-5 py-3 text-sm font-black text-white">{String(copy.productsButton)}</button><button onClick={() => openRequest({ title: 'Talk to Our Team', type: 'General Inquiry' })} className="border-2 border-slate-950 px-5 py-3 text-sm font-black text-slate-950">{String(copy.contactButton)}</button></div></div><div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-amber-400 p-6 lg:p-10"><img src={aboutHeroImage} alt={config.about.heroImageAlt || 'FirstAir industrial compressor solutions'} className="h-full w-full object-contain"/></div></div></section>

    <section className="mx-auto max-w-[1100px] px-5 py-12 lg:px-8"><div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"><article><div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{String(copy.storyEyebrow)}</div><h2 className="mt-3 text-3xl font-black">{String(copy.storyTitle)}</h2><p className="mt-5 text-lg leading-8 text-slate-700">{config.about.storyLong}</p></article><div className="grid gap-4"><div className="bg-red-800 p-6 text-white"><Target className="h-7 w-7 text-amber-400"/><h3 className="mt-4 text-xl font-black">{String(copy.missionTitle)}</h3><p className="mt-3 text-sm leading-6 text-red-100">{config.about.mission}</p></div><div className="bg-slate-950 p-6 text-white"><Eye className="h-7 w-7 text-amber-400"/><h3 className="mt-4 text-xl font-black">{String(copy.visionTitle)}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{config.about.vision}</p></div></div></div></section>

    {highlights.length > 0 && <section className="bg-white py-14"><div className="mx-auto max-w-[1100px] px-5 lg:px-8"><div className="text-xs font-black uppercase tracking-[0.22em] text-red-700">{String(copy.highlightsEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.highlightsTitle)}</h2><div className="mt-7 grid gap-5 md:grid-cols-3">{highlights.map(item => <article key={item.title} className="border border-slate-200 p-6"><CheckCircle2 className="h-7 w-7 text-red-600"/><h3 className="mt-4 text-xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p></article>)}</div></div></section>}

    {statistics.length > 0 && <section className="bg-slate-950 py-12 text-white"><div className="mx-auto max-w-[1100px] px-5 lg:px-8"><div className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">{String(copy.statisticsEyebrow)}</div><h2 className="mt-2 text-3xl font-black">{String(copy.statisticsTitle)}</h2><div className="mt-7 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">{statistics.map(item => <div key={item.label} className="bg-slate-950 p-6"><div className="text-3xl font-black text-amber-400">{item.value}</div><div className="mt-2 text-xs font-black uppercase tracking-widest text-slate-300">{item.label}</div></div>)}</div></div></section>}

  </main>;
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-9 grid gap-4 border-b border-slate-300 pb-6 md:grid-cols-[1fr_1fr] md:items-end"><div><div className="text-xs font-black uppercase tracking-widest text-red-700"><SiteText section="AboutPages" name="company_about" /></div><h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1></div><p className="text-sm leading-6 text-slate-600">{subtitle}</p></div>;
}
