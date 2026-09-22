import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { listSentEmails, countSentEmails } from '@/lib/emailLog'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    const [emails, total] = await Promise.all([listSentEmails(300), countSentEmails()])
    return NextResponse.json({ emails, total })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error'
    if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
    console.error('[admin/emails]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
