'use client';

import { useState } from 'react';
import { useAdminUsers, useSetUserSuspended } from '@findyourhostel/shared/hooks';
import type { UserRole } from '@findyourhostel/shared';
import { formatDate } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';

const ROLE_FILTERS: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Students' },
  { value: 'owner', label: 'Owners' },
  { value: 'admin', label: 'Admins' },
];

const ROLE_TONE: Record<UserRole, string> = {
  student: 'bg-brand-100 text-brand-700',
  owner: 'bg-success/10 text-success',
  admin: 'bg-neutral-800 text-white',
};

/** Admin · Users management (M13) — search, filter by role, suspend / reactivate. */
export default function UsersPage() {
  const [role, setRole] = useState<UserRole | 'all'>('all');
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const users = useAdminUsers({
    role: role === 'all' ? undefined : role,
    search: search || undefined,
  });
  const setSuspended = useSetUserSuspended();

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <p className="mt-1 text-sm text-neutral-600">Search accounts and suspend bad actors.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setRole(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              role === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(term.trim());
          }}
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Name, phone, institution…"
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
          />
          <Button size="sm" variant="outline" type="submit">
            Search
          </Button>
        </form>
      </div>

      {users.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : users.data?.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          No users match.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Contact</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.data?.map((u) => (
                <tr key={u.id} className={u.suspended ? 'bg-danger/5' : undefined}>
                  <td className="px-4 py-2 font-medium text-neutral-900">
                    {u.full_name || <span className="text-neutral-400">—</span>}
                    {u.institution && (
                      <span className="block text-xs text-neutral-400">{u.institution}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${ROLE_TONE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{u.phone || '—'}</td>
                  <td className="px-4 py-2 text-neutral-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-2">
                    {u.suspended ? (
                      <span className="rounded bg-danger/10 px-1.5 py-0.5 text-xs font-medium text-danger">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-xs text-success">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {u.role !== 'admin' &&
                      (u.suspended ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={setSuspended.isPending}
                          onClick={() =>
                            setSuspended.mutate({ userId: u.id, suspended: false })
                          }
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={setSuspended.isPending}
                          onClick={() => {
                            const reason = prompt('Reason for suspension?');
                            if (reason)
                              setSuspended.mutate({ userId: u.id, suspended: true, reason });
                          }}
                        >
                          Suspend
                        </Button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
