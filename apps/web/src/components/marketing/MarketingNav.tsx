'use client';

import Link from 'next/link';
import { Building, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { HomeNav } from '@/components/HomeNav';

/**
 * Slim, sticky marketing top bar (landing-plan.md §0/§4). Brand on the left,
 * auth-aware actions (`HomeNav`) + theme toggle on the right. Client because it
 * reads the theme; the rest of the marketing page stays server-rendered.
 */
export function MarketingNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Find Your Hostel — home">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-foreground">Find Your Hostel</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground-muted transition hover:bg-background-secondary hover:text-foreground coarse:h-11 coarse:w-11"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <HomeNav />
        </div>
      </div>
    </header>
  );
}
