import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { setOfferActive, deleteOffer } from '@/lib/offers'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/offers/id]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const b = await request.json() as { active?: boolean }
    await setOfferActive(id, !!b.active)
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteOffer(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
