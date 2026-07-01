'use client';

import { useState } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { uploadFile } from '@/lib/upload';
import { cn } from '@/lib/cn';

/**
 * Uploads a single verification document to the private `owner-documents` bucket
 * and reports the stored path back via onUploaded. Shows inline progress/done.
 */
export function DocumentUpload({
  userId,
  fieldKey,
  label,
  value,
  error,
  onUploaded,
}: {
  userId: string;
  fieldKey: string;
  label: string;
  value?: string;
  error?: string;
  onUploaded: (path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFailed(null);
    try {
      const path = await uploadFile('owner-documents', userId, fieldKey, file);
      onUploaded(path);
    } catch (err) {
      setFailed((err as Error).message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground-secondary">{label}</span>
      <label
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm',
          value ? 'border-success/50 bg-success/5 text-foreground-secondary' : 'border-border text-foreground-muted',
          busy && 'opacity-60'
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : value ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{busy ? 'Uploading…' : value ? 'Uploaded — replace' : 'Choose a file (image or PDF)'}</span>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onChange}
          disabled={busy}
        />
      </label>
      {(failed || error) && <p className="text-xs text-error">{failed ?? error}</p>}
    </div>
  );
}
