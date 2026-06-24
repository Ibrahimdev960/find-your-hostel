import { z } from 'zod';
import { getSupabase } from '../lib/supabase';
import { toApiError, unwrap } from '../utils/apiError';
import type { Hostel, CommunityPost, CommunityReply, CommunityTopic } from '../types';

// ── Saved hostels (private shortlist) ────────────────────────────────────────

export type SavedHostelCard = {
  hostel_id: string;
  created_at: string;
  hostel: Pick<
    Hostel,
    'id' | 'name' | 'city' | 'nearest_institution' | 'cover_image_url' | 'avg_rating'
  > | null;
};

export async function listSavedHostels(studentId: string): Promise<SavedHostelCard[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('saved_hostels')
    .select('hostel_id, created_at, hostel:hostels(id, name, city, nearest_institution, cover_image_url, avg_rating)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  return unwrap(result) as unknown as SavedHostelCard[];
}

/** Just the saved hostel ids — for cheap "is saved?" checks on cards/detail. */
export async function listSavedHostelIds(studentId: string): Promise<string[]> {
  const supabase = getSupabase();
  const result = await supabase.from('saved_hostels').select('hostel_id').eq('student_id', studentId);
  return unwrap(result).map((r) => r.hostel_id);
}

export async function setHostelSaved(
  studentId: string,
  hostelId: string,
  saved: boolean
): Promise<void> {
  const supabase = getSupabase();
  if (saved) {
    const { error } = await supabase
      .from('saved_hostels')
      .upsert({ student_id: studentId, hostel_id: hostelId }, { onConflict: 'student_id,hostel_id' });
    if (error) throw toApiError(error);
  } else {
    const { error } = await supabase
      .from('saved_hostels')
      .delete()
      .eq('student_id', studentId)
      .eq('hostel_id', hostelId);
    if (error) throw toApiError(error);
  }
}

// ── Q&A posts ────────────────────────────────────────────────────────────────

export type PostWithLike = CommunityPost & { post_likes: { user_id: string }[] };

export const createPostSchema = z.object({
  topic: z.enum(['general', 'area', 'budget', 'facilities', 'food', 'safety']).default('general'),
  title: z.string().min(4, 'Add a title').max(160),
  body: z.string().min(4, 'Add some detail').max(2000),
  is_anonymous: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function listPosts(topic?: CommunityTopic): Promise<PostWithLike[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('community_posts')
    .select('*, post_likes(user_id)')
    .order('created_at', { ascending: false });
  if (topic) query = query.eq('topic', topic);
  return unwrap(await query) as unknown as PostWithLike[];
}

export async function getPost(id: string): Promise<PostWithLike> {
  const supabase = getSupabase();
  const result = await supabase
    .from('community_posts')
    .select('*, post_likes(user_id)')
    .eq('id', id)
    .single();
  return unwrap(result) as unknown as PostWithLike;
}

export async function createPost(input: CreatePostInput): Promise<CommunityPost> {
  const supabase = getSupabase();
  const result = await supabase.from('community_posts').insert(input).select('*').single();
  return unwrap(result);
}

export async function listReplies(postId: string): Promise<CommunityReply[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('community_replies')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  return unwrap(result);
}

export async function replyToPost(
  postId: string,
  body: string,
  isAnonymous = false
): Promise<CommunityReply> {
  const supabase = getSupabase();
  const result = await supabase
    .from('community_replies')
    .insert({ post_id: postId, body, is_anonymous: isAnonymous })
    .select('*')
    .single();
  return unwrap(result);
}

export async function togglePostLike(postId: string, userId: string, liked: boolean): Promise<void> {
  const supabase = getSupabase();
  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .upsert({ post_id: postId, user_id: userId }, { onConflict: 'post_id,user_id' });
    if (error) throw toApiError(error);
  } else {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw toApiError(error);
  }
}

/** Admin (or author): delete a community post. RLS enforces who may delete. */
export async function deletePost(postId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('community_posts').delete().eq('id', postId);
  if (error) throw toApiError(error);
}

/** Admin (or author): delete a community reply. RLS enforces who may delete. */
export async function deleteReply(replyId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('community_replies').delete().eq('id', replyId);
  if (error) throw toApiError(error);
}
