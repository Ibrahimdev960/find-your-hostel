'use client';

import { useState } from 'react';
import { useSubmitPayment } from '@findyourhostel/shared/hooks';
import { formatCurrency, PAYMENT_METHOD_LABEL, PAYMENT_STAGE_LABEL } from '@findyourhostel/shared';
import type { PaymentMethod, PaymentStage } from '@findyourhostel/shared';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const METHODS: PaymentMethod[] = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'];

/** Student-facing form to submit an advance/balance payment with an optional screenshot. */
export function PaymentForm({
  bookingId,
  stage,
  amount,
}: {
  bookingId: string;
  stage: PaymentStage;
  amount: number;
}) {
  const submit = useSubmitPayment();
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let proofUrl: string | null = null;
    if (file) {
      try {
        setUploading(true);
        proofUrl = await uploadFile('payment-proofs', bookingId, stage, file);
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    submit.mutate({ booking_id: bookingId, stage, method, proof_url: proofUrl });
  };

  const busy = uploading || submit.isPending;

  return (
    <form onSubmit={onSubmit} className="space-y-3 border-t border-neutral-200 pt-3">
      <p className="text-sm text-neutral-700">
        Submit your <strong>{PAYMENT_STAGE_LABEL[stage]}</strong> payment of{' '}
        <strong>{formatCurrency(amount)}</strong>.
      </p>
      <Field label="Payment method" htmlFor={`pm-${stage}`}>
        <Select id={`pm-${stage}`} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_METHOD_LABEL[m]}
            </option>
          ))}
        </Select>
      </Field>
      {method !== 'cash' && (
        <Field label="Payment screenshot" htmlFor={`proof-${stage}`} hint="Upload proof of transfer.">
          <Input
            id={`proof-${stage}`}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
      )}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit payment'}
      </Button>
    </form>
  );
}
