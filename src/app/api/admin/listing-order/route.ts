import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { setListingOrder } from '@/lib/listing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { ids?: string[] }
    if (!Array.isArray(b.ids)) return NextResponse.json({ error: 'ids required' }, { status: 400 })
    await setListingOrder(b.ids)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/listing-order]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
