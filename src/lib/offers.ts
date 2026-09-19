import { prisma } from '@/lib/prisma'

// Promotional offers, managed from the admin "Offers" tab. Self-creating table,
// DB-agnostic (booleans as INTEGER 0/1) so it works on prod Postgres + local SQLite.
//
// Two kinds:
//  - 'bundle'  : buy N tickets, get M free — always on the SAME comp (free
//                entries are for the comp bought, never a different prize).
//  - 'percent' : X% off, surfaced as a toggleable homepage popup.
//
// Scope is either a specific comp ('comp' + targetType + targetId) or 'site'
// (applies to any comp the customer buys).

export type OfferKind = 'bundle' | 'percent'
export type OfferScope = 'site' | 'comp'
export type TargetType = 'raffle' | 'game'

export interface Offer {
  id: string
  kind: OfferKind
  scope: OfferScope
  targetType: TargetType | null
  targetId: string | null
  targetTitle: string
  buyQty: number
  freeQty: number
  percentOff: number
  active: boolean
  createdAt: string
}

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Offer" (
      "id" TEXT PRIMARY KEY,
      "kind" TEXT NOT NULL DEFAULT 'bundle',
      "scope" TEXT NOT NULL DEFAULT 'comp',
      "targetType" TEXT,
      "targetId" TEXT,
      "targetTitle" TEXT NOT NULL DEFAULT '',
      "buyQty" INTEGER NOT NULL DEFAULT 0,
      "freeQty" INTEGER NOT NULL DEFAULT 0,
      "percentOff" INTEGER NOT NULL DEFAULT 0,
      "active" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    ensured = true
  } catch (e) { console.error('[offers] ensure failed:', e) }
}

interface Row {
  id: string; kind: string; scope: string; targetType: string | null; targetId: string | null
  targetTitle: string | null; buyQty: number; freeQty: number; percentOff: number; active: number; createdAt: string | Date
}
function toOffer(r: Row): Offer {
  return {
    id: r.id,
    kind: r.kind === 'percent' ? 'percent' : 'bundle',
    scope: r.scope === 'site' ? 'site' : 'comp',
    targetType: r.targetType === 'raffle' ? 'raffle' : r.targetType === 'game' ? 'game' : null,
    targetId: r.targetId || null,
    targetTitle: r.targetTitle || '',
    buyQty: Number(r.buyQty), freeQty: Number(r.freeQty), percentOff: Number(r.percentOff),
    active: Number(r.active) > 0,
    createdAt: String(r.createdAt),
  }
}
const COLS = `"id","kind","scope","targetType","targetId","targetTitle","buyQty","freeQty","percentOff","active","createdAt"`

export async function listOffers(): Promise<Offer[]> {
  await ensure()
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "Offer" ORDER BY "createdAt" DESC`)
  return rows.map(toOffer)
}

export async function createOffer(d: {
  kind: OfferKind; scope: OfferScope; targetType?: TargetType | null; targetId?: string | null; targetTitle?: string
  buyQty?: number; freeQty?: number; percentOff?: number; active?: boolean
}): Promise<Offer> {
  await ensure()
  const id = crypto.randomUUID()
  const scope = d.scope === 'site' ? 'site' : 'comp'
  const targetType = scope === 'site' ? null : (d.targetType === 'game' ? 'game' : 'raffle')
  const targetId = scope === 'site' ? null : (d.targetId || null)
  const buyQty = Math.max(0, Math.round(Number(d.buyQty) || 0))
  const freeQty = Math.max(0, Math.round(Number(d.freeQty) || 0))
  const percentOff = Math.min(100, Math.max(0, Math.round(Number(d.percentOff) || 0)))
  const active = d.active ? 1 : 0
  await prisma.$executeRaw`INSERT INTO "Offer" ("id","kind","scope","targetType","targetId","targetTitle","buyQty","freeQty","percentOff","active")
    VALUES (${id}, ${d.kind === 'percent' ? 'percent' : 'bundle'}, ${scope}, ${targetType}, ${targetId}, ${d.targetTitle || ''}, ${buyQty}, ${freeQty}, ${percentOff}, ${active})`
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "Offer" WHERE "id" = '${id.replace(/'/g, "''")}'`)
  return toOffer(rows[0])
}

export async function setOfferActive(id: string, active: boolean): Promise<void> {
  await ensure()
  await prisma.$executeRaw`UPDATE "Offer" SET "active" = ${active ? 1 : 0} WHERE "id" = ${id}`
}

export async function deleteOffer(id: string): Promise<void> {
  await ensure()
  await prisma.$executeRaw`DELETE FROM "Offer" WHERE "id" = ${id}`
}

/**
 * Free tickets to grant for a bundle purchase of `qty` on this target.
 * One bundle per order: qualifying qty (>= buyQty) grants exactly freeQty, no
 * multiples. A comp-specific offer wins over a site-wide one. Same-comp only.
 */
export async function resolveBundleFree(targetType: TargetType, targetId: string, qty: number): Promise<number> {
  await ensure()
  if (!targetId || qty < 1) return 0
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "Offer" WHERE "kind" = 'bundle' AND "active" = 1`)
  const offers = rows.map(toOffer).filter(o => o.buyQty > 0 && o.freeQty > 0 && qty >= o.buyQty)
  if (!offers.length) return 0
  // Comp-specific match wins; otherwise fall back to any site-wide bundle.
  const comp = offers.find(o => o.scope === 'comp' && o.targetType === targetType && o.targetId === targetId)
  const site = offers.find(o => o.scope === 'site')
  const chosen = comp || site
  return chosen ? chosen.freeQty : 0
}

/**
 * The active bundle offer that applies to this target (comp-specific wins over
 * site-wide), for showing "buy X get Y free" on the competition page. Returns
 * the offer's buy/free numbers, or null if none is live.
 */
export async function getBundleFor(targetType: TargetType, targetId: string): Promise<{ buyQty: number; freeQty: number } | null> {
  await ensure()
  if (!targetId) return null
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "Offer" WHERE "kind" = 'bundle' AND "active" = 1`)
  const offers = rows.map(toOffer).filter(o => o.buyQty > 0 && o.freeQty > 0)
  const comp = offers.find(o => o.scope === 'comp' && o.targetType === targetType && o.targetId === targetId)
  const site = offers.find(o => o.scope === 'site')
  const chosen = comp || site
  return chosen ? { buyQty: chosen.buyQty, freeQty: chosen.freeQty } : null
}

/** The active percent offer to surface on the homepage popup (most recent). */
export async function getActivePercentOffer(): Promise<Offer | null> {
  await ensure()
  const rows = await prisma.$queryRawUnsafe<Row[]>(`SELECT ${COLS} FROM "Offer" WHERE "kind" = 'percent' AND "active" = 1 ORDER BY "createdAt" DESC`)
  return rows.length ? toOffer(rows[0]) : null
}
