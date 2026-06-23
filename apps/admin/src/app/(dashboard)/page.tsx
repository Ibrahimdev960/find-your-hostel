import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Admin shell scaffolded. KPI cards, owners, listings, reports land with M13.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {['Owners pending', 'Listings to verify', 'Open reports'].map((label) => (
          <div key={label} className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-neutral-900">—</p>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm">
        Design-system check (cva + cn + Radix Slot)
      </Button>
    </main>
  );
}
