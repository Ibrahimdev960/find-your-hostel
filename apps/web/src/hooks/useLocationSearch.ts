'use client';

import { useEffect, useState } from 'react';

export type GeoResult = { label: string; lat: number; lng: number };

/**
 * Debounced place search via OpenStreetMap Nominatim (no API key).
 * Used to turn a typed location into lat/lng for proximity sorting.
 */
export function useLocationSearch(query: string, delay = 400) {
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const json: Array<{ display_name: string; lat: string; lon: string }> = await res.json();
        if (active) {
          setResults(
            json.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
          );
        }
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, delay);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, delay]);

  return { results, loading };
}
