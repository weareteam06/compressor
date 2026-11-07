import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { getActiveOffers, type OfferAlert } from '@/lib/data';

export default function OfferAlertBanner() {
  const [offers, setOffers] = useState<OfferAlert[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const next = await getActiveOffers();
        if (!cancelled) {
          setOffers(next);
          setIndex(current => next.length ? current % next.length : 0);
        }
      } catch {
        if (!cancelled) setOffers([]);
      }
    };
    void load();
    const timer = window.setInterval(load, 30_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (offers.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % offers.length), 5_000);
    return () => window.clearInterval(timer);
  }, [offers.length]);

  const offer = offers[index];
  if (!offer) return null;

  return (
    <section role="status" aria-live="polite" className="relative z-30 border-b border-red-700 bg-red-600 text-white">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:px-5 lg:px-8">
        <Megaphone className="h-5 w-5 shrink-0 animate-pulse text-amber-300" />
        {offer.imageUrl && <img src={offer.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover bg-white/10" />}
        <div className="min-w-0 flex-1">
          <span className="mr-2 font-black motion-safe:animate-pulse">{offer.title}</span>
          <span className="font-semibold">{offer.message}</span>
          {offer.content && <span className="ml-2 hidden text-sm text-red-100 sm:inline">{offer.content}</span>}
        </div>
        {offers.length > 1 && <span className="text-xs font-bold">{index + 1}/{offers.length}</span>}
      </div>
    </section>
  );
}
