import { SiteText } from '@/lib/SiteText';
import { useRequest } from './RequestModal';
import { useEffect, useState } from 'react';
import { Building2, LocateFixed, Mail, Map, MapPin, Navigation, Phone, Search } from 'lucide-react';
import type { Distributor } from '@/lib/data';
import { getDistributors } from '@/lib/data';
import DealerMap from '@/components/DealerMap';
import { defaultPageContent, usePageContent } from '@/lib/pageContent';

interface Props {
  onNavigate: (page: string) => void;
}

export default function DistributorsPage(_props: Props) {
  const openRequest = useRequest();
  const copy = usePageContent('distributors', defaultPageContent.distributors);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string>('All');
  const [category, setCategory] = useState('Any');
  const [radius, setRadius] = useState(500);
  const [resultLimit, setResultLimit] = useState(25);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>();
  const [locationMessage, setLocationMessage] = useState('');
  const [mapDealer, setMapDealer] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedDealers, setRevealedDealers] = useState<Set<number | string>>(() => new Set());
  const requestDealer = (dealer: Distributor) => openRequest({
    title: `Contact ${dealer.name}`, type: 'Distributor Inquiry', source: 'Dealer Contact Reveal',
    product: dealer.authorizedProducts.join(', '), assignedDistributorId: typeof dealer.id === 'number' ? dealer.id : undefined,
    message: `Requested contact details for ${dealer.name}, ${dealer.city}, ${dealer.state}.`,
    onSuccess: () => setRevealedDealers(current => new Set(current).add(dealer.id)),
  });

  useEffect(() => {
    const cityCoordinates: Record<string, [number, number]> = {
      Pune: [18.7606, 73.8635], Bangalore: [12.9716, 77.5946], Noida: [28.5355, 77.391],
      Ahmedabad: [23.0225, 72.5714], Kolkata: [22.5726, 88.3639], Indore: [22.7196, 75.8577],
    };
    getDistributors().then(items => {
      setDistributors(items.map(dealer => {
        const fallback = cityCoordinates[dealer.city];
        return fallback && (dealer.latitude == null || dealer.longitude == null)
          ? { ...dealer, latitude: fallback[0], longitude: fallback[1] }
          : dealer;
      }));
      setLoading(false);
    });
  }, []);

  const distanceMiles = (dealer: Distributor) => {
    if (!userLocation || dealer.latitude == null || dealer.longitude == null) return undefined;
    const toRad = (value: number) => value * Math.PI / 180;
    const dLat = toRad(dealer.latitude - userLocation.lat);
    const dLng = toRad(dealer.longitude - userLocation.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(dealer.latitude)) * Math.sin(dLng / 2) ** 2;
    return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }
    setLocationMessage('Finding your location...');
    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationMessage('Showing nearest dealers to your location.');
      },
      () => setLocationMessage('Location access was unavailable. Search by city, state, or postcode instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const regions = ['All', ...Array.from(new Set(distributors.map(d => d.region)))];
  let filtered = distributors;
  if (region !== 'All') filtered = filtered.filter(d => d.region === region);
  if (category !== 'Any') filtered = filtered.filter(d => d.authorizedProducts.includes(category));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => [
      d.name,
      d.city,
      d.state,
      d.region,
      d.fullAddress,
      d.contactPerson,
      d.email,
      ...d.authorizedProducts,
    ].join(' ').toLowerCase().includes(q));
  }
  if (userLocation) {
    filtered = filtered
      .filter(dealer => (distanceMiles(dealer) ?? Infinity) <= radius)
      .sort((a, b) => (distanceMiles(a) ?? Infinity) - (distanceMiles(b) ?? Infinity));
  }
  filtered = filtered.slice(0, resultLimit);
  const categories = ['Any', ...Array.from(new Set(distributors.flatMap(d => d.authorizedProducts)))];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <section className="relative z-10 mx-auto max-w-[1280px] px-5 pt-12 lg:px-8">
        <div className="mb-7 grid gap-4 border-b border-slate-300 pb-6 md:grid-cols-[1fr_1fr] md:items-end"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-700"><Building2 className="h-4 w-4" /><SiteText section="DistributorsPage" name="authorized_distribution_network" /></div><h1 className="mt-3 text-3xl font-black text-slate-950">{String(copy.heroTitle)}</h1></div><p className="text-sm leading-6 text-slate-600"><SiteText section="DistributorsPage" name="find_certified_representatives_for_equipment_sales_package_guidance_in" /></p></div>
        <div className="rounded-xl border border-amber-400 bg-white p-5 shadow-2xl shadow-amber-900/15">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_.7fr_.55fr_.55fr_.8fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700"><SiteText section="DistributorsPage" name="your_location" /></span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="City, state, postcode, or dealer" className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700"><SiteText section="DistributorsPage" name="search_radius" /></span>
              <select value={radius} onChange={event => setRadius(Number(event.target.value))} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                {[50, 100, 200, 500, 1000].map(value => <option key={value} value={value}>{value} mi</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700"><SiteText section="DistributorsPage" name="results" /></span>
              <select value={resultLimit} onChange={event => setResultLimit(Number(event.target.value))} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                {[5, 10, 25, 50].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700"><SiteText section="DistributorsPage" name="region" /></span>
              <select value={region} onChange={event => setRegion(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                {regions.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-black text-slate-700"><SiteText section="DistributorsPage" name="category_filter" /></span>
              <select value={category} onChange={event => setCategory(event.target.value)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-bold">
                {categories.map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button onClick={useMyLocation} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-red-700">
              <LocateFixed className="h-4 w-4" />{" "}<SiteText section="DistributorsPage" name="use_my_location" />{" "}</button>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><Map className="h-4 w-4 text-red-600" /><SiteText section="DistributorsPage" name="showing" />{" "}{filtered.length}{" "}<SiteText section="DistributorsPage" name="certified_representatives" /></div>
          </div>
          {locationMessage && <p className="mt-3 text-xs font-semibold text-slate-500">{locationMessage}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8">
        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[390px_1fr]">
          <div className="max-h-[620px] overflow-y-auto border-b border-slate-200 lg:border-b-0 lg:border-r">
            {filtered.map(dealer => {
              const distance = distanceMiles(dealer);
              return (
                <article key={dealer.id} onClick={() => setMapDealer(dealer)} className={`cursor-pointer border-b border-slate-100 p-5 transition-colors last:border-b-0 ${mapDealer?.id === dealer.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">{dealer.region}{" "}<SiteText section="DistributorsPage" name="region" /></div>
                      <h3 className="mt-1 text-lg font-black leading-tight text-slate-950">{dealer.name}</h3>
                    </div>
                    <MapPin className="h-5 w-5 shrink-0 text-red-600" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{dealer.fullAddress || `${dealer.city}, ${dealer.state}`}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {dealer.authorizedProducts.slice(0, 3).map(product => <span key={product} className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{product}</span>)}
                  </div>
                  {revealedDealers.has(dealer.id) && (
                    <div className="mt-4 space-y-1 text-sm font-bold">
                      <a href={`tel:${dealer.phone}`} onClick={event => event.stopPropagation()} className="flex items-center gap-2 text-slate-700 hover:text-red-700"><Phone className="h-3.5 w-3.5" />{dealer.phone}</a>
                      <a href={`mailto:${dealer.email}`} onClick={event => event.stopPropagation()} className="flex items-center gap-2 text-slate-700 hover:text-red-700"><Mail className="h-3.5 w-3.5" />{dealer.email}</a>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-500">{distance != null ? `${distance.toFixed(1)} mi` : `${dealer.city}, ${dealer.state}`}</div>
                    <div className="flex items-center gap-3">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} className="inline-flex items-center gap-1 text-xs font-black text-red-600 hover:text-red-800"><Navigation className="h-3.5 w-3.5" /><SiteText section="DistributorsPage" name="directions" /></a>
                      {!revealedDealers.has(dealer.id) && <button onClick={event => { event.stopPropagation(); requestDealer(dealer); }} className="text-xs font-black text-red-600 hover:text-red-800"><SiteText section="DistributorsPage" name="contact" /></button>}
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && <div className="p-10 text-center text-sm font-semibold text-slate-500"><SiteText section="DistributorsPage" name="no_dealers_match_the_selected_filters" /></div>}
          </div>
          <div className="min-h-[520px] bg-slate-100">
            <DealerMap dealers={filtered} selectedId={mapDealer?.id} userLocation={userLocation} onSelect={setMapDealer} />
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-amber-500 bg-[#f9b916] p-8 text-center text-slate-950 shadow-xl shadow-amber-900/15 lg:p-10">
          <h2 className="text-2xl lg:text-3xl font-black">{String(copy.partnerTitle)}</h2>
          <p className="text-slate-700 mt-2 max-w-2xl mx-auto"><SiteText section="DistributorsPage" name="interested_in_joining_the_firstair_network_connect_with_us_for_partner" /></p>
          <button onClick={() => openRequest({ title: 'Become a Partner', type: 'Distributor Inquiry', source: 'Dealer Partnership' })} className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg shadow-lg transition-colors">{" "}<SiteText section="DistributorsPage" name="become_a_partner" />{" "}</button>
        </div>
      </section>


    </div>
  );
}
