import { useMutation, useQuery } from '@tanstack/react-query';
import { getRecommendations, trackHostelView } from '../api/recommendationsApi';
import { recommendationKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';

/**
 * Personalized "Recommended for you" listings for the signed-in student.
 * Pass `enabled: false` (e.g. for signed-out visitors) to skip the personalized fetch.
 */
export function useRecommendations(limit = 8, enabled = true) {
  return useQuery({
    queryKey: recommendationKeys.list(limit),
    queryFn: () => getRecommendations(limit),
    enabled,
    staleTime: STALE_TIME.medium,
  });
}

/** Fire-and-forget hostel-view tracking (call on the hostel detail page). */
export function useTrackHostelView() {
  return useMutation({
    mutationFn: (hostelId: string) => trackHostelView(hostelId),
  });
}
