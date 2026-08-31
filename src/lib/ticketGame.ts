import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'

// ── Ticket Game ──────────────────────────────────────────────────────────
// A self-contained instant-win mechanic, isolated from Competitions. The admin
// picks EXACTLY which ticket numbers win and what each one holds (site credit
// or a custom physical prize). Plays are minted with a sequential ticket number
// as they're bought; revealing a play looks up whether its number is a winner —
// so outcomes are deterministic and fully controlled by the admin.
//
// Uses Prisma tagged-template raw queries so it works on BOTH SQLite (local)
// and Postgres (prod). Booleans are stored as INTEGER 0/1. The winners map is
// stored as JSON in the "prizes" column.

export interface WinnerDef { type: 'credit' | 'custom'; amount: number; name?: string; image?: string }
export interface TicketGameConfig { published: boolean; priceP: number; poolSize: number; image: string; winners: Record<number, WinnerDef> }
export interface AggPrize { type: 'credit' | 'custom'; amount: number; name?: string; image?: string; total: number }
export interface TicketWin { win: boolean; type?: 'credit' | 'custom'; amount?: number; name?: string; image?: string; ticketNumber?: number }

const DEFAULT_CONFIG: TicketGameConfig = { published: false, priceP: 10, poolSize: 500, image: '', winners: {} }

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TicketGameConfig" (
      "id" INTEGER PRIMARY KEY,
      "published" INTEGER NOT NULL DEFAULT 0,
      "priceP" INTEGER NOT NULL DEFAULT 10,
      "poolSize" INTEGER NOT NULL DEFAULT 500,
      "prizes" TEXT NOT NULL DEFAULT '{}',
      "image" TEXT NOT NULL DEFAULT '',
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    // Add the image column for configs created before it existed (safe on both DBs).
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "TicketGameConfig" ADD COLUMN "image" TEXT NOT NULL DEFAULT ''`) } catch { /* column already exists */ }
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TicketGamePlay" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "ticketNo" INTEGER NOT NULL DEFAULT 0,
      "revealed" INTEGER NOT NULL DEFAULT 0,
      "prizeKey" TEXT,
      "prizeType" TEXT,
      "prizeAmount" REAL NOT NULL DEFAULT 0,
      "prizeName" TEXT,
      "prizeImage" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TicketGameClaim" (
      "playId" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "addressLine1" TEXT NOT NULL,
      "addressLine2" TEXT,
      "city" TEXT NOT NULL,
      "postcode" TEXT NOT NULL,
      "phone" TEXT,
      "claimedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    ensured = true
  } catch (e) { console.error('[ticketGame] ensure failed:', e) }
}

function cleanWinner(p: unknown): WinnerDef | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>
  const type = o.type === 'custom' ? 'custom' : 'credit'
  return {
    type,
    amount: Math.max(0, Number(o.amount) || 0),
    name: typeof o.name === 'string' ? o.name : undefined,
    image: typeof o.image === 'string' ? o.image : undefined,
  }
}

export function parseWinners(raw: string | null | undefined): Record<number, WinnerDef> {
  try {
    const obj = JSON.parse(raw || '{}')
    const out: Record<number, WinnerDef> = {}
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj)) {
        const n = parseInt(k, 10)
        const w = cleanWinner(v)
        if (Number.isFinite(n) && n > 0 && w) out[n] = w
      }
    }
    return out
  } catch { return {} }
}

/** Group the winners map into distinct prizes (for public display). */
export function aggregatePrizes(winners: Record<number, WinnerDef>): AggPrize[] {
  const map = new Map<string, AggPrize>()
  for (const w of Object.values(winners)) {
    const key = w.type === 'credit' ? `credit:${w.amount}` : `custom:${w.name}|${w.amount}|${w.image ? 'img' : ''}`
    const ex = map.get(key)
    if (ex) ex.total++
    else map.set(key, { type: w.type, amount: w.amount, name: w.name, image: w.image, total: 1 })
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount)
}

export async function getConfig(): Promise<TicketGameConfig> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ published: number; priceP: number; poolSize: number; prizes: string; image: string | null }[]>`
      SELECT "published","priceP","poolSize","prizes","image" FROM "TicketGameConfig" WHERE "id" = 1`
    if (!rows.length) return { ...DEFAULT_CONFIG }
    const r = rows[0]
    return { published: Number(r.published) > 0, priceP: Number(r.priceP), poolSize: Number(r.poolSize), image: r.image || '', winners: parseWinners(r.prizes) }
  } catch { return { ...DEFAULT_CONFIG } }
}

export async function saveConfig(cfg: { priceP: number; poolSize: number; image?: string; winners: Record<number, WinnerDef> }): Promise<void> {
  await ensure()
  const priceP = Math.max(1, Math.round(cfg.priceP))
  const poolSize = Math.max(1, Math.round(cfg.poolSize))
  const image = typeof cfg.image === 'string' ? cfg.image : ''
  // Keep only winners whose ticket number falls within the pool.
  const clean: Record<number, WinnerDef> = {}
  for (const [k, v] of Object.entries(cfg.winners || {})) {
    const n = parseInt(k, 10); const w = cleanWinner(v)
    if (Number.isFinite(n) && n >= 1 && n <= poolSize && w) clean[n] = w
  }
  const winners = JSON.stringify(clean)
  const existing = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "TicketGameConfig" WHERE "id" = 1`
  if (existing.length) {
    await prisma.$executeRaw`UPDATE "TicketGameConfig" SET "priceP" = ${priceP}, "poolSize" = ${poolSize}, "image" = ${image}, "prizes" = ${winners} WHERE "id" = 1`
  } else {
    await prisma.$executeRaw`INSERT INTO "TicketGameConfig" ("id","published","priceP","poolSize","image","prizes") VALUES (1, 0, ${priceP}, ${poolSize}, ${image}, ${winners})`
  }
}

