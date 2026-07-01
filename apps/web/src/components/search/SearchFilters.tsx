'use client';

import { useState } from 'react';
import { useFacilities } from '@findyourhostel/shared/features/owner';
import type { SearchFilters as Filters } from '@findyourhostel/shared/features/student';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

export function SearchFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const facilities = useFacilities();
  const [locationQuery, setLocationQuery] = useState('');
  const geo = useLocationSearch(locationQuery);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleFacility(id: string, on: boolean) {
    const current = filters.facility_ids ?? [];
    set('facility_ids', on ? [...current, id] : current.filter((x) => x !== id));
  }

  return (
    <aside className="space-y-4">
      <Field label="Search">
        <Input
          placeholder="Hostel, area or institution"
          value={filters.q ?? ''}
          onChange={(e) => set('q', e.target.value)}
        />
      </Field>

      <Field label="Near a location" hint="Sorts results by distance">
        <Input
          placeholder="Type a place…"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
        />
        {geo.results.length > 0 && (
          <ul className="mt-1 max-h-40 overflow-auto rounded-xl border border-border bg-card text-sm">
            {geo.results.map((r) => (
              <li key={`${r.lat},${r.lng}`}>
                <button
                  type="button"
                  className="block w-full truncate px-3 py-1.5 text-left hover:bg-background-secondary"
                  onClick={() => {
                    onChange({ ...filters, lat: r.lat, lng: r.lng, sort: 'distance' });
                    setLocationQuery(r.label.split(',')[0] ?? r.label);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
        <Field label="Category">
          <Select
            value={filters.hostel_type ?? ''}
            onChange={(e) => set('hostel_type', (e.target.value || undefined) as Filters['hostel_type'])}
          >
            <option value="">Any</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="co_living">Mixed / Family</option>
          </Select>
        </Field>
        <Field label="Room type">
          <Select
            value={filters.seat_type ?? ''}
            onChange={(e) => set('seat_type', (e.target.value || undefined) as Filters['seat_type'])}
          >
            <option value="">Any</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="quad">Quad</option>
            <option value="dormitory">Dormitory</option>
          </Select>
        </Field>
        <Field label="Min price">
          <Input
            type="number"
            min={0}
            value={filters.min_price ?? ''}
            onChange={(e) => set('min_price', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
        <Field label="Max price">
          <Input
            type="number"
            min={0}
            value={filters.max_price ?? ''}
            onChange={(e) => set('max_price', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
      </div>

      <Field label="Sort by">
        <Select value={filters.sort} onChange={(e) => set('sort', e.target.value as Filters['sort'])}>
          <option value="relevance">Relevance</option>
          <option value="price">Price (low → high)</option>
          <option value="distance">Distance</option>
          <option value="rating">Rating</option>
        </Select>
      </Field>

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground-secondary">
          What&apos;s included
        </span>
        {facilities.isLoading ? (
          <p className="text-sm text-foreground-muted">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {facilities.data?.map((f) => (
              <label key={f.id} className="flex items-center gap-2 text-sm text-foreground-secondary">
                <input
                  type="checkbox"
                  checked={(filters.facility_ids ?? []).includes(f.id)}
                  onChange={(e) => toggleFacility(f.id, e.target.checked)}
                />
                {f.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          setLocationQuery('');
          onChange({ sort: 'relevance' });
        }}
      >
        Clear filters
      </Button>
    </aside>
  );
}
