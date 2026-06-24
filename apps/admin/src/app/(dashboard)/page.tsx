'use client';

import Link from 'next/link';
import { useAdminStats } from '@findyourhostel/shared/hooks';

type Card = {
  label: string;
  value: number | undefined;
  hint?: string;
  href?: string;
};

/** Admin · Dashboard KPIs (M13). */
export default function DashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  const primary: Card[] = [
    { label: 'Owners pending', value: data?.owners_pending, href: '/owners' },
    { label: 'Listings to verify', value: data?.listings_pending, href: '/listings' },
    { label: 'Open reports', value: data?.reports_open, href: '/reports' },
    { label: 'Promotions pending', value: data?.promotions_pending, href: '/promotions' },
  ];

  const secondary: Card[] = [
    { label: 'Published listings', value: data?.listings_published },
    {
      label: 'Active bookings',
      value: data?.bookings_active,
      hint: `${data?.bookings_total ?? '—'} total`,
    },
    {
      label: 'Approved owners',
      value: data?.owners_approved,
      hint: `${data?.owners_suspended ?? 0} suspended`,
    },
    { label: 'Total users', value: data?.users_total, hint: `+${data?.new_users_7d ?? 0} this week` },
  ];

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">Platform health at a glance.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-5 text-sm text-danger">
          Couldn’t load stats — admin access required.
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {primary.map((c) => (
              <StatCard key={c.label} card={c} loading={isLoading} accent />
            ))}
          </section>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {secondary.map((c) => (
              <StatCard key={c.label} card={c} loading={isLoading} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

function StatCard({ card, loading, accent }: { card: Card; loading: boolean; accent?: boolean }) {
  const body = (
    <div
      className={`rounded-xl border bg-white p-5 transition-colors ${
        accent ? 'border-brand-200 hover:border-brand-400' : 'border-neutral-200'
      }`}
    >
      <p className="text-sm text-neutral-500">{card.label}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">
        {loading ? '…' : (card.value ?? '—')}
      </p>
      {card.hint && <p className="mt-1 text-xs text-neutral-400">{card.hint}</p>}
    </div>
  );
  return card.href ? <Link href={card.href}>{body}</Link> : body;
}
