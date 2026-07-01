import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptOffer,
  cancelRequest,
  cloneRequest,
  createRequest,
  getRequest,
  listRequestOffers,
  listStudentRequests,
  rejectOffer,
} from '../api/requestsApi';
import { offerKeys, requestKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { CreateRequestInput } from '../schemas';

export function useStudentRequests(studentId: string | undefined) {
  return useQuery({
    queryKey: studentId ? requestKeys.student(studentId) : requestKeys.student('anon'),
    queryFn: () => listStudentRequests(studentId as string),
    enabled: Boolean(studentId),
    staleTime: STALE_TIME.short,
  });
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: id ? requestKeys.detail(id) : requestKeys.detail('none'),
    queryFn: () => getRequest(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME.short,
  });
}

export function useRequestOffers(requestId: string | undefined) {
  return useQuery({
    queryKey: requestId ? offerKeys.forRequest(requestId) : offerKeys.forRequest('none'),
    queryFn: () => listRequestOffers(requestId as string),
    enabled: Boolean(requestId),
    staleTime: STALE_TIME.short,
  });
}

export function useCreateRequest(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => createRequest(studentId, input),
    onSuccess: () => {
      toast.success('Your request is live. Owners can now send you offers — we’ll notify you.');
      void qc.invalidateQueries({ queryKey: requestKeys.student(studentId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelRequest(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelRequest(id),
    onSuccess: (r) => {
      toast.success('Request cancelled');
      void qc.invalidateQueries({ queryKey: requestKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: requestKeys.detail(r.id) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCloneRequest(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => cloneRequest(studentId, sourceId),
    onSuccess: () => {
      toast.success('New request started');
      void qc.invalidateQueries({ queryKey: requestKeys.student(studentId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Accept (books the request + auto-rejects others) or reject a single offer. */
export function useRespondToOffer(studentId: string) {
  const qc = useQueryClient();
  const invalidate = (requestId: string) => {
    void qc.invalidateQueries({ queryKey: offerKeys.forRequest(requestId) });
    void qc.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
    void qc.invalidateQueries({ queryKey: requestKeys.student(studentId) });
  };
  const accept = useMutation({
    mutationFn: (id: string) => acceptOffer(id),
    onSuccess: (o) => {
      toast.success('Offer accepted! Pay the deposit to reserve — other offers were declined.');
      invalidate(o.request_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectOffer(id),
    onSuccess: (o) => {
      toast.success('Offer declined');
      invalidate(o.request_id);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return { accept, reject };
}
