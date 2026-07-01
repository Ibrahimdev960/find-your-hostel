import Link from 'next/link';
import { Search, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { Panel } from '@/components/ui/panel';

/**
 * Two ways to book (landing-plan.md §5) — names and cross-links the two booking
 * paths so students understand the choice (flow-audit C8) on the landing surface.
 */
export function TwoWaysToBook() {
  return (
    <section aria-labelledby="ways-heading">
      <div className="text-center">
        <h2 id="ways-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Two ways to find your seat
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-foreground-muted">
          Book a hostel you like, or let hostels come to you.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Panel className="gap-4 p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Search className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-semibold text-foreground">Book a listed seat</h3>
          <p className="text-sm text-foreground-muted">
            See a hostel you like? Pick a room type and reserve a seat directly with a small
            deposit.
          </p>
          <Link
            href="/search"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary hover:underline"
          >
            Search hostels <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>

        <Panel className="gap-4 p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageSquarePlus className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-semibold text-foreground">Ask hostels for offers</h3>
          <p className="text-sm text-foreground-muted">
            Can’t find the right one? Post what you need and let approved owners send you offers —
            you pick the best.
          </p>
          <Link
            href="/requests/new"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary hover:underline"
          >
            Ask hostels <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
      </div>
    </section>
  );
}
