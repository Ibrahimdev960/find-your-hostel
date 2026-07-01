'use client';

import { useState } from 'react';
import { useAdminBookings } from '@findyourhostel/shared/hooks';
import type { BookingStatus } from '@findyourhostel/shared';
import { BOOKING_STATUS_LABEL, SEAT_TYPE_LABEL, formatRent, formatDate } from '@findyourhostel/shared';

const FILTERS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'moved_in', label: 'Moved in' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Admin · Bookings monitor (M13) — read-only platform-wide bookings feed. */
export default function BookingsPage() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const bookings = useAdminBookings(status === 'all' ? undefined : status);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Read-only monitor of every booking on the platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === f.value
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : bookings.data?.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          No bookings in this state.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Hostel</th>
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Owner</th>
                <th className="px-4 py-2 font-medium">Seat</th>
                <th className="px-4 py-2 font-medium">Rent</th>
                <th className="px-4 py-2 font-medium">Move-in</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.data?.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-2 font-medium text-neutral-900">
                    {b.hostel_name || '—'}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">{b.student_name || '—'}</td>
                  <td className="px-4 py-2 text-neutral-600">{b.owner_name || '—'}</td>
                  <td className="px-4 py-2 text-neutral-600">{SEAT_TYPE_LABEL[b.occupancy]}</td>
                  <td className="px-4 py-2 text-neutral-600">{formatRent(b.effective_rent)}</td>
                  <td className="px-4 py-2 text-neutral-500">{formatDate(b.move_in_date)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700">
                      {BOOKING_STATUS_LABEL[b.status]}
                    </span>
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
