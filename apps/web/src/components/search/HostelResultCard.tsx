import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Sparkles } from 'lucide-react';
import type { SearchHostelCard } from '@findyourhostel/shared/features/student';
import { formatRent } from '@findyourhostel/shared';
import { trackPromotionEvent } from '@findyourhostel/shared/api';

const TYPE_LABEL: Record<string, string> = { boys: 'Boys', girls: 'Girls', co_living: 'Co-living' };

export function HostelResultCard({ hostel }: { hostel: SearchHostelCard }) {
  return (
    <Link
      href={`/hostels/${hostel.id}`}
      onClick={() => {
        if (hostel.is_featured) void trackPromotionEvent(hostel.id, 'click');
      }}
      className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-background-secondary">
        {hostel.cover_image_url ? (
          <Image
            src={hostel.cover_image_url}
            alt={hostel.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-foreground-muted">
            No photo
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {hostel.is_featured && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-xs font-semibold text-warning">
              <Sparkles className="h-3 w-3" /> Boosted
            </span>
          )}
          <h3 className="truncate font-semibold text-foreground">{hostel.name}</h3>
          <span className="rounded-full bg-background-secondary px-1.5 py-0.5 text-xs text-foreground-muted">
            {TYPE_LABEL[hostel.hostel_type] ?? hostel.hostel_type}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-foreground-muted">
          <MapPin className="h-3.5 w-3.5" />
          {[hostel.nearest_institution, hostel.city].filter(Boolean).join(' · ') || 'Location n/a'}
          {hostel.distance_km != null && (
            <span className="text-foreground-muted"> · {hostel.distance_km.toFixed(1)} km</span>
          )}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-primary">
            {hostel.cheapest_rent != null ? formatRent(hostel.cheapest_rent) : 'Price on request'}
          </span>
          {hostel.review_count > 0 && (
            <span className="flex items-center gap-1 text-sm text-foreground-secondary">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {hostel.avg_rating.toFixed(1)} ({hostel.review_count})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
