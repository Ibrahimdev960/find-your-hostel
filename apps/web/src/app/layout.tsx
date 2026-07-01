import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/providers';
import { themeNoFlashScript } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Find Your Hostel',
  description: 'Find and book student hostel seats near your institution.',
};

// `viewport-fit=cover` exposes env(safe-area-inset-*) for notched devices so the
// FAB, sticky footers, sheets, and drawer can respect the home indicator.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
