'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import Link from 'next/link';
import { useEffect } from 'react';
import type { SearchHostelCard } from '@findyourhostel/shared/features/student';
import { formatRent } from '@findyourhostel/shared';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [31.5204, 74.3587]; // Lahore

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

/** Client-only Leaflet + OSM map of the search results (loaded via dynamic import). */
export default function HostelMap({
  hostels,
  center,
}: {
  hostels: SearchHostelCard[];
  center?: [number, number];
}) {
  const located = hostels.filter((h) => h.latitude != null && h.longitude != null);
  const mapCenter =
    center ??
    (located[0] ? [located[0].latitude as number, located[0].longitude as number] : DEFAULT_CENTER);

  return (
    <MapContainer center={mapCenter} zoom={12} className="h-full w-full" scrollWheelZoom>
      <Recenter center={mapCenter} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {located.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.latitude as number, h.longitude as number]}
          radius={9}
          pathOptions={{ color: '#4f46e5', fillColor: '#6366f1', fillOpacity: 0.9 }}
        >
          <Popup>
            <Link href={`/hostels/${h.id}`} className="font-medium text-primary">
              {h.name}
            </Link>
            <div className="text-xs text-foreground-secondary">
              {h.cheapest_rent != null ? formatRent(h.cheapest_rent) : 'Price on request'}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
