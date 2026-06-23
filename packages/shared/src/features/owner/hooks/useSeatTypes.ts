import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listSeatTypes, replaceSeatTypes } from '../api/seatTypesApi';
import { hostelKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';
import type { SeatTypeInput } from '../schemas';

export function useSeatTypes(hostelId: string | undefined) {
  return useQuery({
    queryKey: hostelId
      ? [...hostelKeys.detail(hostelId), 'seat-types']
      : ['seat-types', 'none'],
    queryFn: () => listSeatTypes(hostelId as string),
    enabled: Boolean(hostelId),
    staleTime: STALE_TIME.short,
  });
}

export function useSaveSeatTypes(hostelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rows: SeatTypeInput[]) => replaceSeatTypes(hostelId, rows),
    onSuccess: () => {
      toast.success('Seats saved');
      void qc.invalidateQueries({ queryKey: hostelKeys.detail(hostelId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