export async function setPublished(published: boolean): Promise<void> {
  await ensure()
  const val = published ? 1 : 0
  const existing = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "TicketGameConfig" WHERE "id" = 1`
  if (existing.length) {
    await prisma.$executeRaw`UPDATE "TicketGameConfig" SET "published" = ${val} WHERE "id" = 1`
  } else {
    await prisma.$executeRaw`INSERT INTO "TicketGameConfig" ("id","published","priceP","poolSize","prizes") VALUES (1, ${val}, 10, 500, '{}')`
  }
}

/** Total plays sold (revealed or not). */
export async function countSold(): Promise<number> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay"`
    return Number(rows[0]?.c || 0)
  } catch { return 0 }
}

/** How many unrevealed plays a user is holding. */
export async function countUnrevealed(userId: string): Promise<number> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "userId" = ${userId} AND "revealed" = 0`
    return Number(rows[0]?.c || 0)
  } catch { return 0 }
}

/** How many winning tickets have been revealed so far. */
export async function countWon(): Promise<number> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "revealed" = 1 AND "prizeType" IS NOT NULL`
    return Number(rows[0]?.c || 0)
  } catch { return 0 }
}

/** Mint N plays for a user (called after payment / credit purchase). */
export async function createPlays(userId: string, qty: number): Promise<void> {
  await ensure()
  const n = Math.max(0, Math.round(qty))
  if (!userId || n <= 0) return
  const maxRows = await prisma.$queryRaw<{ m: number | bigint | null }[]>`SELECT MAX("ticketNo") AS m FROM "TicketGamePlay"`
  let next = Number(maxRows[0]?.m || 0)
  for (let i = 0; i < n; i++) {
    next += 1
    const id = crypto.randomUUID()
    await prisma.$executeRaw`INSERT INTO "TicketGamePlay" ("id","userId","ticketNo","revealed") VALUES (${id}, ${userId}, ${next}, 0)`
  }
}

/**
 * Reveal the user's next unrevealed play. Its outcome is fixed by its ticket
 * number: if the admin marked that number as a winner, it wins that prize;
 * otherwise it's a no-win. Marks the play atomically (so a double-tap can't
 * reveal twice) and pays out (site credit → balance; custom prize → claimable).
 */
