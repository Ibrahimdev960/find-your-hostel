import { getSupabase } from '../../../lib/supabase';
import { toApiError, unwrap } from '../../../utils/apiError';
import type { HostelImage } from '../../../types';

export async function listHostelImages(hostelId: string): Promise<HostelImage[]> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostel_images')
    .select('*')
    .eq('hostel_id', hostelId)
    .order('sort_order', { ascending: true });
  return unwrap(result);
}

export async function addHostelImage(
  hostelId: string,
  url: string,
  isCover = false
): Promise<HostelImage> {
  const supabase = getSupabase();
  const result = await supabase
    .from('hostel_images')
    .insert({ hostel_id: hostelId, url, is_cover: isCover })
    .select('*')
    .single();
  return unwrap(result);
}

export async function removeHostelImage(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('hostel_images').delete().eq('id', id);
  if (error) throw toApiError(error);
}

/** Mark one image as cover (clears the flag on the rest) and mirror to hostels.cover_image_url. */
export async function setCoverImage(hostelId: string, imageId: string, url: string): Promise<void> {
  const supabase = getSupabase();
  const clear = await supabase
    .from('hostel_images')
    .update({ is_cover: false })
    .eq('hostel_id', hostelId);
  if (clear.error) throw toApiError(clear.error);

  const set = await supabase.from('hostel_images').update({ is_cover: true }).eq('id', imageId);
  if (set.error) throw toApiError(set.error);

  const mirror = await supabase
    .from('hostels')
    .update({ cover_image_url: url })
    .eq('id', hostelId);
  if (mirror.error) throw toApiError(mirror.error);
}
