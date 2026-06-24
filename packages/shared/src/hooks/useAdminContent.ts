import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllReviews, setReviewHidden } from '../api/reviewsApi';
import { listPosts, deletePost } from '../api/communityApi';
import { adminKeys } from './useAdminStats';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';
import type { CommunityTopic } from '../types';

/** Admin: recent reviews across all hostels (includes hidden, for moderation). */
export function useAdminReviews() {
  return useQuery({
    queryKey: adminKeys.reviews(),
    queryFn: () => listAllReviews(100),
    staleTime: STALE_TIME.short,
  });
}

/** Admin: soft-hide or restore a review. */
export function useSetReviewHidden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, hidden }: { reviewId: string; hidden: boolean }) =>
      setReviewHidden(reviewId, hidden),
    onSuccess: (_data, vars) => {
      toast.success(vars.hidden ? 'Review hidden' : 'Review restored');
      void qc.invalidateQueries({ queryKey: adminKeys.reviews() });
      void qc.invalidateQueries({ queryKey: [queryRoots.reviews] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Admin: recent community posts (optionally by topic), for moderation. */
export function useAdminPosts(topic?: CommunityTopic) {
  return useQuery({
    queryKey: adminKeys.posts(topic),
    queryFn: () => listPosts(topic),
    staleTime: STALE_TIME.short,
  });
}

/** Admin: delete a community post. */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      void qc.invalidateQueries({ queryKey: [queryRoots.admin, 'posts'] });
      void qc.invalidateQueries({ queryKey: [queryRoots.community] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
