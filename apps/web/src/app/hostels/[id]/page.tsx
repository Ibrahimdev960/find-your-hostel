'use client';

import { use, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star, Check } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { useHostelPublic, useTrackHostelView } from '@findyourhostel/shared/features/student';
import {
  formatRent,
  formatCurrency,
  computePriceBreakdown,
  HOSTEL_TYPE_PLAIN,
  SEAT_TYPE_LABEL,
} from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { MessageOwnerButton } from '@/components/hostel/MessageOwnerButton';
import { SaveButton } from '@/components/hostel/SaveButton';
import { HostelReviews } from '@/components/review/HostelReviews';
import { ReportButton } from '@/components/review/ReportButton';

const HostelLocationMap = dynamic(() => import('@/components/hostel/HostelLocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-background-secondary" />,
});


export default function HostelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hostel = useHostelPublic(id);
  const { user } = useAuthStore();
  const trackView = useTrackHostelView();

  const trackMutate = trackView.mutate;
  useEffect(() => {
    if (user?.role === 'student' && hostel.data?.id) {
      trackMutate(hostel.data.id);
    }
  }, [user?.role, hostel.data?.id, trackMutate]);

  const h = hostel.data;
  const seats = h ? [...h.seat_types].sort((a, b) => Number(a.monthly_rent) - Number(b.monthly_rent)) : [];
  const gallery = h?.hostel_images ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <Link
          href="/search"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary transition hover:bg-background-secondary"
          aria-label="Back to search"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="truncate text-sm font-semibold text-foreground">{h?.name ?? 'Hostel'}</span>
        {h && (
          <div className="ml-auto flex items-center gap-2">
            <SaveButton hostelId={h.id} />
            <MessageOwnerButton ownerId={h.owner_id} hostelId={h.id} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {hostel.isLoading ? (
          <div className="h-96 animate-pulse rounded-[24px] bg-background-secondary" />
        ) : hostel.error || !h ? (
          <Panel className="items-center px-6 py-12 text-center">
            <p className="text-sm text-foreground-muted">
              This hostel isn&apos;t available.{' '}
              <Link href="/search" className="text-primary hover:underline">
                Back to search
              </Link>
            </p>
          </Panel>
        ) : (
          <>
            {/* Gallery — single hero on mobile, 3-tile split on sm+ */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-background-secondary sm:col-span-2">
                {h.cover_image_url || gallery[0] ? (
                  <Image
                    src={h.cover_image_url ?? gallery[0]!.url}
                    alt={h.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-foreground-muted">
                    No photos yet
                  </div>
                )}
              </div>
              <div className="hidden grid-rows-2 gap-2 sm:grid">
                {gallery.slice(0, 2).map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-2xl bg-background-secondary">
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-foreground">{h.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-foreground-muted">
                <MapPin className="h-4 w-4" />
                {[h.address, h.city, h.nearest_institution].filter(Boolean).join(' · ') || 'Location n/a'}
              </p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <Badge tone="neutral">
                  {HOSTEL_TYPE_PLAIN[h.hostel_type as keyof typeof HOSTEL_TYPE_PLAIN] ?? h.hostel_type}
                </Badge>
                {h.review_count > 0 && (
                  <span className="flex items-center gap-1 text-foreground-secondary">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {h.avg_rating.toFixed(1)} ({h.review_count} reviews)
                  </span>
                )}
              </div>
            </div>

            {h.description && <p className="mt-4 text-foreground-secondary">{h.description}</p>}

            {/* Seat types */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Room types &amp; pricing</h2>
              <div className="space-y-3">
                {seats.map((s) => {
                  const price = computePriceBreakdown(
                    Number(s.monthly_rent),
                    Number(s.discount_percent) / 100
                  );
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {SEAT_TYPE_LABEL[s.occupancy] ?? s.occupancy}
                          <span className="ml-2 text-xs text-foreground-muted">
                            {s.is_ac ? 'AC' : 'Non-AC'}
                            {s.attached_bath ? ' · Attached bath' : ''}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-foreground-muted">
                          {formatRent(price.monthlyRent)} · deposit {formatCurrency(price.advance)} ·{' '}
                          {s.total_seats} seat{s.total_seats === 1 ? '' : 's'}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/hostels/${h.id}/book?seat=${s.id}`}>Book a seat</Link>
                      </Button>
                    </div>
                  );
                })}
                {seats.length === 0 && (
                  <p className="text-sm text-foreground-muted">No seat types listed.</p>
                )}
              </div>
            </section>

            {/* Facilities */}
            {h.facilities.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-foreground">What&apos;s included</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {h.facilities.map((f) => (
                    <span key={f.id} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <Check className="h-4 w-4 text-success" /> {f.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Rules */}
            {(h.house_rules || h.curfew || h.meal_plan) && (
              <section className="mt-8 space-y-1 text-sm text-foreground-secondary">
                <h2 className="mb-2 text-lg font-semibold text-foreground">House rules</h2>
                {h.curfew && <p>Curfew / timings: {h.curfew}</p>}
                {h.meal_plan && <p>Meals: {h.meal_plan}</p>}
                {h.house_rules && <p className="whitespace-pre-line">{h.house_rules}</p>}
              </section>
            )}

            {/* Location */}
            {h.latitude != null && h.longitude != null && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold text-foreground">Location</h2>
                <div className="h-56 overflow-hidden rounded-[24px] border border-border sm:h-64">
                  <HostelLocationMap lat={h.latitude} lng={h.longitude} label={h.name} />
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Reviews</h2>
              <HostelReviews hostelId={h.id} ownerId={h.owner_id} />
            </section>

            <div className="mt-8 border-t border-border pt-4">
              <ReportButton targetType="hostel" targetId={h.id} label="Report this listing" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
