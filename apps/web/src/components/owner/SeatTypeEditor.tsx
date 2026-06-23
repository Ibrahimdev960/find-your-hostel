'use client';

import { Trash2, Plus } from 'lucide-react';
import type { SeatTypeInput } from '@findyourhostel/shared/features/owner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';

const OCCUPANCIES: SeatTypeInput['occupancy'][] = [
  'single',
  'double',
  'triple',
  'quad',
  'dormitory',
];

export function emptySeatType(): SeatTypeInput {
  return {
    occupancy: 'single',
    monthly_rent: 0,
    total_seats: 1,
    is_ac: false,
    attached_bath: false,
    discount_percent: 0,
  };
}

export function SeatTypeEditor({
  rows,
  onChange,
  error,
}: {
  rows: SeatTypeInput[];
  onChange: (rows: SeatTypeInput[]) => void;
  error?: string;
}) {
  function update(i: number, patch: Partial<SeatTypeInput>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">Seat type {i + 1}</span>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-neutral-400 hover:text-danger"
                aria-label="Remove seat type"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Occupancy">
              <Select
                value={row.occupancy}
                onChange={(e) => update(i, { occupancy: e.target.value as SeatTypeInput['occupancy'] })}
              >
                {OCCUPANCIES.map((o) => (
                  <option key={o} value={o}>
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Monthly rent (PKR)">
              <Input
                type="number"
                min={0}
                value={row.monthly_rent}
                onChange={(e) => update(i, { monthly_rent: Number(e.target.value) })}
              />
            </Field>
            <Field label="Total seats">
              <Input
                type="number"
                min={1}
                value={row.total_seats}
                onChange={(e) => update(i, { total_seats: Number(e.target.value) })}
              />
            </Field>
            <Field label="Discount %">
              <Input
                type="number"
                min={0}
                max={50}
                value={row.discount_percent}
                onChange={(e) => update(i, { discount_percent: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-neutral-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={row.is_ac}
                onChange={(e) => update(i, { is_ac: e.target.checked })}
              />
              AC
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={row.attached_bath}
                onChange={(e) => update(i, { attached_bath: e.target.checked })}
              />
              Attached bath
            </label>
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-danger">{error}</p>}

      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, emptySeatType()])}>
        <Plus className="h-4 w-4" /> Add seat type
      </Button>
    </div>
  );
}
