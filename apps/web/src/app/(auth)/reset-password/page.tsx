'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResetPassword, resetPasswordSchema } from '@findyourhostel/shared/features/auth';
import { parseZodErrors } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const reset = useResetPassword();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword'),
    });
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    reset.mutate(parsed.data.password, {
      onSuccess: () => {
        router.push('/');
        router.refresh();
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="New password" htmlFor="password" error={errors.password}>
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
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
