import { useEffect, useState } from 'react';
import { Award, Target, Eye, Calendar, Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import type { SiteConfig, TimelineEvent, JobOpening } from '@/lib/data';
import { getTimeline, getJobOpenings } from '@/lib/data';

interface Props {
  config: SiteConfig;
  page: 'about-story' | 'about-timeline' | 'about-careers';
  onNavigate: (page: string) => void;
}

export default function AboutPages({ config, page, onNavigate }: Props) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);

  useEffect(() => {
    if (page === 'about-timeline') getTimeline().then(setTimeline);
    if (page === 'about-careers') getJobOpenings().then(setJobs);
  }, [page]);

  const pageTitle = page === 'about-story' ? 'Our Story' : page === 'about-timeline' ? 'Our Timeline' : 'Careers';
  const pageSubtitle = page === 'about-story' ? 'A legacy of innovation spanning over 170 years' : page === 'about-timeline' ? 'Milestones that shaped our journey' : 'Join our team of dedicated professionals';

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">About Us</div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">{pageTitle}</h1>
          <p className="mt-4 text-lg text-red-200/80 max-w-2xl">{pageSubtitle}</p>
        </div>
      </section>

      {page === 'about-story' && (
        <div className="max-w-[1100px] mx-auto px-4 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-200">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">{config.about.storyLong}</p>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-2xl p-8 text-white shadow-xl">
                <Target className="w-10 h-10 text-amber-400 mb-4" />
                <h3 className="text-2xl font-black mb-3">Our Mission</h3>
                <p className="text-red-100 leading-relaxed">{config.about.mission}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
                <Eye className="w-10 h-10 text-amber-100 mb-4" />
                <h3 className="text-2xl font-black mb-3">Our Vision</h3>
                <p className="text-amber-50 leading-relaxed">{config.about.vision}</p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-200">
              {[
                { value: `${config.company.yearsOfExcellence}+`, label: 'Years of Heritage' },
                { value: '50,000+', label: 'Global Installations' },
                { value: '500+', label: 'Service Partners' },
                { value: '15+', label: 'Industry Awards' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <div className="text-3xl font-black text-slate-900">{s.value}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {page === 'about-timeline' && (
        <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16">
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
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-slate-200 mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Build Your Career With Us</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We have been a trusted name in the compressed air industry for over 170 years. Over the decades, the company and our products have evolved through innovation and new technologies. But those commitments to quality and service remain unchanged.
            </p>
            <p className="text-slate-600 leading-relaxed mt-4">
              Explore how you can become part of our diverse team and continue the legacy of being the most trusted and dependable compressed air provider. We are committed to a diverse workforce and are an Equal Opportunity Employer.
            </p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-6">Current Openings ({jobs.length})</h2>
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
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Requirements</div>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.map((r, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">{r}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onNavigate('contact')} className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow flex items-center gap-2 text-sm flex-shrink-0">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="bg-slate-100 rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No current openings. Please check back soon!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
