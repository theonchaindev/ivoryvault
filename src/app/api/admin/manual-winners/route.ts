import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { listWinners, createWinner, deleteWinner } from '@/lib/winners'

export const dynamic = 'force-dynamic'

function fail(err: unknown) {
  const e = err as Error
  if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
  }
  console.error('manual-winners error:', e)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json({ winners: await listWinners() })
  } catch (err) { return fail(err) }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { name, competitionTitle, drawDate, image, sortOrder } = await req.json()
    if (!name?.trim() || !competitionTitle?.trim() || !image?.trim()) {
      return NextResponse.json({ error: 'Winner name, competition and image are required' }, { status: 400 })
    }
    await createWinner({
      name: name.trim(),
      competitionTitle: competitionTitle.trim(),
      drawDate: drawDate ? new Date(drawDate) : null,
      image: image.trim(),
      sortOrder: parseInt(sortOrder, 10) || 0,
    })
    return NextResponse.json({ ok: true })
  } catch (err) { return fail(err) }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await deleteWinner(id)
    return NextResponse.json({ ok: true })
  } catch (err) { return fail(err) }
}
