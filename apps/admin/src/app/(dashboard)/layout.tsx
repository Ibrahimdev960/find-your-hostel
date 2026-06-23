import Link from 'next/link';
import { AdminGuard } from '@/components/AdminGuard';

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/listings', label: 'Listings' },
  { href: '/reports', label: 'Reports' },
  { href: '/promotions', label: 'Promotions' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen">
        <header className="flex items-center gap-6 border-b border-neutral-200 bg-white px-6 py-3">
          <span className="text-sm font-semibold text-brand-700">Find Your Hostel · Admin</span>
          <nav className="flex gap-4 text-sm text-neutral-600">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-neutral-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </AdminGuard>
  );
}
