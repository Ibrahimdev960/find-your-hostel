import { SmokeTest } from '@/components/SmokeTest';
import { HomeNav } from '@/components/HomeNav';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-600">Find Your Hostel</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
            Find a student hostel seat near you
          </h1>
          <p className="mt-2 text-neutral-600">
            Search hostels, book per seat, or list your hostel as an owner.
          </p>
        </div>
        <HomeNav />
      </header>
      <a
        href="/search"
        className="rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-brand-700"
      >
        Search hostels →
      </a>
      <SmokeTest />
    </main>
  );
}
