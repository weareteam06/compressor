import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { Distributor } from '@/lib/data';
import 'leaflet/dist/leaflet.css';

interface Props {
  dealers: Distributor[];
  selectedId?: number | string;
  userLocation?: { lat: number; lng: number };
  onSelect: (dealer: Distributor) => void;
}

function MapView({ dealers, selectedId, userLocation }: Omit<Props, 'onSelect'>) {
  const map = useMap();
  useEffect(() => {
    const selected = dealers.find(dealer => dealer.id === selectedId);
    if (selected?.latitude != null && selected.longitude != null) map.flyTo([selected.latitude, selected.longitude], 9, { duration: 0.7 });
    else if (userLocation) map.flyTo([userLocation.lat, userLocation.lng], 7, { duration: 0.7 });
    else {
      const points = dealers.filter(d => d.latitude != null && d.longitude != null).map(d => [d.latitude!, d.longitude!] as [number, number]);
      if (points.length > 1) map.fitBounds(points, { padding: [35, 35] });
      else if (points.length === 1) map.setView(points[0], 9);
    }
  }, [dealers, map, selectedId, userLocation]);
  return null;
}

const dealerIcon = (selected: boolean) => divIcon({
  className: '',
  html: `<div style="width:${selected ? 34 : 30}px;height:${selected ? 34 : 30}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${selected ? '#991b1b' : '#365e2d'};border:3px solid white;box-shadow:0 3px 10px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center"><span style="width:8px;height:8px;border-radius:50%;background:white"></span></div>`,
  iconSize: [36, 42], iconAnchor: [18, 38], popupAnchor: [0, -38],
});

const userIcon = divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:4px solid white;box-shadow:0 0 0 3px rgba(37,99,235,.25)"></div>',
  iconSize: [18, 18], iconAnchor: [9, 9],
});

export default function DealerMap({ dealers, selectedId, userLocation, onSelect }: Props) {
  return (
    <MapContainer center={[22.8, 79.5]} zoom={5} scrollWheelZoom className="h-full min-h-[460px] w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapView dealers={dealers} selectedId={selectedId} userLocation={userLocation} />
      {dealers.filter(d => d.latitude != null && d.longitude != null).map(dealer => (
        <Marker key={dealer.id} position={[dealer.latitude!, dealer.longitude!]} icon={dealerIcon(dealer.id === selectedId)} eventHandlers={{ click: () => onSelect(dealer) }}>
          <Popup><strong>{dealer.name}</strong><br />{dealer.city}, {dealer.state}<br /><a href={`https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}`} target="_blank" rel="noreferrer">Directions</a></Popup>
        </Marker>
      ))}
      {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}><Popup>Your location</Popup></Marker>}
    </MapContainer>
  );
}
