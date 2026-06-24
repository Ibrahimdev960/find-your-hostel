'use client';

import { use, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Check } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { useHostelPublic, useTrackHostelView } from '@findyourhostel/shared/features/student';
import { formatRent, formatCurrency, computePriceBreakdown } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageOwnerButton } from '@/components/hostel/MessageOwnerButton';
import { SaveButton } from '@/components/hostel/SaveButton';
import { HostelReviews } from '@/components/review/HostelReviews';
import { ReportButton } from '@/components/review/ReportButton';

const HostelLocationMap = dynamic(() => import('@/components/hostel/HostelLocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" />,
});

const TYPE_LABEL: Record<string, string> = { boys: 'Boys', girls: 'Girls', co_living: 'Co-living' };
const OCC_LABEL: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Quad',
  dormitory: 'Dormitory',
};

export default function HostelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hostel = useHostelPublic(id);
  const { user } = useAuthStore();
  const trackView = useTrackHostelView();

  // Record the view for recommendations (students only; server ignores others).
  const trackMutate = trackView.mutate;
  useEffect(() => {
    if (user?.role === 'student' && hostel.data?.id) {
      trackMutate(hostel.data.id);
    }
  }, [user?.role, hostel.data?.id, trackMutate]);

  if (hostel.isLoading) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (hostel.error || !hostel.data) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500">
        This hostel isn’t available.{' '}
        <Link href="/search" className="text-brand-600 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const h = hostel.data;
  const seats = [...h.seat_types].sort((a, b) => Number(a.monthly_rent) - Number(b.monthly_rent));
  const gallery = h.hostel_images ?? [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link href="/search" className="text-sm text-brand-600 hover:underline">
        ← Back to search
      </Link>

      {/* Gallery */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-xl bg-neutral-100">
          {h.cover_image_url || gallery[0] ? (
            <Image
              src={h.cover_image_url ?? gallery[0]!.url}
              alt={h.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No photos yet
            </div>
          )}
        </div>
        <div className="grid grid-rows-2 gap-2">
          {gallery.slice(0, 2).map((img) => (
            <div key={img.id} className="relative overflow-hidden rounded-xl bg-neutral-100">
              <Image src={img.url} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{h.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="h-4 w-4" />
            {[h.address, h.city, h.nearest_institution].filter(Boolean).join(' · ') || 'Location n/a'}
          </p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-700">
              {TYPE_LABEL[h.hostel_type] ?? h.hostel_type}
            </span>
            {h.review_count > 0 && (
              <span className="flex items-center gap-1 text-neutral-600">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {h.avg_rating.toFixed(1)} ({h.review_count} reviews)
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <SaveButton hostelId={h.id} />
          <MessageOwnerButton ownerId={h.owner_id} hostelId={h.id} />
        </div>
      </div>

      {h.description && <p className="mt-4 text-neutral-700">{h.description}</p>}

      {/* Seat types */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Seat types & pricing</h2>
        <div className="space-y-3">
          {seats.map((s) => {
            const price = computePriceBreakdown(Number(s.monthly_rent), Number(s.discount_percent) / 100);
            return (
              <Card key={s.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {OCC_LABEL[s.occupancy] ?? s.occupancy}
                      <span className="ml-2 text-xs text-neutral-500">
                        {s.is_ac ? 'AC' : 'Non-AC'}
                        {s.attached_bath ? ' · Attached bath' : ''}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {formatRent(price.monthlyRent)} · advance {formatCurrency(price.advance)} ·{' '}
                      {s.total_seats} seat{s.total_seats === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/hostels/${h.id}/book?seat=${s.id}`}>Book a seat</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {seats.length === 0 && <p className="text-sm text-neutral-500">No seat types listed.</p>}
        </div>
      </section>

      {/* Facilities */}
      {h.facilities.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Facilities</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {h.facilities.map((f) => (
              <span key={f.id} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="h-4 w-4 text-success" /> {f.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Rules */}
      {(h.house_rules || h.curfew || h.meal_plan) && (
        <section className="mt-8 space-y-1 text-sm text-neutral-700">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">House rules</h2>
          {h.curfew && <p>Curfew / timings: {h.curfew}</p>}
          {h.meal_plan && <p>Meals: {h.meal_plan}</p>}
          {h.house_rules && <p className="whitespace-pre-line">{h.house_rules}</p>}
        </section>
      )}

      {/* Location */}
      {h.latitude != null && h.longitude != null && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Location</h2>
          <div className="h-64 overflow-hidden rounded-xl border border-neutral-200">
            <HostelLocationMap lat={h.latitude} lng={h.longitude} label={h.name} />
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Reviews</h2>
        <HostelReviews hostelId={h.id} ownerId={h.owner_id} />
      </section>

      <div className="mt-8 border-t border-neutral-100 pt-4">
        <ReportButton targetType="hostel" targetId={h.id} label="Report this listing" />
      </div>
    </main>
  );
}
