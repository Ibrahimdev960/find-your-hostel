import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPost,
  getPost,
  listPosts,
  listReplies,
  listSavedHostelIds,
  listSavedHostels,
  replyToPost,
  setHostelSaved,
  togglePostLike,
  type CreatePostInput,
} from '../api/communityApi';
import { queryRoots } from '../lib/queryKeys';
import { STALE_TIME } from '../config/timing';
import { toast } from '../lib/toast';
import type { CommunityTopic } from '../types';

export const savedKeys = {
  all: [queryRoots.saved] as const,
  list: (studentId: string) => [queryRoots.saved, 'list', studentId] as const,
  ids: (studentId: string) => [queryRoots.saved, 'ids', studentId] as const,
};

export const communityKeys = {
  all: [queryRoots.community] as const,
  posts: (topic?: CommunityTopic) => [queryRoots.community, 'posts', topic ?? 'all'] as const,
  post: (id: string) => [queryRoots.community, 'post', id] as const,
  replies: (postId: string) => [queryRoots.community, 'replies', postId] as const,
};

// ── Saved hostels ─────────────────────────────────────────────────────────────

export function useSavedHostels(studentId: string | undefined) {
  return useQuery({
    queryKey: studentId ? savedKeys.list(studentId) : savedKeys.list('anon'),
    queryFn: () => listSavedHostels(studentId as string),
    enabled: Boolean(studentId),
    staleTime: STALE_TIME.short,
  });
}

export function useSavedHostelIds(studentId: string | undefined) {
  return useQuery({
    queryKey: studentId ? savedKeys.ids(studentId) : savedKeys.ids('anon'),
    queryFn: () => listSavedHostelIds(studentId as string),
    enabled: Boolean(studentId),
    staleTime: STALE_TIME.short,
  });
}

export function useToggleSaved(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hostelId, saved }: { hostelId: string; saved: boolean }) =>
      setHostelSaved(studentId, hostelId, saved),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: savedKeys.list(studentId) });
      void qc.invalidateQueries({ queryKey: savedKeys.ids(studentId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ── Q&A ────────────────────────────────────────────────────────────────────────

export function useCommunityPosts(topic?: CommunityTopic) {
  return useQuery({
    queryKey: communityKeys.posts(topic),
    queryFn: () => listPosts(topic),
    staleTime: STALE_TIME.short,
  });
}

export function useCommunityPost(id: string | undefined) {
  return useQuery({
    queryKey: id ? communityKeys.post(id) : communityKeys.post('none'),
    queryFn: () => getPost(id as string),
    enabled: Boolean(id),
    staleTime: STALE_TIME.short,
  });
}

export function usePostReplies(postId: string | undefined) {
  return useQuery({
    queryKey: postId ? communityKeys.replies(postId) : communityKeys.replies('none'),
    queryFn: () => listReplies(postId as string),
    enabled: Boolean(postId),
    staleTime: STALE_TIME.short,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      toast.success('Posted to community');
      void qc.invalidateQueries({ queryKey: communityKeys.all });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useReplyToPost(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, isAnonymous }: { body: string; isAnonymous?: boolean }) =>
      replyToPost(postId, body, isAnonymous),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityKeys.replies(postId) });
      void qc.invalidateQueries({ queryKey: communityKeys.post(postId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTogglePostLike(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      togglePostLike(postId, userId, liked),
    onSuccess: () => void qc.invalidateQueries({ queryKey: communityKeys.all }),
    onError: (e: Error) => toast.error(e.message),
  });
}
