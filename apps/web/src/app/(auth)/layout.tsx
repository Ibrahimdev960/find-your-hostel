import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-100 px-4 py-12">
      <Link href="/" className="mb-6 text-lg font-bold text-brand-700">
        Find Your Hostel
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
