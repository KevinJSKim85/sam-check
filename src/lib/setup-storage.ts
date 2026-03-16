/**
 * Storage bucket setup reference
 * Run these SQL statements in Supabase SQL editor to set up RLS policies:
 *
 * -- Create bucket (if not exists via dashboard)
 * INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 * VALUES ('credentials', 'credentials', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']);
 *
 * -- RLS Policy 1: Users upload to their own folder
 * CREATE POLICY "users_upload_own" ON storage.objects
 *   FOR INSERT TO authenticated
 *   WITH CHECK (bucket_id = 'credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
 *
 * -- RLS Policy 2: Users read their own files
 * CREATE POLICY "users_read_own" ON storage.objects
 *   FOR SELECT TO authenticated
 *   USING (bucket_id = 'credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
 *
 * -- RLS Policy 3: Admins read all files (using service role — bypasses RLS)
 * -- No policy needed — service role key bypasses RLS
 *
 * -- RLS Policy 4: Users delete their own files
 * CREATE POLICY "users_delete_own" ON storage.objects
 *   FOR DELETE TO authenticated
 *   USING (bucket_id = 'credentials' AND (storage.foldername(name))[1] = auth.uid()::text);
 */

export const STORAGE_SETUP_INSTRUCTIONS = `
To set up the credentials storage bucket:
1. Go to Supabase Dashboard > Storage
2. Create a new bucket named "credentials"
3. Set it to private (not public)
4. Set file size limit to 10MB
5. Set allowed MIME types: application/pdf, image/jpeg, image/png
6. Apply the RLS policies from src/lib/setup-storage.ts
`
