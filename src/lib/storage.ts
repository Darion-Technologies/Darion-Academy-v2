import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadPrivateFile(bucket: string, path: string, file: File) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

export async function createSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
