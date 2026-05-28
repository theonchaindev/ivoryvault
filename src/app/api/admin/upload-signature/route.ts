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

    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'ivoryvault'

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!,
    )

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
