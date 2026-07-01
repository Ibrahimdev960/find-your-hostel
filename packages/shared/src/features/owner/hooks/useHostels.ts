import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHostel,
  deleteHostel,
  getHostel,
  listOwnerHostels,
  publishHostel,
  submitHostelForReview,
  unpublishHostel,
  updateHostel,
} from '../api/hostelsApi';
import { hostelKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { TablesInsert, TablesUpdate } from '../../../types';

export function useOwnerHostels(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? hostelKeys.ownerList(ownerId) : hostelKeys.ownerList('anon'),
    queryFn: () => listOwnerHostels(ownerId as string),
    enabled: Boolean(ownerId),
    staleTime: STALE_TIME.short,
  });
}

export function useHostel(id: string | undefined) {
  return useQuery({
    queryKey: id ? hostelKeys.detail(id) : hostelKeys.detail('none'),
    queryFn: () => getHostel(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME.short,
  });
}

export function useCreateHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TablesInsert<'hostels'>) => createHostel(input),
    onSuccess: (h) => {
      void qc.invalidateQueries({ queryKey: hostelKeys.ownerList(h.owner_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateHostel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TablesUpdate<'hostels'> }) =>
      updateHostel(id, patch),
    onSuccess: (h) => {
      void qc.invalidateQueries({ queryKey: hostelKeys.detail(h.id) });
      void qc.invalidateQueries({ queryKey: hostelKeys.ownerList(h.owner_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteHostel(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteHostel(id),
    onSuccess: () => {
      toast.success('Hostel deleted');
      void qc.invalidateQueries({ queryKey: hostelKeys.ownerList(ownerId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useStatusMutation(
  fn: (id: string) => Promise<{ id: string; owner_id: string }>,
  successMsg: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fn(id),
    onSuccess: (h) => {
      toast.success(successMsg);
      void qc.invalidateQueries({ queryKey: hostelKeys.detail(h.id) });
      void qc.invalidateQueries({ queryKey: hostelKeys.ownerList(h.owner_id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useSubmitHostel = () =>
  useStatusMutation(submitHostelForReview, 'Sent for approval. We’ll review it and let you know.');
export const usePublishHostel = () =>
  useStatusMutation(publishHostel, 'Your hostel is now live — students can see it.');
export const useUnpublishHostel = () =>
  useStatusMutation(unpublishHostel, 'Hostel hidden. Students can no longer see it.');
