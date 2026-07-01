import Link from 'next/link';
import { Building } from 'lucide-react';

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'For students',
    links: [
      { label: 'Search hostels', href: '/search' },
      { label: 'Ask hostels for offers', href: '/requests/new' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'For owners',
    links: [
      { label: 'List your hostel', href: '/signup?role=owner' },
      { label: 'Owner dashboard', href: '/owner' },
      { label: 'Boost a listing', href: '/owner/promotions' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Get started', href: '/signup' },
      { label: 'Sign in', href: '/login' },
    ],
  },
];

/** Marketing footer (landing-plan.md §10) — grouped links + brand + copyright. */
export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground">Find Your Hostel</span>
          </Link>
          <p className="mt-3 max-w-[16rem] text-sm text-foreground-muted">
            Verified student hostels — search, book a seat, or ask hostels to send you offers.
          </p>
        </div>

        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground-muted">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground-secondary transition hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-foreground-muted sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Find Your Hostel. Built for students.
        </div>
      </div>
    </footer>
  );
}
