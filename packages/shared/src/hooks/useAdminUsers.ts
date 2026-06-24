import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listUsers, setUserSuspended, type AdminUsersFilter } from '../api/adminUsersApi';
import { adminKeys } from './useAdminStats';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';

/** Admin: list users, optionally filtered by role + search term. */
export function useAdminUsers(filter: AdminUsersFilter = {}) {
  return useQuery({
    queryKey: adminKeys.users(filter),
    queryFn: () => listUsers(filter),
    staleTime: STALE_TIME.short,
  });
}

/** Admin: suspend / reactivate a user account. */
export function useSetUserSuspended() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      suspended,
      reason,
    }: {
      userId: string;
      suspended: boolean;
      reason?: string;
    }) => setUserSuspended(userId, suspended, reason ?? null),
    onSuccess: (_data, vars) => {
      toast.success(vars.suspended ? 'User suspended' : 'User reactivated');
      void qc.invalidateQueries({ queryKey: [queryRoots.admin] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
