import { create } from 'zustand';
import type { UserRole } from '../types/database.types';

/** Minimal auth snapshot — apps push Supabase session changes in via setSession(). */
export type AuthUser = {
  id: string;
  email: string | null;
  role: UserRole | null;
};

type AuthState = {
  user: AuthUser | null;
  /** True until the app's auth provider has resolved the initial session. */
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}));

/** Non-React accessor for use inside shared api/ functions. */
export const getAuthUser = (): AuthUser | null => useAuthStore.getState().user;
