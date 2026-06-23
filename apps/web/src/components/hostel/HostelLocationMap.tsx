'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/** Single-marker location map for a hostel detail page. */
export default function HostelLocationMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <MapContainer center={[lat, lng]} zoom={14} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={10}
        pathOptions={{ color: '#1d5cf5', fillColor: '#337bff', fillOpacity: 0.9 }}
      >
        <Popup>{label}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
