'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegister, registerSchema } from '@findyourhostel/shared/features/auth';
import { parseZodErrors } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, Select } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: fd.get('fullName'),
      email: fd.get('email'),
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword'),
      role: fd.get('role'),
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    const { confirmPassword: _c, ...input } = parsed.data;
    register.mutate(input, {
      onSuccess: () => {
        // If email confirmation is off, the user is signed in immediately.
        setDone(true);
        router.refresh();
      },
    });
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account created</CardTitle>
          <CardDescription>
            You’re all set. If email confirmation is enabled, check your inbox to verify your
            address, then sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Find a hostel seat, or list one as an owner.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="I am a" htmlFor="role" error={errors.role}>
            <Select id="role" name="role" defaultValue="student">
              <option value="student">Student looking for a hostel</option>
              <option value="owner">Hostel owner</option>
            </Select>
          </Field>
          <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
            <Input id="fullName" name="fullName" autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" name="email" type="email" autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input id="password" name="password" type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
