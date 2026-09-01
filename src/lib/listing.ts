import { prisma } from '@/lib/prisma'

// A single saved manual order for the public listings (homepage + competitions),
// spanning BOTH competitions and instant/ticket games. Stored as an ordered list
// of item ids. Items not in the list fall back to time order (earliest finishing
// first). DB-agnostic (SQLite + Postgres).

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ListingOrder" (
      "id" INTEGER PRIMARY KEY,
      "ids" TEXT NOT NULL DEFAULT '[]',
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    ensured = true
  } catch (e) { console.error('[listing] ensure failed:', e) }
}

export async function getListingOrder(): Promise<string[]> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ ids: string }[]>`SELECT "ids" FROM "ListingOrder" WHERE "id" = 1`
    if (!rows.length) return []
    const arr = JSON.parse(rows[0].ids)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch { return [] }
}

export async function setListingOrder(ids: string[]): Promise<void> {
  await ensure()
  const json = JSON.stringify((ids || []).filter(x => typeof x === 'string'))
  const ex = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "ListingOrder" WHERE "id" = 1`
  if (ex.length) await prisma.$executeRaw`UPDATE "ListingOrder" SET "ids" = ${json} WHERE "id" = 1`
  else await prisma.$executeRaw`INSERT INTO "ListingOrder" ("id","ids") VALUES (1, ${json})`
}

/**
 * Sort listing items by the saved manual order first, then by end time
 * (earliest finishing first). Items with no future end date sink to the end.
 */
export function sortByListingOrder<T extends { id: string; drawDate?: string | null }>(items: T[], order: string[], now: number = Date.now()): T[] {
  const idx = new Map(order.map((k, i) => [k, i]))
  const timeKey = (d?: string | null) => {
    if (!d) return Number.MAX_SAFE_INTEGER
    const t = new Date(d).getTime()
    return Number.isNaN(t) || t < now ? Number.MAX_SAFE_INTEGER : t
  }
  return [...items].sort((a, b) => {
    const ia = idx.has(a.id) ? idx.get(a.id)! : Number.MAX_SAFE_INTEGER
    const ib = idx.has(b.id) ? idx.get(b.id)! : Number.MAX_SAFE_INTEGER
    if (ia !== ib) return ia - ib
    return timeKey(a.drawDate) - timeKey(b.drawDate)
  })
}
