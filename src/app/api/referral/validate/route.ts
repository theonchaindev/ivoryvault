import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { validateReferral, REFERRAL_RATE } from '@/lib/referrals'

export const dynamic = 'force-dynamic'

// Check a referral code for the logged-in user (used by the basket before checkout).
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ ok: false, error: 'Please log in to use a referral code.' }, { status: 401 })
    const { code } = await req.json()
    if (!code?.trim()) return NextResponse.json({ ok: false, error: 'Enter a referral code.' }, { status: 400 })
    const v = await validateReferral(session.userId, code.trim())
    if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 })
    return NextResponse.json({ ok: true, discountPct: Math.round(REFERRAL_RATE * 100) })
  } catch (e) {
    console.error('[referral/validate] error:', e)
    return NextResponse.json({ ok: false, error: 'Something went wrong' }, { status: 500 })
  }
}
