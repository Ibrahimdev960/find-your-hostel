'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword, forgotPasswordSchema } from '@findyourhostel/shared/features/auth';
import { parseZodErrors } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?next=/reset-password` : '';
  const forgot = useForgotPassword(redirectTo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: fd.get('email') });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    forgot.mutate(parsed.data.email, { onSuccess: () => setSent(true) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          {sent
            ? 'If an account exists for that email, a reset link is on its way.'
            : 'Enter your email and we’ll send you a reset link.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sent && (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" />
            </Field>
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              {forgot.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-neutral-600">
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
