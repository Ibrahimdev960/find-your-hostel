import Link from 'next/link';
import { ClipboardList, BadgeCheck, CalendarCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ClipboardList, title: 'List in minutes', body: 'A simple step-by-step wizard — rooms, pricing, photos, done.' },
  { icon: BadgeCheck, title: 'Get approved', body: 'Verify once, then publish your hostel to students.' },
  { icon: CalendarCheck, title: 'Manage everything', body: 'Bookings, payments, and messages in one dashboard.' },
  { icon: Sparkles, title: 'Boost when you want', body: 'Pay to show a listing higher in search and fill seats faster.' },
];

/** Owner band (landing-plan.md §6) — benefit band that balances the student-heavy top. */
export function OwnerBand() {
  return (
    <section
      aria-labelledby="owner-heading"
      className="overflow-hidden rounded-[24px] border border-border bg-background-secondary/50 p-6 sm:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">For owners</p>
          <h2 id="owner-heading" className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Own a hostel? Fill your seats.
          </h2>
          <p className="mt-3 max-w-md text-sm text-foreground-muted">
            List your hostel, get approved, and reach students searching near your area — with
            bookings and payments handled in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup?role=owner">List your hostel</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/owner">Owner dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
