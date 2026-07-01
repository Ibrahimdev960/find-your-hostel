import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listOpenRequests, listOwnerOffers, submitOffer, withdrawOffer } from '../api/offersApi';
import { offerKeys, requestKeys } from '../../student/queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { SubmitOfferInput } from '../schemas';

/** The open-requests feed owners browse to send offers. */
export function useOpenRequests() {
  return useQuery({
    queryKey: requestKeys.open(),
    queryFn: () => listOpenRequests(),
    staleTime: STALE_TIME.short,
  });
}

export function useOwnerOffers(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? offerKeys.owner(ownerId) : offerKeys.owner('anon'),
    queryFn: () => listOwnerOffers(ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: STALE_TIME.short,
  });
}

export function useSubmitOffer(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitOfferInput) => submitOffer(ownerId, input),
    onSuccess: (o) => {
      toast.success('Offer sent. The student will be notified.');
      void qc.invalidateQueries({ queryKey: requestKeys.open() });
      void qc.invalidateQueries({ queryKey: offerKeys.owner(ownerId) });
      void qc.invalidateQueries({ queryKey: offerKeys.forRequest(o.request_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useWithdrawOffer(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => withdrawOffer(id),
    onSuccess: (o) => {
      toast.success('Offer withdrawn');
      void qc.invalidateQueries({ queryKey: requestKeys.open() });
      void qc.invalidateQueries({ queryKey: offerKeys.owner(ownerId) });
      void qc.invalidateQueries({ queryKey: offerKeys.forRequest(o.request_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
