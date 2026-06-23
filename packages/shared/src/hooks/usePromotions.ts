import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePromotion,
  createPromotion,
  listOwnerPromotions,
  listPendingPromotions,
  rejectPromotion,
  type CreatePromotionInput,
} from '../api/promotionsApi';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';

export const promotionKeys = {
  all: [queryRoots.promotions] as const,
  owner: (ownerId: string) => [queryRoots.promotions, 'owner', ownerId] as const,
  pending: () => [queryRoots.promotions, 'pending'] as const,
};

export function useOwnerPromotions(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? promotionKeys.owner(ownerId) : promotionKeys.owner('anon'),
    queryFn: () => listOwnerPromotions(ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: STALE_TIME.short,
  });
}

export function useCreatePromotion(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePromotionInput) => createPromotion(ownerId, input),
    onSuccess: () => {
      toast.success('Promotion submitted for review');
      void qc.invalidateQueries({ queryKey: promotionKeys.owner(ownerId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Admin moderation queue. */
export function usePendingPromotions() {
  return useQuery({
    queryKey: promotionKeys.pending(),
    queryFn: () => listPendingPromotions(),
    staleTime: STALE_TIME.short,
  });
}

export function useApprovePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePromotion(id),
    onSuccess: () => {
      toast.success('Promotion approved');
      void qc.invalidateQueries({ queryKey: promotionKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectPromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectPromotion(id, reason),
    onSuccess: () => {
      toast.success('Promotion rejected');
      void qc.invalidateQueries({ queryKey: promotionKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
