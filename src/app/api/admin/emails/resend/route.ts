import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { resendLoggedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { id } = await request.json() as { id?: string }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const result = await resendLoggedEmail(id)
    if (!result.ok) return NextResponse.json({ error: result.error || 'Resend failed' }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/emails/resend]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
