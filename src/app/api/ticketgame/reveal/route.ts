import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { revealNext, countUnrevealed } from '@/lib/ticketGame'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Please log in to play.' }, { status: 401 })

    const result = await revealNext(session.userId)
    if (!result) return NextResponse.json({ error: 'no-tickets' }, { status: 409 })

    const left = await countUnrevealed(session.userId)
    return NextResponse.json({ result, left })
  } catch (error) {
    console.error('[ticketgame] reveal error:', error)
    return NextResponse.json({ error: 'Failed to reveal' }, { status: 500 })
  }
}
