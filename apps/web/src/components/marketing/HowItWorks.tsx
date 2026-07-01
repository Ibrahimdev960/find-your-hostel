import { MapPin, ShieldCheck, MessagesSquare, type LucideIcon } from 'lucide-react';

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MapPin,
    title: 'Search near your college',
    body: 'Filter by area, price, room type, and what’s included — on a live map.',
  },
  {
    icon: ShieldCheck,
    title: 'Book a verified seat',
    body: 'Reserve a seat with a small refundable deposit — owners and listings are approved.',
  },
  {
    icon: MessagesSquare,
    title: 'Chat & move in',
    body: 'Message owners, or ask hostels and let offers come to you.',
  },
];

/** How it works (landing-plan.md §3) — three plain, numbered steps for students. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading">
      <div className="text-center">
        <h2 id="how-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground-muted">
          Three simple steps from search to move-in.
        </p>
      </div>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-bold text-primary">Step {i + 1}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm text-foreground-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
