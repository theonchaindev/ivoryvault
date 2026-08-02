import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getSetting, setSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Accepts a bare Pixel ID or the full Meta base code and extracts the ID.
function extractPixelId(input: string): string | null {
  const s = input.trim()
  if (/^\d{6,20}$/.test(s)) return s
  const m = s.match(/init['"]?\s*,\s*['"](\d{6,20})['"]/)
  return m ? m[1] : null
}

function fail(err: unknown) {
  const e = err as Error
  if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
  }
  console.error('meta-pixel settings error:', e)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json({ pixelId: (await getSetting('metaPixelId')) || '' })
  } catch (err) { return fail(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { value } = await req.json()
    const raw = String(value || '').trim()

    if (!raw) {
      await setSetting('metaPixelId', '') // clears / disables the pixel
      return NextResponse.json({ ok: true, pixelId: '' })
    }
    const id = extractPixelId(raw)
    if (!id) {
      return NextResponse.json({ error: "Couldn't find a valid Pixel ID. Paste your numeric Pixel ID or the full Meta base code." }, { status: 400 })
    }
    await setSetting('metaPixelId', id)
    return NextResponse.json({ ok: true, pixelId: id })
  } catch (err) { return fail(err) }
}
