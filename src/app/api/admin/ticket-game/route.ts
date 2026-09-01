import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getConfig, saveConfig, setPublished, countSold, countWon, listCustomWinsForAdmin, type WinnerDef } from '@/lib/ticketGame'
import { listRecentOrders } from '@/lib/cashflowsOrders'
import { TICKET_GAME_ITEM } from '@/lib/orders'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/ticket-game]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

async function ticketGameOrders() {
  // Order diagnostics are best-effort — never let them break the admin page.
  try {
    const allOrders = await listRecentOrders(60)
    const tgOrders = allOrders.filter(o => o.items.some(i => i.id === TICKET_GAME_ITEM))
    if (!tgOrders.length) return []
    const userIds = [...new Set(tgOrders.map(o => o.userId))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } })
    const byUser = new Map(users.map(u => [u.id, u]))
    return tgOrders.map(o => ({
      orderNumber: o.orderNumber, status: o.status, amount: o.amount, createdAt: o.createdAt, paidAt: o.paidAt,
      qty: o.items.filter(i => i.id === TICKET_GAME_ITEM).reduce((s, i) => s + i.qty, 0),
      email: byUser.get(o.userId)?.email || '', name: byUser.get(o.userId)?.name || '',
    }))
  } catch (e) { console.error('[admin/ticket-game] orders lookup failed:', e); return [] }
}

async function safe<T>(fn: () => Promise<T>, fallback: T, tag: string): Promise<T> {
  try { return await fn() } catch (e) { console.error(`[admin/ticket-game] ${tag} failed:`, e); return fallback }
}

export async function GET() {
  try {
    await requireAdmin()
  } catch (e) { return fail(e) }
  const [config, sold, won, customWins, orders] = await Promise.all([
    safe(getConfig, { published: false, priceP: 10, poolSize: 500, image: '', endsAt: null, winners: {} }, 'getConfig'),
    safe(countSold, 0, 'countSold'),
    safe(countWon, 0, 'countWon'),
    safe(listCustomWinsForAdmin, [], 'listCustomWinsForAdmin'),
    ticketGameOrders(),
  ])
  return NextResponse.json({ config, sold, won, customWins, orders })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { priceP?: number; poolSize?: number; image?: string; endsAt?: string | null; winners?: Record<number, WinnerDef> }
    await saveConfig({
      priceP: Number(b.priceP) || 10,
      poolSize: Number(b.poolSize) || 500,
      image: typeof b.image === 'string' ? b.image : '',
      endsAt: b.endsAt ?? null,
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
