import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getConfig, saveConfig, setPublished, countSold, countWon, listCustomWinsForAdmin, type WinnerDef } from '@/lib/ticketGame'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/ticket-game]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

export async function GET() {
  try {
    await requireAdmin()
    const [config, sold, won, customWins] = await Promise.all([getConfig(), countSold(), countWon(), listCustomWinsForAdmin()])
    return NextResponse.json({ config, sold, won, customWins })
  } catch (e) { return fail(e) }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { priceP?: number; poolSize?: number; winners?: Record<number, WinnerDef> }
    await saveConfig({
      priceP: Number(b.priceP) || 10,
      poolSize: Number(b.poolSize) || 500,
      winners: (b.winners && typeof b.winners === 'object') ? b.winners : {},
    })
    const config = await getConfig()
    return NextResponse.json({ ok: true, config })
  } catch (e) { return fail(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { published?: boolean }
    await setPublished(!!b.published)
    const config = await getConfig()
    return NextResponse.json({ ok: true, config })
  } catch (e) { return fail(e) }
}
