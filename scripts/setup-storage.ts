import { createClient } from "@supabase/supabase-js";

async function main() {
  const buckets = ["course-files", "lesson-files", "submissions", "certificates", "profile-images"];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and service role key are required.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const id of buckets) {
    const { error } = await supabase.storage.createBucket(id, {
      public: false,
      fileSizeLimit: id === "profile-images" ? 5 * 1024 * 1024 : 10 * 1024 * 1024,
    });
    if (error && !error.message.toLowerCase().includes("already exists")) throw error;
    console.log(`Ready: ${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
