import { ChevronDown } from 'lucide-react';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is it free to use?',
    a: 'Yes — searching and browsing hostels is completely free, and you don’t even need an account to look. You only pay a hostel’s deposit when you book a seat.',
  },
  {
    q: 'How does the deposit work?',
    a: 'To reserve a seat you pay a small booking deposit (20% of the first month). You pay the rest of the rent plus a refundable security deposit when you move in — and the security deposit is returned when you leave.',
  },
  {
    q: 'Are the owners real and verified?',
    a: 'Owners prove who they are and each listing is approved before it goes live, so you only see verified hostels. You can also report or block anyone.',
  },
  {
    q: 'What if I can’t find the right hostel?',
    a: 'Post a request describing what you need — area, budget, room type — and approved owners send you offers. You pick the one you like; the rest are declined automatically.',
  },
  {
    q: 'How do owners get paid?',
    a: 'Payments go directly to the owner (bank transfer, JazzCash, Easypaisa, or cash). Find Your Hostel never holds your money — you send the owner proof and they confirm it.',
  },
];

/**
 * FAQ (landing-plan.md §8) — plain-language objection handling + SEO. Uses native
 * <details>/<summary> so it's accessible and needs no client JS.
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Questions, answered
        </h2>
      </div>

      <div className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-border bg-card px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-foreground-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-6 text-foreground-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
