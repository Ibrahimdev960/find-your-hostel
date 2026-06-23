'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { List, Map as MapIcon } from 'lucide-react';
import {
  useSearchHostels,
  type SearchFilters as Filters,
} from '@findyourhostel/shared/features/student';
import { SearchFilters } from '@/components/search/SearchFilters';
import { HostelResultCard } from '@/components/search/HostelResultCard';
import { Button } from '@/components/ui/button';

// Leaflet touches `window`, so the map is client-only.
const HostelMap = dynamic(() => import('@/components/search/HostelMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-neutral-100" />,
});

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>({ sort: 'relevance' });
  const [view, setView] = useState<'list' | 'map'>('list');
  const search = useSearchHostels(filters);

  const center = useMemo<[number, number] | undefined>(
    () => (filters.lat != null && filters.lng != null ? [filters.lat, filters.lng] : undefined),
    [filters.lat, filters.lng]
  );

  const results = search.data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-brand-700">
          Find Your Hostel
        </Link>
        <div className="flex gap-1 rounded-md border border-neutral-200 p-0.5">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" /> List
          </Button>
          <Button
            variant={view === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('map')}
          >
            <MapIcon className="h-4 w-4" /> Map
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <SearchFilters filters={filters} onChange={setFilters} />

        <section>
          <p className="mb-3 text-sm text-neutral-500">
            {search.isLoading
              ? 'Searching…'
              : `${results.length} hostel${results.length === 1 ? '' : 's'} found`}
          </p>

          {view === 'map' ? (
            <div className="h-[70vh] overflow-hidden rounded-xl border border-neutral-200">
              <HostelMap hostels={results} center={center} />
            </div>
          ) : results.length === 0 && !search.isLoading ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
              No hostels match your filters. Try widening your search.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((h) => (
                <HostelResultCard key={h.id} hostel={h} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
