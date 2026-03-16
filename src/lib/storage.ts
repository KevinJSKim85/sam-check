import { createServiceClient, createBrowserClient } from './supabase'

const BUCKET_NAME = 'credentials'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const SIGNED_URL_TTL = 15 * 60 // 15 minutes

/**
 * Upload a credential document to Supabase Storage
 * Path convention: credentials/{userId}/{credentialType}/{timestamp}_{filename}
 */
export async function uploadCredentialDocument(
  userId: string,
  credentialType: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    return { path: '', error: 'File size exceeds 10MB limit' }
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { path: '', error: 'Only PDF, JPG, and PNG files are allowed' }
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const filePath = `${userId}/${credentialType}/${timestamp}_${safeName}`

  const supabase = createBrowserClient()
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return { path: '', error: error.message }
  }
  return { path: filePath, error: null }
}

/**
 * Generate a signed URL for admin document review (SERVER-SIDE ONLY)
 * Uses service role key — never call from client
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = SIGNED_URL_TTL
): Promise<{ url: string; error: string | null }> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    return { url: '', error: error?.message || 'Failed to generate signed URL' }
  }
  return { url: data.signedUrl, error: null }
}

/**
 * Delete a credential document
 */
export async function deleteCredentialDocument(
  path: string
): Promise<{ error: string | null }> {
  const supabase = createServiceClient()
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  return { error: error?.message || null }
}

// Export constants for use in other modules
export { BUCKET_NAME, MAX_FILE_SIZE, ALLOWED_MIME_TYPES, SIGNED_URL_TTL }
