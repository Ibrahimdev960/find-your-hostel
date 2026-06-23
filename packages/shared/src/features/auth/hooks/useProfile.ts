import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/profileApi';
import { authKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { TablesUpdate } from '../../../types';

/** Query the current user's profile. Pass the auth user id (undefined disables it). */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? authKeys.profile(userId) : ['profile', 'anon'],
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: STALE_TIME.medium,
  });
}

/** Mutation: update profile → toast → invalidate. */
export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: TablesUpdate<'profiles'>) => updateProfile(userId, patch),
    onSuccess: () => {
      toast.success('Profile updated');
      void qc.invalidateQueries({ queryKey: authKeys.profile(userId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
