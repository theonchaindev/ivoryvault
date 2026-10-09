import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getWinNotifications } from '@/lib/winNotifications'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    const items = await getWinNotifications(200)
    return NextResponse.json({ items, latest: items[0]?.when || null, total: items.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/notifications]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
