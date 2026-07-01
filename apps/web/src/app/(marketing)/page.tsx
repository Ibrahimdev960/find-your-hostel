import type { Metadata } from 'next';
import { Hero } from '@/components/marketing/Hero';
import { AudienceSplit } from '@/components/marketing/AudienceSplit';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { TrustGrid } from '@/components/marketing/TrustGrid';
import { TwoWaysToBook } from '@/components/marketing/TwoWaysToBook';
import { OwnerBand } from '@/components/marketing/OwnerBand';
import { Faq } from '@/components/marketing/Faq';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { Reveal } from '@/components/marketing/Reveal';
import { RecommendedRow } from '@/components/search/RecommendedRow';

export const metadata: Metadata = {
  title: 'Find Your Hostel — verified student hostels near your campus',
  description:
    'Search verified student hostels, book a seat with a small refundable deposit, or ask hostels to send you offers. Free to browse — no account needed to look.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Find Your Hostel — verified student hostels near your campus',
    description:
      'Search verified hostels, book a seat with a small deposit, or ask hostels to send you offers.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

// Organization/WebSite structured data for richer search results.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Find Your Hostel',
  description: 'Verified student hostel marketplace — search, book per seat, or request offers.',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Hero />
        <RecommendedRow />
        <Reveal>
          <AudienceSplit />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <TrustGrid />
        </Reveal>
        <Reveal>
          <TwoWaysToBook />
        </Reveal>
        <Reveal>
          <OwnerBand />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <ClosingCta />
        </Reveal>
      </div>
    </>
  );
}
