import Link from 'next/link';
import { GraduationCap, Building2, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';

/**
 * Audience split (landing-plan.md §2) — two big cards so students and owners
 * self-route in one click, each with its own single primary CTA.
 */
export function AudienceSplit() {
  return (
    <section aria-labelledby="audience-heading">
      <h2 id="audience-heading" className="sr-only">
        Choose how you want to use Find Your Hostel
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel className="gap-5 p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Looking for a hostel?</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Find a verified seat near your college and book it in minutes.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-foreground-secondary">
            {['Search verified hostels near you', 'Book a seat with a small refundable deposit', 'Or ask hostels and let offers come to you'].map(
              (t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {t}
                </li>
              )
            )}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <Button asChild>
              <Link href="/search">
                <Search className="h-4 w-4" /> Search hostels
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/signup">Create a free account</Link>
            </Button>
          </div>
        </Panel>

        <Panel className="gap-5 p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Own a hostel?</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              List your hostel, get approved, and start filling seats.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-foreground-secondary">
            {['List your hostel in a simple step-by-step wizard', 'Get approved, then go live to students', 'Manage bookings, payments, and boosts in one place'].map(
              (t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {t}
                </li>
              )
            )}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
            <Button asChild>
              <Link href="/signup?role=owner">List your hostel</Link>
            </Button>
            <span className="text-xs text-foreground-muted">Free to list · approval required</span>
          </div>
        </Panel>
      </div>
    </section>
  );
}
