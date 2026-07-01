'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import {
  useOwnerProfile,
  useSubmitOwnerVerification,
  ownerVerificationSchema,
  type OwnerVerificationInput,
} from '@findyourhostel/shared/features/auth';
import { parseZodErrors } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DocumentUpload } from './DocumentUpload';

type Docs = Pick<OwnerVerificationInput, 'cnic_front_url' | 'cnic_back_url' | 'ownership_proof_url'>;

export function OwnerOnboarding({ ownerId }: { ownerId: string }) {
  const ownerProfile = useOwnerProfile(ownerId);
  const submit = useSubmitOwnerVerification(ownerId);

  const [step, setStep] = useState(1);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [details, setDetails] = useState({ business_name: '', cnic: '', city: '', address: '' });
  const [docs, setDocs] = useState<Docs>({
    cnic_front_url: '',
    cnic_back_url: '',
    ownership_proof_url: '',
  });

  if (ownerProfile.isLoading) {
    return <div className="p-10 text-sm text-foreground-muted">Loading verification status…</div>;
  }

  const profile = ownerProfile.data;
  const status = profile?.status;

  // ── Status states (don't show the form unless un-started or rejected/editing) ──
  if (status === 'approved' && !editing) {
    return (
      <StatusCard
        icon={<CheckCircle2 className="h-6 w-6 text-success" />}
        title="You’re verified"
        description="Your owner account is approved. You can now create and publish hostel listings."
      >
        <Button asChild>
          <Link href="/owner">Go to owner dashboard</Link>
        </Button>
      </StatusCard>
    );
  }

  if (status === 'suspended') {
    return (
      <StatusCard
        icon={<XCircle className="h-6 w-6 text-error" />}
        title="Account suspended"
        description="Your owner account is currently suspended. Please contact support for details."
      />
    );
  }

  if (status === 'pending' && profile?.submitted_at && !editing) {
    return (
      <StatusCard
        icon={<Clock className="h-6 w-6 text-warning" />}
        title="Verification under review"
        description="We’ve received your documents and are reviewing them. You’ll be notified once a decision is made."
      >
        <Button variant="outline" onClick={() => setEditing(true)}>
          Update submission
        </Button>
      </StatusCard>
    );
  }

  function next() {
    setErrors({});
    const partial = ownerVerificationSchema
      .pick({ business_name: true, cnic: true, city: true, address: true })
      .safeParse(details);
    if (!partial.success) {
      setErrors(parseZodErrors(partial.error));
      return;
    }
    setStep(2);
  }

  function onSubmit() {
    setErrors({});
    const parsed = ownerVerificationSchema.safeParse({ ...details, ...docs });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    submit.mutate(parsed.data, { onSuccess: () => setEditing(false) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner verification</CardTitle>
        <CardDescription>
          Step {step} of 2 ·{' '}
          {status === 'rejected'
            ? 'Your previous submission was rejected — please review and resubmit.'
            : 'Verify your identity to start listing hostels.'}
        </CardDescription>
        {status === 'rejected' && profile?.rejection_reason && (
          <p className="mt-2 rounded-md bg-error/5 px-3 py-2 text-sm text-error">
            Reason: {profile.rejection_reason}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 ? (
          <>
            <Field label="Business / hostel name" htmlFor="business_name" error={errors.business_name}>
              <Input
                id="business_name"
                value={details.business_name}
                onChange={(e) => setDetails((d) => ({ ...d, business_name: e.target.value }))}
              />
            </Field>
            <Field label="CNIC / national ID" htmlFor="cnic" error={errors.cnic}>
              <Input
                id="cnic"
                value={details.cnic}
                onChange={(e) => setDetails((d) => ({ ...d, cnic: e.target.value }))}
              />
            </Field>
            <Field label="City" htmlFor="city" error={errors.city}>
              <Input
                id="city"
                value={details.city}
                onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
              />
            </Field>
            <Field label="Address" htmlFor="address" error={errors.address}>
              <Input
                id="address"
                value={details.address}
                onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
              />
            </Field>
            <Button onClick={next} className="w-full">
              Continue
            </Button>
          </>
        ) : (
          <>
            <DocumentUpload
              userId={ownerId}
              fieldKey="cnic-front"
              label="CNIC — front"
              value={docs.cnic_front_url}
              error={errors.cnic_front_url}
              onUploaded={(path) => setDocs((d) => ({ ...d, cnic_front_url: path }))}
            />
            <DocumentUpload
              userId={ownerId}
              fieldKey="cnic-back"
              label="CNIC — back"
              value={docs.cnic_back_url}
              error={errors.cnic_back_url}
              onUploaded={(path) => setDocs((d) => ({ ...d, cnic_back_url: path }))}
            />
            <DocumentUpload
              userId={ownerId}
              fieldKey="ownership-proof"
              label="Ownership / authority proof"
              value={docs.ownership_proof_url}
              error={errors.ownership_proof_url}
              onUploaded={(path) => setDocs((d) => ({ ...d, ownership_proof_url: path }))}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={onSubmit} disabled={submit.isPending} className="flex-1">
                {submit.isPending ? 'Submitting…' : 'Submit for review'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-1">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
