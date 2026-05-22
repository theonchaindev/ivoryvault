import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP or AVIF images allowed' }, { status: 400 })
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large — max 8 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const name = `competitions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Image upload not configured — paste a URL instead, or add BLOB_READ_WRITE_TOKEN in Vercel Storage settings.' }, { status: 503 })
    }

    const blob = await put(name, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: 403 })
    }
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
