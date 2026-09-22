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
    ensured = true
  } catch (e) { console.error('[emailLog] ensure failed:', e) }
}

export interface SentEmail {
  id: string; toAddr: string; subject: string; kind: string
  status: string; resendId: string | null; error: string | null; createdAt: string
}

/** Record one send. Best-effort — never throws, so it can't break a request. */
export async function logEmail(d: { to: string | string[]; subject: string; kind?: string; status: string; resendId?: string | null; error?: string | null }) {
  try {
    await ensure()
    const to = Array.isArray(d.to) ? d.to.join(', ') : (d.to || '')
    const id = crypto.randomUUID()
    await prisma.$executeRaw`INSERT INTO "SentEmail" ("id","toAddr","subject","kind","status","resendId","error")
      VALUES (${id}, ${to.slice(0, 500)}, ${(d.subject || '').slice(0, 500)}, ${d.kind || ''}, ${d.status}, ${d.resendId || null}, ${d.error ? String(d.error).slice(0, 500) : null})`
  } catch (e) { console.error('[emailLog] logEmail failed:', e) }
}

export async function listSentEmails(limit = 200): Promise<SentEmail[]> {
  await ensure()
  try {
    const n = Math.min(1000, Math.max(1, Math.round(limit)))
    const rows = await prisma.$queryRawUnsafe<{ id: string; toAddr: string; subject: string; kind: string; status: string; resendId: string | null; error: string | null; createdAt: Date }[]>(
      `SELECT "id","toAddr","subject","kind","status","resendId","error","createdAt" FROM "SentEmail" ORDER BY "createdAt" DESC LIMIT ${n}`,
    )
    return rows.map(r => ({ ...r, createdAt: new Date(r.createdAt).toISOString() }))
  } catch { return [] }
}

export async function countSentEmails(): Promise<number> {
  await ensure()
  try {
    const r = await prisma.$queryRawUnsafe<{ c: number | bigint }[]>(`SELECT COUNT(*) AS c FROM "SentEmail"`)
    return Number(r[0]?.c || 0)
  } catch { return 0 }
}
