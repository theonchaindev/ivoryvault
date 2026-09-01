import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resetPlays, countSold } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await resetPlays(id)
    const sold = await countSold(id)
    return NextResponse.json({ ok: true, sold })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/instant-win/reset]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
