import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGameById, createPlays, countUnrevealed } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const game = await getGameById(id)
    if (!game) return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    const b = await request.json() as { email?: string; quantity?: number }
    const email = (b.email || '').toLowerCase().trim()
    const qty = Math.max(1, Math.min(100, Math.round(Number(b.quantity) || 0)))
    if (!email) return NextResponse.json({ error: 'Enter the member’s email.' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } })
    if (!user) return NextResponse.json({ error: 'No member found with that email.' }, { status: 404 })
    await createPlays(id, user.id, qty)
    await prisma.notification.create({ data: { userId: user.id, title: `${qty} ${game.name} ticket${qty === 1 ? '' : 's'} added`, body: `We’ve added ${qty} ticket${qty === 1 ? '' : 's'} for ${game.name} to your account — head to the game to reveal ${qty === 1 ? 'it' : 'them'}.`, icon: 'info' } }).catch(() => {})
    const pending = await countUnrevealed(id, user.id)
    return NextResponse.json({ ok: true, granted: qty, email, pending })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/instant-win/grant]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
