import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminUnpublishHostel,
  listPendingHostels,
  rejectHostel,
  verifyHostel,
} from '../api/adminHostelsApi';
import { hostelKeys } from '../features/owner/queries/keys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';

/** Admin: hostels awaiting verification. */
export function usePendingHostels() {
  return useQuery({
    queryKey: hostelKeys.pending(),
    queryFn: () => listPendingHostels(),
    staleTime: STALE_TIME.short,
  });
}

export function useVerifyHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyHostel(id),
    onSuccess: () => {
      toast.success('Listing verified');
      void qc.invalidateQueries({ queryKey: hostelKeys.pending() });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRejectHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectHostel(id, reason),
    onSuccess: () => {
      toast.success('Listing rejected');
      void qc.invalidateQueries({ queryKey: hostelKeys.pending() });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUnpublishHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUnpublishHostel(id),
    onSuccess: () => {
      toast.success('Listing unpublished');
      void qc.invalidateQueries({ queryKey: hostelKeys.pending() });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
