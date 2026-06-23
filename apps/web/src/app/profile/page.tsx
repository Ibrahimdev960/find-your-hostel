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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const profile = useProfile(user?.id);
  const update = useUpdateProfile(user?.id ?? '');
  const logout = useLogout();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading || !user) {
    return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  }

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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Your profile</h1>
        <div className="flex gap-2">
          {user.role === 'owner' && (
            <Button asChild variant="outline" size="sm">
              <Link href="/owner/onboarding">Owner verification</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/login') })}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Signed in as {user.email} · role: <span className="font-medium">{user.role}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile.isLoading ? (
            <p className="text-sm text-neutral-500">Loading profile…</p>
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
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
