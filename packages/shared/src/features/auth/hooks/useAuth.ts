import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  sendPasswordReset,
  updatePassword,
} from '../api/authApi';
import { toast } from '../../../lib/toast';
import { useAuthStore } from '../../../store/authStore';
import type { RegisterInput } from '../schemas';

/** Register a new student/owner. The profiles row is created by the signup trigger. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: Omit<RegisterInput, 'confirmPassword'>) => registerApi(input),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      clear();
      qc.clear();
      toast.success('Signed out');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForgotPassword(redirectTo: string) {
  return useMutation({
    mutationFn: (email: string) => sendPasswordReset(email, redirectTo),
    onSuccess: () => toast.success('Check your email for a reset link'),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (password: string) => updatePassword(password),
    onSuccess: () => toast.success('Password updated'),
    onError: (e: Error) => toast.error(e.message),
  });
}
