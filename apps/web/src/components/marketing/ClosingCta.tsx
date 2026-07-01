import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Closing CTA band (landing-plan.md §9) — last chance, one dominant action.
 * Repeats the hero's primary CTA (Get started) with one low-commitment secondary.
 */
export function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="rounded-[24px] border border-primary/20 bg-primary/5 px-6 py-12 text-center sm:px-12 sm:py-16"
    >
      <h2
        id="closing-heading"
        className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        Ready to find your hostel?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground-muted">
        Join free in a minute — search verified hostels or ask hostels to send you offers.
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/search">
            <Search className="h-4 w-4" /> Search hostels
          </Link>
        </Button>
      </div>
    </section>
  );
}
