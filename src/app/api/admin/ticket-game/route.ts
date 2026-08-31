import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getConfig, saveConfig, setPublished, countSold, poolStatus, listCustomWinsForAdmin, type TicketTier } from '@/lib/ticketGame'

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
    const [config, sold, pool, customWins] = await Promise.all([getConfig(), countSold(), poolStatus(), listCustomWinsForAdmin()])
    return NextResponse.json({ config, sold, pool, customWins })
  } catch (e) { return fail(e) }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { priceP?: number; poolSize?: number; prizes?: TicketTier[] }
    await saveConfig({
      priceP: Number(b.priceP) || 10,
      poolSize: Number(b.poolSize) || 500,
      prizes: Array.isArray(b.prizes) ? b.prizes : [],
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
