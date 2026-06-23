'use client';

import { useState } from 'react';
import { useReports, useResolveReport } from '@findyourhostel/shared/hooks';
import type { ReportStatus } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';

const FILTERS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
];

/** Admin · Reports moderation queue (M9/M13). */
export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending');
  const reports = useReports(filter === 'all' ? undefined : filter);
  const resolve = useResolveReport();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <p className="mt-1 text-sm text-neutral-600">Review flagged content and resolve or dismiss reports.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f.value ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {reports.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : reports.data?.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          No reports here. 🎉
        </div>
      ) : (
        <div className="space-y-3">
          {reports.data?.map((r) => (
            <div key={r.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {r.target_type} · <span className="font-mono text-xs text-neutral-500">{r.target_id}</span>
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">{r.reason}</p>
                  <p className="mt-1 text-xs text-neutral-400">Status: {r.status}</p>
                </div>
                {(r.status === 'pending' || r.status === 'reviewing') && (
                  <div className="flex flex-shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => resolve.mutate({ id: r.id, status: 'resolved' })}
                      disabled={resolve.isPending}
                    >
                      Resolve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolve.mutate({ id: r.id, status: 'dismissed' })}
                      disabled={resolve.isPending}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
