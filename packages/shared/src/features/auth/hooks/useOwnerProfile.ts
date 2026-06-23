import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOwnerProfile, submitOwnerVerification } from '../api/ownerProfileApi';
import { authKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { OwnerVerificationInput } from '../schemas';

/** The current owner's verification profile (null until they start onboarding). */
export function useOwnerProfile(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? authKeys.ownerProfile(ownerId) : ['profile', 'owner', 'anon'],
    queryFn: () => getOwnerProfile(ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: STALE_TIME.medium,
  });
}

/** Submit/resubmit verification → toast → invalidate the owner profile. */
export function useSubmitOwnerVerification(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OwnerVerificationInput) => submitOwnerVerification(ownerId, input),
    onSuccess: () => {
      toast.success('Verification submitted — we’ll review it shortly');
      void qc.invalidateQueries({ queryKey: authKeys.ownerProfile(ownerId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
