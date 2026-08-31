import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { submitClaim } from '@/lib/ticketGame'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Please log in.' }, { status: 401 })

    const b = await request.json() as { playId?: string; fullName?: string; addressLine1?: string; addressLine2?: string; city?: string; postcode?: string; phone?: string }
    const playId = (b.playId || '').trim()
    const fullName = (b.fullName || '').trim()
    const addressLine1 = (b.addressLine1 || '').trim()
    const city = (b.city || '').trim()
    const postcode = (b.postcode || '').trim()
    if (!playId || !fullName || !addressLine1 || !city || !postcode) {
      return NextResponse.json({ error: 'Please fill in your name and full delivery address.' }, { status: 400 })
    }

    const res = await submitClaim(playId, session.userId, {
      fullName, addressLine1, addressLine2: (b.addressLine2 || '').trim() || undefined, city, postcode, phone: (b.phone || '').trim() || undefined,
    })
    if (!res.ok) return NextResponse.json({ error: res.error || 'Could not save claim' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ticketgame] claim error:', error)
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 })
  }
}
