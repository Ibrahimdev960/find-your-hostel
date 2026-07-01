import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

/**
 * Marketing shell (landing-plan.md §6) — the public front-door frame: slim top
 * bar + footer, and crucially NO app sidebar. Route groups don't change URLs, so
 * `/` still resolves here. Public browsing pages can adopt this shell later.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