export async function revealNext(userId: string): Promise<TicketWin | null> {
  await ensure()
  const cfg = await getConfig()

  for (let attempt = 0; attempt < 4; attempt++) {
    const nextRows = await prisma.$queryRaw<{ id: string; ticketNo: number }[]>`
      SELECT "id","ticketNo" FROM "TicketGamePlay" WHERE "userId" = ${userId} AND "revealed" = 0 ORDER BY "ticketNo" ASC LIMIT 1`
    if (!nextRows.length) return null
    const play = nextRows[0]
    const ticketNo = Number(play.ticketNo)

    const w = cfg.winners[ticketNo] || null
    const prizeKey = w ? `n${ticketNo}` : null
    const prizeType = w ? w.type : null
    const prizeAmount = w ? w.amount : 0
    const prizeName = w?.type === 'custom' ? (w.name || 'Prize') : null
    const prizeImage = w?.type === 'custom' ? (w.image || null) : null

    // Atomic claim: only succeeds if the play is still unrevealed.
    const claimed = await prisma.$executeRaw`
      UPDATE "TicketGamePlay"
      SET "revealed" = 1, "prizeKey" = ${prizeKey}, "prizeType" = ${prizeType},
          "prizeAmount" = ${prizeAmount}, "prizeName" = ${prizeName}, "prizeImage" = ${prizeImage}
      WHERE "id" = ${play.id} AND "revealed" = 0`
    if (!claimed) continue // someone revealed it first — retry with the next one

    // Payout
    if (w?.type === 'credit' && w.amount > 0) {
      await prisma.user.update({ where: { id: userId }, data: { siteCredit: { increment: w.amount } } })
      await prisma.notification.create({
        data: { userId, title: `£${w.amount % 1 === 0 ? w.amount : w.amount.toFixed(2)} site credit won 🎉`, body: `You won £${w.amount % 1 === 0 ? w.amount : w.amount.toFixed(2)} in site credit on an Instant Win ticket — it's been added to your account balance.`, icon: 'win' },
      }).catch(() => {})
    } else if (w?.type === 'custom') {
      await prisma.notification.create({
        data: { userId, title: `You won ${prizeName}! 🎁`, body: `You won ${prizeName} on an Instant Win ticket. Head to your account to claim it and enter your delivery details.`, icon: 'win' },
      }).catch(() => {})
    }

    return {
      win: !!w,
      type: w?.type,
      amount: w?.amount,
      name: prizeName || undefined,
      image: prizeImage || undefined,
      ticketNumber: ticketNo,
    }
  }
  return null
}

// ── Wins + claims (custom physical prizes) ───────────────────────────────
export interface TicketWinRow {
  playId: string
  userId: string
  type: 'credit' | 'custom'
  amount: number
  name: string | null
  image: string | null
  ticketNo: number
  createdAt: string
  claim?: TicketClaimRow
}
export interface TicketClaimRow { playId: string; userId: string; fullName: string; addressLine1: string; addressLine2: string | null; city: string; postcode: string; phone: string | null }

/** A user's revealed wins (for "Your Wins" in the account). */
export async function getWinsForUser(userId: string): Promise<TicketWinRow[]> {
  await ensure()
  const rows = await prisma.$queryRaw<{ id: string; prizeType: string; prizeAmount: number; prizeName: string | null; prizeImage: string | null; ticketNo: number; createdAt: string }[]>`
    SELECT "id","prizeType","prizeAmount","prizeName","prizeImage","ticketNo","createdAt"
    FROM "TicketGamePlay" WHERE "userId" = ${userId} AND "revealed" = 1 AND "prizeType" IS NOT NULL ORDER BY "ticketNo" DESC`
  const claims = await claimsForUser(userId)
  return rows.map(r => ({
    playId: r.id, userId, type: r.prizeType === 'custom' ? 'custom' : 'credit', amount: Number(r.prizeAmount),
    name: r.prizeName, image: r.prizeImage, ticketNo: Number(r.ticketNo), createdAt: String(r.createdAt), claim: claims[r.id],
  }))
}

