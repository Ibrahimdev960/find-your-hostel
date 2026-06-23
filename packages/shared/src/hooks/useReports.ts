import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReport,
  listReports,
  resolveReport,
  type CreateReportInput,
} from '../api/reportsApi';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';
import type { ReportStatus } from '../types';

export const reportKeys = {
  all: [queryRoots.reports] as const,
  list: (status?: ReportStatus) => [queryRoots.reports, 'list', status ?? 'all'] as const,
};

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input),
    onSuccess: () => toast.success('Report submitted — thank you'),
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Admin moderation queue. */
export function useReports(status?: ReportStatus) {
  return useQuery({
    queryKey: reportKeys.list(status),
    queryFn: () => listReports(status),
    staleTime: STALE_TIME.short,
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: ReportStatus; note?: string }) =>
      resolveReport(id, status, note),
    onSuccess: () => {
      toast.success('Report updated');
      void qc.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
