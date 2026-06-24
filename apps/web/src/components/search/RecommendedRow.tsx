'use client';

import { useAuthStore } from '@findyourhostel/shared';
import { useRecommendations } from '@findyourhostel/shared/features/student';
import { HostelResultCard } from './HostelResultCard';

/**
 * "Recommended for you" — personalized listings for the signed-in student (M12).
 * Renders nothing for signed-out visitors, owners, or when there are no results.
 */
export function RecommendedRow({ limit = 6 }: { limit?: number }) {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';
  const { data, isLoading } = useRecommendations(limit, isStudent);

  if (!isStudent) return null;
  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Recommended for you</h2>
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
      </section>
    );
  }
  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-neutral-900">Recommended for you</h2>
      <div className="space-y-3">
        {data.map((hostel) => (
          <HostelResultCard key={hostel.id} hostel={hostel} />
        ))}
      </div>
    </section>
  );
}
