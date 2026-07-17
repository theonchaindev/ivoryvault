import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// One-time setup: adds the prizeType column, configures the instant competition
// with 10,000 entries + the agreed prize table, and resets its spins to a clean pool.
const PRIZES = [
  { amount: 0.2, total: 500, kind: 'credit' },
  { amount: 0.5, total: 100, kind: 'credit' },
  { amount: 1, total: 25, kind: 'credit' },
  { amount: 5, total: 5, kind: 'credit' },
  { amount: 5, total: 20, kind: 'cash' },
  { amount: 10, total: 10, kind: 'cash' },
  { amount: 20, total: 5, kind: 'cash' },
]

export async function POST() {
  try {
    await requireAdmin()

    // 1. Ensure the prizeType column exists (idempotent).
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "InstantSpin" ADD COLUMN IF NOT EXISTS "prizeType" TEXT NOT NULL DEFAULT 'credit'`
    )

    // 2. Find the instant competition.
    const comp = await prisma.competition.findFirst({ where: { type: 'instant' }, orderBy: { createdAt: 'asc' } })
    if (!comp) return NextResponse.json({ error: 'No instant competition found' }, { status: 404 })

    // 3. Configure entries + prize table.
    await prisma.competition.update({
      where: { id: comp.id },
      data: { maxTickets: 10000, instantPrizes: JSON.stringify(PRIZES) },
    })

    // 4. Reset the pool so prizes drip cleanly across all 10,000 entries.
    const reset = await prisma.instantSpin.updateMany({
      where: { competitionId: comp.id },
      data: { revealed: false, prizeAmount: 0, prizeType: 'credit' },
    })

    return NextResponse.json({
      ok: true,
      competition: { id: comp.id, slug: comp.slug, title: comp.title, maxTickets: 10000 },
      prizes: PRIZES,
      spinsReset: reset.count,
    })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('instant-setup error:', e)
    return NextResponse.json({ error: e.message || 'Setup failed' }, { status: 500 })
  }
}
