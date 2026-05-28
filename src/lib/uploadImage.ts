export async function uploadImage(file: File): Promise<string> {
  // Get a signed upload signature from our server (no file data sent here)
  const sigRes = await fetch('/api/admin/upload-signature')
  if (!sigRes.ok) throw new Error('Failed to get upload signature')
  const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

  // Upload directly from browser to Cloudinary — bypasses Vercel payload limits
  const fd = new FormData()
  fd.append('file', file)
  fd.append('signature', signature)
  fd.append('timestamp', String(timestamp))
  fd.append('folder', folder)
  fd.append('api_key', apiKey)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: fd },
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message || 'Upload failed')
  }

  const data = await uploadRes.json() as { secure_url: string }
  return data.secure_url
}
