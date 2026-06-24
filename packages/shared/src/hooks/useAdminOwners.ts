import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveOwner,
  listOwners,
  reactivateOwner,
  rejectOwner,
  suspendOwner,
} from '../api/adminOwnersApi';
import { adminKeys } from './useAdminStats';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';
import type { OwnerVerificationStatus } from '../types';

/** Admin: owner verification records, optionally filtered by status. */
export function useAdminOwners(status?: OwnerVerificationStatus) {
  return useQuery({
    queryKey: adminKeys.owners(status),
    queryFn: () => listOwners(status),
    staleTime: STALE_TIME.short,
  });
}

/** Invalidate every owners list + the dashboard counts after a moderation action. */
function useOwnerActionInvalidation() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: [adminKeys.owners()[0]] });
    void qc.invalidateQueries({ queryKey: adminKeys.stats() });
  };
}

export function useApproveOwner() {
  const invalidate = useOwnerActionInvalidation();
  return useMutation({
    mutationFn: (id: string) => approveOwner(id),
    onSuccess: () => {
      toast.success('Owner approved');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectOwner() {
  const invalidate = useOwnerActionInvalidation();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectOwner(id, reason),
    onSuccess: () => {
      toast.success('Owner rejected');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSuspendOwner() {
  const invalidate = useOwnerActionInvalidation();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => suspendOwner(id, reason),
    onSuccess: () => {
      toast.success('Owner suspended');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReactivateOwner() {
  const invalidate = useOwnerActionInvalidation();
  return useMutation({
    mutationFn: (id: string) => reactivateOwner(id),
    onSuccess: () => {
      toast.success('Owner reactivated');
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