async function claimsForUser(userId: string): Promise<Record<string, TicketClaimRow>> {
  const rows = await prisma.$queryRaw<TicketClaimRow[]>`SELECT "playId","userId","fullName","addressLine1","addressLine2","city","postcode","phone" FROM "TicketGameClaim" WHERE "userId" = ${userId}`
  const map: Record<string, TicketClaimRow> = {}
  for (const r of rows) map[r.playId] = r
  return map
}

/** Verify a custom-prize win belongs to the user, then store their delivery details. */
export async function submitClaim(playId: string, userId: string, d: { fullName: string; addressLine1: string; addressLine2?: string; city: string; postcode: string; phone?: string }): Promise<{ ok: boolean; error?: string }> {
  await ensure()
  const rows = await prisma.$queryRaw<{ id: string; prizeType: string | null }[]>`SELECT "id","prizeType" FROM "TicketGamePlay" WHERE "id" = ${playId} AND "userId" = ${userId} AND "revealed" = 1`
  if (!rows.length) return { ok: false, error: 'Prize not found' }
  if (rows[0].prizeType !== 'custom') return { ok: false, error: 'This prize does not need a delivery address' }
  const existing = await prisma.$queryRaw<{ playId: string }[]>`SELECT "playId" FROM "TicketGameClaim" WHERE "playId" = ${playId}`
  if (existing.length) {
    await prisma.$executeRaw`UPDATE "TicketGameClaim" SET "fullName" = ${d.fullName}, "addressLine1" = ${d.addressLine1}, "addressLine2" = ${d.addressLine2 || null}, "city" = ${d.city}, "postcode" = ${d.postcode}, "phone" = ${d.phone || null} WHERE "playId" = ${playId}`
  } else {
    await prisma.$executeRaw`INSERT INTO "TicketGameClaim" ("playId","userId","fullName","addressLine1","addressLine2","city","postcode","phone") VALUES (${playId}, ${userId}, ${d.fullName}, ${d.addressLine1}, ${d.addressLine2 || null}, ${d.city}, ${d.postcode}, ${d.phone || null})`
  }
  await prisma.notification.create({ data: { userId, title: 'Prize claim received', body: `Thanks — we've received your delivery details and will arrange your prize.`, icon: 'info' } }).catch(() => {})
  return { ok: true }
}

/** All custom-prize wins for admin fulfilment, newest first, with claim + winner details. */
export async function listCustomWinsForAdmin(): Promise<Array<TicketWinRow & { userName: string; userEmail: string }>> {
  await ensure()
  const rows = await prisma.$queryRaw<{ id: string; userId: string; prizeAmount: number; prizeName: string | null; prizeImage: string | null; ticketNo: number; createdAt: string }[]>`
    SELECT "id","userId","prizeAmount","prizeName","prizeImage","ticketNo","createdAt"
    FROM "TicketGamePlay" WHERE "revealed" = 1 AND "prizeType" = 'custom' ORDER BY "ticketNo" DESC`
  if (!rows.length) return []
  const userIds = [...new Set(rows.map(r => r.userId))]
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
  const byUser = new Map(users.map(u => [u.id, u]))
  const claimRows = await prisma.$queryRaw<TicketClaimRow[]>`SELECT "playId","userId","fullName","addressLine1","addressLine2","city","postcode","phone" FROM "TicketGameClaim"`
  const claimByPlay = new Map(claimRows.map(c => [c.playId, c]))
  return rows.map(r => ({
    playId: r.id, userId: r.userId, type: 'custom' as const, amount: Number(r.prizeAmount), name: r.prizeName, image: r.prizeImage,
    ticketNo: Number(r.ticketNo), createdAt: String(r.createdAt), claim: claimByPlay.get(r.id),
    userName: byUser.get(r.userId)?.name || 'Unknown', userEmail: byUser.get(r.userId)?.email || '',
  }))
}
