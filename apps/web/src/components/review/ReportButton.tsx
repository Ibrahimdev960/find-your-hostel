'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useCreateReport } from '@findyourhostel/shared/hooks';
import { createReportSchema } from '@findyourhostel/shared/api';
import { useAuthStore, parseZodErrors } from '@findyourhostel/shared';
import type { ReportTargetType } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/** Small inline reporter for any flaggable target. Hidden for signed-out users. */
export function ReportButton({
  targetType,
  targetId,
  label = 'Report',
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const user = useAuthStore((s) => s.user);
  const report = useCreateReport();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();

  if (!user) return null;

  const submit = () => {
    const parsed = createReportSchema.safeParse({ target_type: targetType, target_id: targetId, reason });
    if (!parsed.success) {
      setError(parseZodErrors(parsed.error).reason);
      return;
    }
    setError(undefined);
    report.mutate(parsed.data, {
      onSuccess: () => {
        setOpen(false);
        setReason('');
      },
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-error"
      >
        <Flag className="h-3 w-3" /> {label}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-border p-2">
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What’s the problem?"
        className="min-h-16 text-sm"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={report.isPending}>
          Send report
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
