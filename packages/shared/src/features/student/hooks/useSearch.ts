import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchHostels, getHostelPublic } from '../api/searchApi';
import { searchKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import type { SearchFilters } from '../schemas';

/** Search published hostels. Keeps previous results visible while refetching on filter change. */
export function useSearchHostels(filters: SearchFilters) {
  return useQuery({
    queryKey: searchKeys.results(filters),
    queryFn: () => searchHostels(filters),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME.short,
  });
}

/** Public hostel detail page query. */
export function useHostelPublic(id: string | undefined) {
  return useQuery({
    queryKey: id ? searchKeys.public(id) : searchKeys.public('none'),
    queryFn: () => getHostelPublic(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME.medium,
  });
}
