import { prisma } from '@/lib/prisma'

// Log of every email we send through Resend, for the admin "Emails" tab.
// Self-creating, DB-agnostic table (works on prod Postgres + local SQLite).

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SentEmail" (
      "id" TEXT PRIMARY KEY,
      "toAddr" TEXT NOT NULL DEFAULT '',
      "subject" TEXT NOT NULL DEFAULT '',
      "kind" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'sent',
      "resendId" TEXT,
      "error" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    // html so a failed email can be re-sent; resentAt marks a manual re-send.
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "SentEmail" ADD COLUMN "html" TEXT`) } catch { /* exists */ }
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "SentEmail" ADD COLUMN "resentAt" TIMESTAMP`) } catch { /* exists */ }
    ensured = true
  } catch (e) { console.error('[emailLog] ensure failed:', e) }
}

export interface SentEmail {
  id: string; toAddr: string; subject: string; kind: string
  status: string; resendId: string | null; error: string | null
  createdAt: string; resentAt: string | null; canResend: boolean
}

/** Record one send. Best-effort — never throws, so it can't break a request. */
export async function logEmail(d: { to: string | string[]; subject: string; kind?: string; status: string; resendId?: string | null; error?: string | null; html?: string }) {
  try {
    await ensure()
    const to = Array.isArray(d.to) ? d.to.join(', ') : (d.to || '')
    const id = crypto.randomUUID()
    await prisma.$executeRaw`INSERT INTO "SentEmail" ("id","toAddr","subject","kind","status","resendId","error","html")
      VALUES (${id}, ${to.slice(0, 500)}, ${(d.subject || '').slice(0, 500)}, ${d.kind || ''}, ${d.status}, ${d.resendId || null}, ${d.error ? String(d.error).slice(0, 500) : null}, ${d.html ? d.html.slice(0, 400000) : null})`
  } catch (e) { console.error('[emailLog] logEmail failed:', e) }
}

export async function listSentEmails(limit = 200): Promise<SentEmail[]> {
  await ensure()
  try {
    const n = Math.min(1000, Math.max(1, Math.round(limit)))
    const rows = await prisma.$queryRawUnsafe<{ id: string; toAddr: string; subject: string; kind: string; status: string; resendId: string | null; error: string | null; createdAt: Date; resentAt: Date | null; html: string | null }[]>(
      `SELECT "id","toAddr","subject","kind","status","resendId","error","createdAt","resentAt",("html" IS NOT NULL) AS "hasHtml" FROM "SentEmail" ORDER BY "createdAt" DESC LIMIT ${n}`,
    )
    return rows.map(r => ({
      id: r.id, toAddr: r.toAddr, subject: r.subject, kind: r.kind, status: r.status,
      resendId: r.resendId, error: r.error,
      createdAt: new Date(r.createdAt).toISOString(),
      resentAt: r.resentAt ? new Date(r.resentAt).toISOString() : null,
      // Re-sendable if we have the html stored, or a Resend id to fetch it from.
      canResend: Boolean((r as unknown as { hasHtml: boolean }).hasHtml) || Boolean(r.resendId),
    }))
  } catch { return [] }
}

/** One row with the bits needed to re-send it. */
export async function getSentEmailForResend(id: string): Promise<{ toAddr: string; subject: string; kind: string; html: string | null; resendId: string | null } | null> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ toAddr: string; subject: string; kind: string; html: string | null; resendId: string | null }[]>`
      SELECT "toAddr","subject","kind","html","resendId" FROM "SentEmail" WHERE "id" = ${id}`
    return rows[0] || null
  } catch { return null }
}

export async function markResent(id: string) {
  await ensure()
  try { await prisma.$executeRaw`UPDATE "SentEmail" SET "resentAt" = ${new Date()} WHERE "id" = ${id}` }
  catch (e) { console.error('[emailLog] markResent failed:', e) }
}

export async function countSentEmails(): Promise<number> {
  await ensure()
  try {
    const r = await prisma.$queryRawUnsafe<{ c: number | bigint }[]>(`SELECT COUNT(*) AS c FROM "SentEmail"`)
    return Number(r[0]?.c || 0)
  } catch { return 0 }
}

const FAIL_EVENTS = new Set(['bounced', 'failed', 'complained', 'suppressed'])

/**
 * Back-fill the log from Resend's own history (emails.list), deduped by Resend
 * id. Resend returns newest first and pages via an `after` cursor. Returns how
 * many new rows were added.
 */
export async function backfillFromResend(maxPages = 40): Promise<{ added: number; scanned: number }> {
  await ensure()
  const key = process.env.RESEND_API_KEY
  if (!key) return { added: 0, scanned: 0 }
  const { Resend } = await import('resend')
  const resend = new Resend(key)

  // Existing Resend ids so we don't double-insert.
  const existing = new Set<string>()
  try {
    const rows = await prisma.$queryRawUnsafe<{ resendId: string | null }[]>(`SELECT "resendId" FROM "SentEmail" WHERE "resendId" IS NOT NULL`)
    for (const r of rows) if (r.resendId) existing.add(r.resendId)
  } catch { /* ignore */ }

  let added = 0, scanned = 0
  let after: string | undefined
  for (let page = 0; page < maxPages; page++) {
    let res
    try { res = await resend.emails.list(after ? { limit: 100, after } : { limit: 100 }) }
    catch (e) { console.error('[emailLog] backfill list failed:', e); break }
    if (res.error) { console.error('[emailLog] backfill error:', res.error); break }
    const list = res.data?.data || []
    if (!list.length) break
    for (const e of list) {
      scanned++
      after = e.id
      if (!e.id || existing.has(e.id)) continue
      const to = Array.isArray(e.to) ? e.to.join(', ') : (e.to || '')
      const status = FAIL_EVENTS.has(e.last_event) ? 'error' : (e.last_event === 'canceled' ? 'skipped' : 'sent')
      const err = FAIL_EVENTS.has(e.last_event) ? e.last_event : null
      const createdAt = e.created_at ? new Date(e.created_at) : new Date()
      try {
        await prisma.$executeRaw`INSERT INTO "SentEmail" ("id","toAddr","subject","kind","status","resendId","error","createdAt")
          VALUES (${crypto.randomUUID()}, ${to.slice(0, 500)}, ${(e.subject || '').slice(0, 500)}, ${''}, ${status}, ${e.id}, ${err}, ${createdAt})`
        existing.add(e.id)
        added++
      } catch (err2) { console.error('[emailLog] backfill insert failed:', err2) }
    }
    if (!res.data?.has_more) break
  }
  return { added, scanned }
}
