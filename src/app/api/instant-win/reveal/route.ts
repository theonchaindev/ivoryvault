import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { revealNext, countUnrevealed } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Please log in to play.' }, { status: 401 })
    const { gameId } = await request.json() as { gameId?: string }
    if (!gameId) return NextResponse.json({ error: 'Missing game.' }, { status: 400 })
    const result = await revealNext(gameId, session.userId)
    if (!result) return NextResponse.json({ error: 'no-tickets' }, { status: 409 })
    const left = await countUnrevealed(gameId, session.userId)
    return NextResponse.json({ result, left })
  } catch (error) {
    console.error('[instant-win] reveal error:', error)
    return NextResponse.json({ error: 'Failed to reveal' }, { status: 500 })
  }
}
