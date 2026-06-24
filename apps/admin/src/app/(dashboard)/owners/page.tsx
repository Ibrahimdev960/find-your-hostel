'use client';

import { useState } from 'react';
import {
  useAdminOwners,
  useApproveOwner,
  useRejectOwner,
  useSuspendOwner,
  useReactivateOwner,
} from '@findyourhostel/shared/hooks';
import type { OwnerVerificationStatus } from '@findyourhostel/shared';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const FILTERS: { value: OwnerVerificationStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

const STATUS_TONE: Record<OwnerVerificationStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
  suspended: 'bg-neutral-200 text-neutral-600',
};

/** Admin · Owners verification queue (M13) — approve / reject / suspend / reactivate. */
export default function OwnersPage() {
  const [filter, setFilter] = useState<OwnerVerificationStatus | 'all'>('pending');
  const owners = useAdminOwners(filter === 'all' ? undefined : filter);
  const approve = useApproveOwner();
  const reject = useRejectOwner();
  const suspend = useSuspendOwner();
  const reactivate = useReactivateOwner();

  const viewDoc = async (path: string | null) => {
    if (!path) return;
    const supabase = createClient();
    const { data } = await supabase.storage.from('owner-documents').createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
  };

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Owners — verification</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Approve owners to let them publish listings. Suspend to block a bad actor.
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {owners.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : owners.data?.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          No owners in this state.
        </div>
      ) : (
        <div className="space-y-3">
          {owners.data?.map((o) => (
            <div key={o.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-neutral-900">
                      {o.business_name || o.profile?.full_name || 'Unnamed owner'}
                    </p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_TONE[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">
                    {[o.profile?.full_name, o.city, o.profile?.phone].filter(Boolean).join(' · ') ||
                      'No contact details'}
                  </p>
                  {o.cnic && <p className="mt-0.5 text-xs text-neutral-400">CNIC {o.cnic}</p>}
                  {o.submitted_at && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      Submitted {new Date(o.submitted_at).toLocaleDateString()}
                    </p>
                  )}
                  {o.status === 'rejected' && o.rejection_reason && (
                    <p className="mt-1 text-xs text-danger">Reason: {o.rejection_reason}</p>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {o.cnic_front_url && (
                      <button
                        onClick={() => viewDoc(o.cnic_front_url)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        CNIC front
                      </button>
                    )}
                    {o.cnic_back_url && (
                      <button
                        onClick={() => viewDoc(o.cnic_back_url)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        CNIC back
                      </button>
                    )}
                    {o.ownership_proof_url && (
                      <button
                        onClick={() => viewDoc(o.ownership_proof_url)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Ownership proof
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(o.status === 'pending' || o.status === 'rejected') && (
                      <Button
                        size="sm"
                        onClick={() => approve.mutate(o.id)}
                        disabled={approve.isPending}
                      >
                        Approve
                      </Button>
                    )}
                    {o.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Reason for rejection?');
                          if (reason) reject.mutate({ id: o.id, reason });
                        }}
                        disabled={reject.isPending}
                      >
                        Reject
                      </Button>
                    )}
                    {o.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const reason = prompt('Reason for suspension?');
                          if (reason) suspend.mutate({ id: o.id, reason });
                        }}
                        disabled={suspend.isPending}
                      >
                        Suspend
                      </Button>
                    )}
                    {o.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reactivate.mutate(o.id)}
                        disabled={reactivate.isPending}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
