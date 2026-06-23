'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOwnerHostels } from '@findyourhostel/shared/features/owner';
import { useOwnerPromotions, useCreatePromotion } from '@findyourhostel/shared/hooks';
import { createPromotionSchema } from '@findyourhostel/shared/api';
import {
  parseZodErrors,
  formatDate,
  PROMOTION_PLAN_LABEL,
  PROMOTION_STATUS_LABEL,
  promotionStatusTone,
  PAYMENT_METHOD_LABEL,
} from '@findyourhostel/shared';
import type { PromotionPlan, PaymentMethod } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

const PLANS: PromotionPlan[] = ['featured_1d', 'featured_3d', 'featured_7d', 'featured_30d'];
const METHODS: PaymentMethod[] = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'];
const TONE: Record<'success' | 'warning' | 'danger' | 'neutral', string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export default function OwnerPromotionsPage() {
  const { user, isLoading } = useRequireAuth('owner');
  const ownerId = user?.id ?? '';
  const hostels = useOwnerHostels(user?.id);
  const promotions = useOwnerPromotions(user?.id);
  const create = useCreatePromotion(ownerId);

  const [hostelId, setHostelId] = useState('');
  const [plan, setPlan] = useState<PromotionPlan>('featured_7d');
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let proofUrl: string | undefined;
    if (file) {
      try {
        setUploading(true);
        proofUrl = await uploadFile('payment-proofs', ownerId, 'promo', file);
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    const parsed = createPromotionSchema.safeParse({
      hostel_id: hostelId,
      plan,
      payment_method: method,
      proof_url: proofUrl,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    create.mutate(parsed.data, { onSuccess: () => setFile(null) });
  };

  const busy = uploading || create.isPending;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Promotions</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/owner">My hostels</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature a listing</CardTitle>
        </CardHeader>
        <CardContent>
          {hostels.data?.length === 0 ? (
            <p className="text-sm text-neutral-500">List a hostel first to promote it.</p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Hostel" htmlFor="promo_hostel" error={errors.hostel_id}>
                  <Select id="promo_hostel" value={hostelId} onChange={(e) => setHostelId(e.target.value)}>
                    <option value="">Select a hostel</option>
                    {hostels.data?.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Plan" htmlFor="promo_plan">
                  <Select id="promo_plan" value={plan} onChange={(e) => setPlan(e.target.value as PromotionPlan)}>
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {PROMOTION_PLAN_LABEL[p]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Payment method" htmlFor="promo_method">
                <Select id="promo_method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {PAYMENT_METHOD_LABEL[m]}
                    </option>
                  ))}
                </Select>
              </Field>
              {method !== 'cash' && (
                <Field label="Payment screenshot" htmlFor="promo_proof" hint="Upload proof of payment.">
                  <Input
                    id="promo_proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </Field>
              )}
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? 'Submitting…' : 'Submit for review'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {promotions.data?.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-neutral-900">{PROMOTION_PLAN_LABEL[p.plan]}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {p.status === 'active' && p.expires_at
                    ? `Runs until ${formatDate(p.expires_at)} · ${p.impressions} views · ${p.clicks} clicks`
                    : p.rejection_reason
                      ? p.rejection_reason
                      : `Submitted ${formatDate(p.created_at)}`}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium',
                  TONE[promotionStatusTone(p.status)]
                )}
              >
                {PROMOTION_STATUS_LABEL[p.status]}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
