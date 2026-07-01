'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useProfile,
  useUpdateProfile,
  useLogout,
  profileSchema,
} from '@findyourhostel/shared/features/auth';
import { parseZodErrors } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { PanelSection } from '@/components/ui/panel';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const profile = useProfile(user?.id);
  const update = useUpdateProfile(user?.id ?? '');
  const logout = useLogout();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse({
      full_name: fd.get('full_name') || null,
      phone: fd.get('phone') || null,
      gender: fd.get('gender') || null,
      institution: fd.get('institution') || null,
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    update.mutate(parsed.data);
  }

  const p = profile.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <PageHeader title="Profile" subtitle="Manage your account details and preferences." />

      {isLoading || !user ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <PanelSection
            title="Account details"
            description={`Signed in as ${user.email} · role: ${user.role}`}
          >
            {profile.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Field label="Full name" htmlFor="full_name" error={errors.full_name}>
                  <Input id="full_name" name="full_name" defaultValue={p?.full_name ?? ''} />
                </Field>
                <Field label="Phone" htmlFor="phone" error={errors.phone}>
                  <Input id="phone" name="phone" defaultValue={p?.phone ?? ''} />
                </Field>
                <Field label="Gender" htmlFor="gender" error={errors.gender}>
                  <Select id="gender" name="gender" defaultValue={p?.gender ?? ''}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <Field label="Institution" htmlFor="institution" error={errors.institution}>
                  <Input
                    id="institution"
                    name="institution"
                    defaultValue={p?.institution ?? ''}
                    placeholder="Your university or college"
                  />
                </Field>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="submit" disabled={update.isPending}>
                    {update.isPending ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            )}
          </PanelSection>

          <PanelSection
            title="Account"
            description="Verification and session."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {user.role === 'owner' ? (
                <Button asChild variant="secondary">
                  <Link href="/owner/onboarding">Owner verification</Link>
                </Button>
              ) : (
                <span className="text-sm text-foreground-muted">You&apos;re signed in as a student.</span>
              )}
              <Button
                variant="destructiveGhost"
                onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/login') })}
              >
                Sign out
              </Button>
            </div>
          </PanelSection>
        </>
      )}
    </div>
  );
}
