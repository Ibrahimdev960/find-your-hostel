'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
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
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/badge';
import { Panel, PanelSection } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const PLANS: PromotionPlan[] = ['featured_1d', 'featured_3d', 'featured_7d', 'featured_30d'];
const METHODS: PaymentMethod[] = ['bank_transfer', 'jazzcash', 'easypaisa', 'cash'];

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
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Boost"
        subtitle="Show a listing higher in search so more students see it."
      />

      <PanelSection title="Boost a listing">
        {isLoading || !user ? (
          <p className="text-sm text-foreground-muted">Loading…</p>
        ) : hostels.data?.length === 0 ? (
          <p className="text-sm text-foreground-muted">List your hostel first to boost it.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? 'Sending…' : 'Send for approval'}
              </Button>
            </div>
          </form>
        )}
      </PanelSection>

      {promotions.data && promotions.data.length > 0 ? (
        <div className="space-y-3">
          {promotions.data.map((p) => (
            <Panel key={p.id} className="flex-row items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <p className="font-semibold text-foreground">{PROMOTION_PLAN_LABEL[p.plan]}</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  {p.status === 'active' && p.expires_at
                    ? `Runs until ${formatDate(p.expires_at)} · ${p.impressions} views · ${p.clicks} clicks`
                    : p.rejection_reason
                      ? p.rejection_reason
                      : `Submitted ${formatDate(p.created_at)}`}
                </p>
              </div>
              <StatusPill tone={promotionStatusTone(p.status)}>
                {PROMOTION_STATUS_LABEL[p.status]}
              </StatusPill>
            </Panel>
          ))}
        </div>
      ) : (
        !isLoading && (
          <EmptyState
            icon={Megaphone}
            title="No boosts yet"
            description="Boost a listing above to show it higher in search results."
          />
        )
      )}
    </div>
  );
}
