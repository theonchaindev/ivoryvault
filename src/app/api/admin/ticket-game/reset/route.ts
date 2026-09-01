import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resetPlays, countSold } from '@/lib/ticketGame'

export const dynamic = 'force-dynamic'

// Clear all plays/claims — resets "tickets sold" to 0. Admin-only.
export async function POST() {
  try {
    await requireAdmin()
    await resetPlays()
    const sold = await countSold()
    return NextResponse.json({ ok: true, sold })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/ticket-game/reset]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
