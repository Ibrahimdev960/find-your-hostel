import { BadgeCheck, Wallet, HandCoins, Flag, type LucideIcon } from 'lucide-react';

const TILES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheck,
    title: 'Verified owners & listings',
    body: 'Owners prove who they are and each listing is approved before students can book it.',
  },
  {
    icon: Wallet,
    title: 'Refundable deposit',
    body: 'You only pay a small deposit to reserve. The security deposit is returned when you leave.',
  },
  {
    icon: HandCoins,
    title: 'Pay the owner directly',
    body: 'Payments go straight to the owner — Find Your Hostel never holds your money.',
  },
  {
    icon: Flag,
    title: 'Report & block',
    body: 'Something feels off? Report a listing or block anyone — our team reviews reports.',
  },
];

/**
 * Trust & safety (landing-plan.md §4) — the money-fear killer. Explicit for a
 * low-trust, money-sensitive audience (flow-audit §7.4).
 */
export function TrustGrid() {
  return (
    <section aria-labelledby="trust-heading">
      <div className="text-center">
        <h2 id="trust-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Built to feel safe
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-foreground-muted">
          Renting sight-unseen is stressful. Here’s how we lower the risk.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <t.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm leading-6 text-foreground-muted">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
