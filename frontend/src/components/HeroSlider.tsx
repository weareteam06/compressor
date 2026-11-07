import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play, Gauge, Activity } from 'lucide-react';
import type { Product } from '@/lib/data';
import CompressorIcon from '@/components/CompressorIcon';

interface HeroSliderProps {
  products: Product[];
  onNavigate: (page: string, param?: string) => void;
  onViewProduct: (id: number | string) => void;
}

export default function HeroSlider({ products, onNavigate, onViewProduct }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const slides = products.slice(0, 5);
  const total = slides.length;

  const goTo = useCallback((idx: number, dir: 'left' | 'right') => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(dir);
    setTimeout(() => {
      setActiveIndex(idx);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  }, [isTransitioning]);

  const goNext = useCallback(() => goTo((activeIndex + 1) % total, 'right'), [activeIndex, total, goTo]);
  const goPrev = useCallback(() => goTo((activeIndex - 1 + total) % total, 'left'), [activeIndex, total, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const t = setInterval(goNext, 6000);
    return () => clearInterval(t);
  }, [isPaused, goNext, total]);

  const current = slides[activeIndex];
  if (!current) return null;

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 min-h-[90vh] flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M40 0v80M0 40h80'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/[0.04] to-transparent" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-red-500/[0.05] blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/[0.04] blur-3xl" />
      </div>

      <div className="relative flex-1 flex items-center max-w-[1400px] mx-auto w-full px-3 sm:px-5 lg:px-8 py-12 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* LEFT: Text */}
          <div className="z-10 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                FS-Curtis India
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-400/30">
                Compressed Air Solutions Partner
              </span>
            </div>

            <div
              key={`title-${activeIndex}`}
              className={`transition-all duration-500 ease-out ${
                isTransitioning
                  ? (direction === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8')
                  : 'opacity-100 translate-x-0'
              }`}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-3">
                Compressed Air Solutions That Power Industrial Growth
              </h1>
              <p className="text-lg sm:text-xl text-red-200/80 font-semibold tracking-tight max-w-xl">
                Since 1854, FS-Curtis has engineered reliable compressed air systems for manufacturers who need productivity, energy savings, and uninterrupted operations.
              </p>
            </div>

            <div
              key={`specs-${activeIndex}`}
              className={`grid grid-cols-3 gap-3 mt-7 transition-all duration-500 delay-100 ease-out ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <CompressorIcon className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-2xl font-black text-white leading-none">{current.powerKw}<span className="text-xs font-bold text-amber-300 ml-1">kW</span></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-300/60 mt-1.5">{current.series} Power</div>
              </div>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <Activity className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-2xl font-black text-white leading-none">{current.flowRateCfm}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-300/60 mt-1.5">CFM</div>
              </div>
              <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <Gauge className="w-5 h-5 text-amber-400 mb-2" />
                <div className="text-2xl font-black text-white leading-none">{current.pressureMin}-{current.pressureMax}<span className="text-xs font-bold text-amber-300 ml-1">kg/cm2(g)</span></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-300/60 mt-1.5">Working Pressure</div>
              </div>
            </div>

            <div
              key={`desc-${activeIndex}`}
              className={`transition-all duration-500 delay-150 ease-out ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <p className="mt-6 text-base text-red-100/60 leading-relaxed max-w-xl line-clamp-3">
                Featured range: {current.model} - {current.name}. {current.description}
              </p>
            </div>

            <div
              key={`cta-${activeIndex}`}
              className={`flex flex-wrap gap-3 mt-8 transition-all duration-500 delay-200 ease-out ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <button
                onClick={() => onViewProduct(current.id)}
                className="group flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-xl shadow-amber-500/25 transition-all hover:scale-105 text-sm"
              >
                Explore Products
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-all hover:scale-105 text-sm"
              >
                Schedule Air Audit
              </button>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className="relative z-10 order-1 lg:order-2 flex items-center justify-center">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-10 bg-amber-500/20 rounded-full blur-2xl" />

            <div
              key={`img-${activeIndex}`}
              className={`relative w-full max-w-[540px] aspect-[4/3] flex items-center justify-center transition-all duration-600 ease-out ${
                isTransitioning
                  ? (direction === 'right' ? 'opacity-0 translate-x-16 scale-90' : 'opacity-0 -translate-x-16 scale-90')
                  : 'opacity-100 translate-x-0 scale-100'
              }`}
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-2xl">
                <img
                  src={current.imageUrl}
                  alt={current.model}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-20 border-t border-white/[0.06] bg-white/[0.03] backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goNext} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => setIsPaused(!isPaused)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-amber-300 transition-all ml-1">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <span className="text-xs font-bold text-amber-300/60 ml-3 hidden sm:inline">
              {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-[60vw]">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i, i > activeIndex ? 'right' : 'left')}
                className={`group relative flex-shrink-0 rounded-xl border transition-all duration-300 ${
                  i === activeIndex ? 'bg-amber-500/20 border-amber-400/50 ring-2 ring-amber-400/20 scale-105' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className={`w-8 h-7 rounded-lg overflow-hidden flex-shrink-0 ${i === activeIndex ? 'ring-1 ring-amber-400/50' : ''}`}>
                    <img src={s.imageUrl} alt={s.model} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className={`text-[11px] font-black leading-tight ${i === activeIndex ? 'text-white' : 'text-white/60'}`}>
                      {s.model}
                    </div>
                    <div className={`text-[9px] font-bold leading-tight ${i === activeIndex ? 'text-amber-300' : 'text-white/30'}`}>
                      {s.series}
                    </div>
                  </div>
                </div>
                {i === activeIndex && !isPaused && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-900/40 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ animation: 'slideProgress 6s linear forwards' }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 text-xs transition-all hover:scale-105 flex-shrink-0"
          >
            All Products <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideProgress { from { width: 0%; } to { width: 100%; } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
