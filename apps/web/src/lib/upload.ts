import { createClient } from '@/lib/supabase/client';

/**
 * Uploads a file to a Supabase Storage bucket under `<userId>/<key>-<rand>.<ext>`
 * and returns the stored object path. For private buckets the path is what we
 * persist; render later via a signed URL.
 */
export async function uploadFile(
  bucket: string,
  userId: string,
  key: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'bin';
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${key}-${rand}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  return path;
}

/** Create a short-lived signed URL for an object in a private bucket. */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 60
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

/** Upload to a public bucket and return the public URL (for gallery/cover images). */
export async function uploadPublicImage(
  bucket: string,
  userId: string,
  key: string,
  file: File
): Promise<string> {
  const path = await uploadFile(bucket, userId, key, file);
  const supabase = createClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
