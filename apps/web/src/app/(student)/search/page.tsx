'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { List, Map as MapIcon, MessageSquarePlus, SearchX, SlidersHorizontal } from 'lucide-react';
import {
  useSearchHostels,
  type SearchFilters as Filters,
} from '@findyourhostel/shared/features/student';
import { SearchFilters } from '@/components/search/SearchFilters';
import { HostelResultCard } from '@/components/search/HostelResultCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

// Leaflet touches `window`, so the map is client-only.
const HostelMap = dynamic(() => import('@/components/search/HostelMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-background-secondary" />,
});

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>({ sort: 'relevance' });
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = useSearchHostels(filters);

  // Count applied filters (everything beyond the default sort) for the mobile button badge.
  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v != null && v !== '' && !(k === 'sort' && v === 'relevance')
  ).length;

  const center = useMemo<[number, number] | undefined>(
    () => (filters.lat != null && filters.lng != null ? [filters.lat, filters.lng] : undefined),
    [filters.lat, filters.lng]
  );

  const results = search.data ?? [];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Search hostels"
        subtitle="Find a verified seat near your institution."
      >
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-foreground-muted">
            {search.isLoading
              ? 'Searching…'
              : `${results.length} hostel${results.length === 1 ? '' : 's'} found`}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {/* Mobile filter trigger — inline sidebar takes over at lg. */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-bold text-primary">
                  {activeCount}
                </span>
              )}
            </Button>
            <div className="inline-flex gap-1 rounded-2xl border border-border bg-background-secondary/80 p-1">
            {(['list', 'map'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold capitalize transition',
                  view === v
                    ? 'bg-card text-primary shadow-[0_1px_8px_rgba(15,23,42,0.08)]'
                    : 'text-foreground-muted hover:text-foreground-secondary'
                )}
              >
                {v === 'list' ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                {v}
              </button>
            ))}
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Inline sidebar on laptop+, bottom sheet on smaller screens. */}
        <div className="hidden h-max rounded-[24px] border border-border bg-card p-5 lg:block">
          <SearchFilters filters={filters} onChange={setFilters} />
        </div>

        <section>
          {view === 'map' ? (
            <div className="h-[60svh] overflow-hidden rounded-[24px] border border-border lg:h-[70vh]">
              <HostelMap hostels={results} center={center} />
            </div>
          ) : search.isLoading ? (
            <SkeletonList count={4} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No hostels match your filters"
              description="Try widening your search — increase the price range or clear a filter. Or ask hostels directly: post what you need and let owners send you offers."
              action={
                <Button asChild>
                  <Link href="/requests/new">
                    <MessageSquarePlus className="h-4 w-4" />
                    Ask hostels for offers
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {results.map((h) => (
                <HostelResultCard key={h.id} hostel={h} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile / tablet filter sheet */}
      <BottomSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filters"
        footer={
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            Show {results.length} result{results.length === 1 ? '' : 's'}
          </Button>
        }
      >
        <SearchFilters filters={filters} onChange={setFilters} />
      </BottomSheet>
    </div>
  );
}
