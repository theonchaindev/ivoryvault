import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendAbandonedCheckoutEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Recovery window: remind checkouts abandoned between 1 and 24 hours ago.
const GRACE_S = 60 * 60          // 1h grace before we consider it abandoned
const WINDOW_S = 26 * 60 * 60    // ~1 day window so the daily run catches everything

let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "CheckoutReminder" ("sessionId" TEXT PRIMARY KEY, "sentAt" TIMESTAMPTZ NOT NULL DEFAULT now())`)
  tableEnsured = true
}
async function alreadyReminded(id: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ x: number }[]>(`SELECT 1 AS x FROM "CheckoutReminder" WHERE "sessionId" = $1`, id)
  return rows.length > 0
}
async function markReminded(id: string) {
  await prisma.$executeRawUnsafe(`INSERT INTO "CheckoutReminder" ("sessionId") VALUES ($1) ON CONFLICT DO NOTHING`, id)
}

export async function GET(req: NextRequest) {
  // Auth: Vercel cron (bearer secret) or a logged-in admin (for manual/dry runs)
  const auth = req.headers.get('authorization')
  const isCron = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`
  let isAdmin = false
  try { const s = await getSession(); isAdmin = s?.role === 'admin' } catch { /* ignore */ }
  if (!isCron && !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'

  // Admin test: send a sample recovery email to a given address (uses the latest comp)
  const testEmail = req.nextUrl.searchParams.get('test')
  if (testEmail) {
    const comp = await prisma.competition.findFirst({
      where: { status: 'active', type: 'standard' },
      orderBy: { createdAt: 'desc' }, select: { title: true, slug: true, images: true },
    })
    let img: string | null = null
    if (comp) { try { img = JSON.parse(comp.images)[0] || null } catch { /* ignore */ } }
    await sendAbandonedCheckoutEmail(testEmail, 'there', comp ? [{ title: comp.title, slug: comp.slug, image: img }] : [{ title: 'Win a Coach Handbag!', slug: 'win-a-coach-handbag', image: null }])
    return NextResponse.json({ ok: true, testSentTo: testEmail, featured: comp?.title || null })
  }

  try {
    await ensureTable()
    const now = Math.floor(Date.now() / 1000)

    // Recent sessions (a little over the window so we can also see who paid)
    const list = await stripe.checkout.sessions.list({ limit: 100, created: { gte: now - WINDOW_S - 3600 } })

    // Users who DID pay recently — don't nag them
    const paidUsers = new Set(list.data.filter(s => s.payment_status === 'paid').map(s => s.metadata?.userId).filter(Boolean) as string[])

    // Abandoned candidates, most-recent per user
    const byUser = new Map<string, typeof list.data[number]>()
    for (const s of list.data) {
      const uid = s.metadata?.userId
      if (!uid || s.payment_status === 'paid') continue
      if (s.created > now - GRACE_S || s.created < now - WINDOW_S) continue
      if (paidUsers.has(uid)) continue
      const cur = byUser.get(uid)
      if (!cur || s.created > cur.created) byUser.set(uid, s)
    }

    const results: { email: string; comps: string[] }[] = []
    let sent = 0

    for (const [uid, s] of byUser) {
      if (!dryRun && await alreadyReminded(s.id)) continue
      const user = await prisma.user.findUnique({ where: { id: uid }, select: { email: true, name: true } })
      if (!user?.email) continue
      let items: { id: string; qty: number }[] = []
      try { items = JSON.parse(s.metadata?.items || '[]') } catch { /* ignore */ }
      if (items.length === 0) continue
      const comps = await prisma.competition.findMany({ where: { id: { in: items.map(i => i.id) } }, select: { title: true, slug: true, images: true } })
      if (comps.length === 0) continue
      const compData = comps.map(c => {
        let image: string | null = null
        try { image = JSON.parse(c.images)[0] || null } catch { /* ignore */ }
        return { title: c.title, slug: c.slug, image }
      })

      results.push({ email: user.email, comps: comps.map(c => c.title) })
      if (!dryRun) {
        await sendAbandonedCheckoutEmail(user.email, user.name, compData)
        await markReminded(s.id)
        sent++
      }
    }

    return NextResponse.json({ ok: true, dryRun, candidates: results.length, sent, would: dryRun ? results : undefined })
  } catch (e) {
    console.error('abandoned-checkout cron error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
