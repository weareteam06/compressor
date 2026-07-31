import { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import type { NewsArticle } from '@/lib/data';
import { getNewsArticles, getNewsBySlug } from '@/lib/data';

interface Props {
  onNavigate: (page: string, param?: string) => void;
  slug?: string;
}

export default function NewsPage({ onNavigate, slug }: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [current, setCurrent] = useState<NewsArticle | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) getNewsBySlug(slug).then(n => { setCurrent(n || null); setLoading(false); });
    else getNewsArticles().then(n => { setArticles(n); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>;

  if (slug && current) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-slate-900 text-white py-4">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <button onClick={() => onNavigate('news')} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to News
            </button>
          </div>
        </div>

        <article className="max-w-[900px] mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{current.category}</span>
            <time className="text-sm text-slate-500 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(current.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">{current.title}</h1>

          <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
            <User className="w-4 h-4 text-amber-500" />
            <span>By <strong className="text-slate-700">{current.author}</strong></span>
          </div>

          <div className="aspect-[16/9] rounded-2xl overflow-hidden my-8 shadow-xl">
            <img src={current.imageUrl} alt={current.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-slate-700 leading-relaxed font-medium">{current.excerpt}</p>
            <p className="text-slate-600 leading-relaxed mt-6">{current.content}</p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
            <button onClick={() => onNavigate('news')} className="text-amber-600 font-black uppercase tracking-wider text-sm flex items-center gap-2 hover:text-amber-700">
              <ArrowLeft className="w-4 h-4" /> All News
            </button>
            <button onClick={() => onNavigate('contact')} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg">
              Contact Us
            </button>
          </div>
        </article>
      </div>
    );
  }

  const categories = ['All', ...new Set(articles.map(a => a.category))];
  const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter);
  const featured = articles.find(a => a.featured);
  const rest = filtered.filter(a => !a.featured || filter !== 'All');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="page-hero bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 py-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">News & Events</div>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight">Latest Updates</h1>
          <p className="mt-4 text-lg text-red-200/80 max-w-3xl">Stay informed about our latest product launches, industry events, technical insights, and company news.</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                filter === c ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
              }`}>
              <Tag className="w-3 h-3 inline mr-1.5" />{c}
            </button>
          ))}
        </div>

        {featured && filter === 'All' && (
          <article onClick={() => onNavigate('news-detail', featured.slug)} className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200 mb-10 hover:shadow-2xl transition-shadow">
            <div className="grid lg:grid-cols-2 min-h-[360px]">
              <div className="h-72 lg:h-full overflow-hidden">
                <img src={featured.imageUrl} alt={featured.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Featured</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">{featured.category}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 group-hover:text-red-700 transition-colors leading-tight">{featured.title}</h2>
                <p className="text-slate-600 mt-4 leading-relaxed">{featured.excerpt}</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-500" />{new Date(featured.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="text-amber-600 font-black text-sm uppercase tracking-wider flex items-center gap-1">Read More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </div>
            </div>
          </article>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(article => (
            <article key={article.id} onClick={() => onNavigate('news-detail', article.slug)} className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-amber-200 transition-all h-full min-h-[380px] lg:h-[380px] flex flex-col">
              <div className="h-56 overflow-hidden flex-shrink-0">
                <img src={article.imageUrl} alt={article.title} onError={(event) => { event.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-full">{article.category}</span>
                  <time className="text-xs text-slate-400 font-bold">{new Date(article.date).toLocaleDateString()}</time>
                </div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-red-700 transition-colors leading-tight line-clamp-2">{article.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{article.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
