'use client';

import Link from 'next/link';
import { Search, Check, MapPin, Star, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';

const TRUST = ['Verified owners', 'Refundable deposit', 'Free to browse'];

/**
 * Landing hero (landing-plan.md §1). Signed-out: value prop + one solid primary
 * CTA (Get started) + a low-commitment secondary (Search hostels) + trust strip,
 * with a product mock. Signed-in: a compact "welcome back" variant routed by role.
 */
export function Hero() {
  const { user, isLoading } = useAuthStore();

  if (!isLoading && user) return <WelcomeBack role={user.role ?? 'student'} />;

  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="text-center lg:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Student hostel marketplace
        </p>
        <h1 className="mx-auto mt-3 max-w-xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:mx-0">
          Find a verified hostel seat near your campus
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-foreground-muted sm:text-lg lg:mx-0">
          Search hostels, book a seat with a small deposit, or ask hostels to send you offers —
          free to browse, no account needed to look.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <Button asChild size="lg">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search">
              <Search className="h-4 w-4" /> Search hostels
            </Link>
          </Button>
        </div>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
          {TRUST.map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-sm text-foreground-secondary">
              <Check className="h-4 w-4 text-success" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <ProductMock />
    </section>
  );
}

/** Compact signed-in hero — routes the returning user to their surface by role. */
function WelcomeBack({ role }: { role: string }) {
  const isOwner = role === 'owner';
  return (
    <section className="rounded-[24px] border border-border bg-card p-6 shadow-[0_22px_70px_-58px_rgba(15,23,42,0.55)] sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Welcome back</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {isOwner ? 'Manage your hostels' : 'Ready to find your hostel?'}
      </h1>
      <div className="mt-5 flex flex-wrap gap-3">
        {isOwner ? (
          <>
            <Button asChild size="lg">
              <Link href="/owner">Owner dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/owner/bookings">Bookings</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/search">
                <Search className="h-4 w-4" /> Search hostels
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/bookings">My bookings</Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Product mock — an on-brand, token-only preview of the search experience
 * (list + map). Pure markup, no data or images; conveys "what you'll get".
 */
function ProductMock() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_22px_70px_-48px_rgba(15,23,42,0.6)]">
        {/* Faux map strip */}
        <div className="relative h-28 bg-gradient-to-br from-primary/15 via-background-secondary to-background-tertiary">
          <span className="absolute left-6 top-8 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="absolute right-10 top-14 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary shadow ring-1 ring-border">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <span className="absolute left-1/2 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-card text-primary shadow ring-1 ring-border">
            <MapPin className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Faux result cards */}
        <div className="space-y-3 p-4">
          {[
            { name: 'Green Valley Hostel', meta: 'Boys · near UET', price: 'Rs 12,000', boosted: true },
            { name: 'City Comfort Hostel', meta: 'Girls · near PU', price: 'Rs 9,500', boosted: false },
          ].map((h) => (
            <div key={h.name} className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/25 to-background-tertiary" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                  {h.boosted && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      Boosted
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-foreground-muted">{h.meta}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-muted">
                  <Star className="h-3 w-3 fill-warning text-warning" /> 4.6
                  <span className="ml-2 font-semibold text-foreground">{h.price}/mo</span>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2 text-xs text-foreground-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified listings only
          </div>
        </div>
      </div>
    </div>
  );
}
