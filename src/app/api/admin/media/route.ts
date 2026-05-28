import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    await requireAdmin()

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ images: [] })
    }

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'ivoryvault/',
      max_results: 100,
      resource_type: 'image',
    })

    const images = (result.resources as Array<{ secure_url: string; public_id: string; bytes: number; created_at: string }>)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        size: r.bytes,
        createdAt: r.created_at,
      }))

    return NextResponse.json({ images })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: 403 })
    }
    console.error('Media list error:', err)
    return NextResponse.json({ images: [] })
  }
}
