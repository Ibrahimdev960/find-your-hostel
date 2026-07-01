import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminGuard } from '@/components/AdminGuard';
import { createClient } from '@/lib/supabase/server';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/owners', label: 'Owners' },
  { href: '/listings', label: 'Listings' },
  { href: '/users', label: 'Users' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/content', label: 'Content' },
  { href: '/reports', label: 'Reports' },
  { href: '/promotions', label: 'Promotions' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side enforcement (defence-in-depth beyond the client AdminGuard + RLS):
  // no admin session → bounce to login before any admin UI renders.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/login');

  return (
    <AdminGuard>
      <div className="min-h-screen">
        <header className="flex flex-col gap-2 border-b border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <span className="shrink-0 text-sm font-semibold text-brand-700">
            Find Your Hostel · Admin
          </span>
          <nav className="-mx-4 flex gap-4 overflow-x-auto whitespace-nowrap px-4 text-sm text-neutral-600 sm:mx-0 sm:px-0">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 hover:text-neutral-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </AdminGuard>
  );
}
