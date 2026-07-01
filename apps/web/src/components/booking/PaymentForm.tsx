'use client';

import { useState } from 'react';
import { useSubmitPayment } from '@findyourhostel/shared/hooks';
import {
  formatCurrency,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STAGE_PLAIN,
  PAYMENT_STAGE_HINT,
} from '@findyourhostel/shared';
import type { PaymentMethod, PaymentStage } from '@findyourhostel/shared';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const METHODS: PaymentMethod[] = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'];

/**
 * Student-facing payment form, written as three plain numbered steps
 * (flow-audit §8 — highest-stakes form): 1) send the money, 2) take a
 * screenshot, 3) upload it. Cash skips the screenshot.
 */
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

  const isCash = method === 'cash';

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
    <form onSubmit={onSubmit} className="space-y-4 border-t border-border pt-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Pay the {PAYMENT_STAGE_PLAIN[stage].toLowerCase()} — {formatCurrency(amount)}
        </p>
        <p className="text-xs text-foreground-muted">{PAYMENT_STAGE_HINT[stage]}</p>
      </div>

      {/* Step 1 — send the money */}
      <Step n={1} title={isCash ? `Pay ${formatCurrency(amount)} in cash` : `Send ${formatCurrency(amount)} to the owner`}>
        {isCash ? (
          <p>Hand the cash to the owner when you meet. Then mark it below.</p>
        ) : (
          <p>
            Use the bank / JazzCash / Easypaisa details the owner shared with you. Not sure where
            to send it? Message the owner to confirm before you pay.
          </p>
        )}
      </Step>

      {/* Step 2 — screenshot (online only) */}
      {!isCash && (
        <Step n={2} title="Take a screenshot of the payment">
          <p>Your banking or wallet app shows a confirmation screen — save a screenshot of it.</p>
        </Step>
      )}

      {/* Step 3 — record it here */}
      <Step n={isCash ? 2 : 3} title={isCash ? 'Tell us you paid' : 'Upload the screenshot here'}>
        <div className="mt-2 space-y-3">
          <Field label="How did you pay?" htmlFor={`pm-${stage}`}>
            <Select
              id={`pm-${stage}`}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABEL[m]}
                </option>
              ))}
            </Select>
          </Field>
          {!isCash && (
            <Field label="Payment screenshot" htmlFor={`proof-${stage}`} hint="This is how the owner confirms your payment.">
              <Input
                id={`proof-${stage}`}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
          )}
        </div>
      </Step>

      <p className="rounded-xl bg-background-secondary/60 px-3 py-2 text-xs text-foreground-muted">
        Your money goes straight to the owner — Find Your Hostel never holds your payment. Only
        send this after you&apos;ve actually paid.
      </p>

      <Button type="submit" size="sm" disabled={busy || (!isCash && !file)}>
        {busy ? 'Sending…' : isCash ? "I've paid in cash" : "I've paid — send proof"}
      </Button>
    </form>
  );
}

/** One numbered step in the payment instructions. */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <div className="mt-0.5 text-xs text-foreground-muted">{children}</div>
      </div>
    </div>
  );
}
