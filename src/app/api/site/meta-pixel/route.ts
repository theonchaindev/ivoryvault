import { NextResponse } from 'next/server'
import { getSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Public: the pixel ID is embedded in the page anyway, so it's safe to expose.
export async function GET() {
  const pixelId = (await getSetting('metaPixelId')) || null
  return NextResponse.json({ pixelId })
}
