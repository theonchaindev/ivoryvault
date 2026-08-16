import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendPaymentsPausedEmail, broadcastPaymentsPaused } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Auth: CRON_SECRET bearer OR a logged-in admin
  const auth = req.headers.get('authorization')
  const isSecret = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`
  let isAdmin = false
  try { const s = await getSession(); isAdmin = s?.role === 'admin' } catch { /* ignore */ }
  if (!isSecret && !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Test mode: send one sample email to a given address
  const testEmail = req.nextUrl.searchParams.get('test')
  if (testEmail) {
    await sendPaymentsPausedEmail(testEmail)
    return NextResponse.json({ ok: true, testSentTo: testEmail })
  }

  const users = await prisma.user.findMany({ select: { email: true } })
  const emails = Array.from(new Set(users.map(u => u.email).filter(Boolean) as string[]))

  if (req.nextUrl.searchParams.get('dryRun') === '1') {
    return NextResponse.json({ ok: true, dryRun: true, recipients: emails.length })
  }

  const result = await broadcastPaymentsPaused(emails)
  return NextResponse.json({ ok: true, recipients: emails.length, ...result })
}
