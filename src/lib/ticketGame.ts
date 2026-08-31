import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'

// ── Ticket Game ──────────────────────────────────────────────────────────
// A self-contained instant-win mechanic, isolated from Competitions so it can
// never leak into the public competition grid or collide with the one-Winner-
// per-competition constraint. Prizes are defined as tiers (credit or custom
// physical prize) with quantities; outcomes are decided SERVER-SIDE as plays
// are revealed, dripping wins across the pool so a tier can't be over-awarded.
//
// Uses Prisma tagged-template raw queries so it works on BOTH SQLite (local)
// and Postgres (prod). Booleans are stored as INTEGER 0/1.

export interface TicketTier { type: 'credit' | 'custom'; amount: number; total: number; name?: string; image?: string }
export interface TicketGameConfig { published: boolean; priceP: number; poolSize: number; prizes: TicketTier[] }
export interface TicketWin { win: boolean; type?: 'credit' | 'custom'; amount?: number; name?: string; image?: string; ticketNumber?: number }

const DEFAULT_CONFIG: TicketGameConfig = { published: false, priceP: 10, poolSize: 500, prizes: [] }

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TicketGameConfig" (
      "id" INTEGER PRIMARY KEY,
      "published" INTEGER NOT NULL DEFAULT 0,
      "priceP" INTEGER NOT NULL DEFAULT 10,
      "poolSize" INTEGER NOT NULL DEFAULT 500,
      "prizes" TEXT NOT NULL DEFAULT '[]',
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
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

export function parsePrizes(raw: string | null | undefined): TicketTier[] {
  try {
    const arr = JSON.parse(raw || '[]')
    if (!Array.isArray(arr)) return []
    return arr
      .filter((p) => (p.type === 'credit' || p.type === 'custom') && Number(p.total) > 0)
      .map((p) => ({
        type: p.type === 'custom' ? 'custom' : 'credit' as TicketTier['type'],
        amount: Math.max(0, Number(p.amount) || 0),
        total: Math.max(0, Math.round(Number(p.total) || 0)),
        name: typeof p.name === 'string' ? p.name : undefined,
        image: typeof p.image === 'string' ? p.image : undefined,
      }))
  } catch { return [] }
}

export async function getConfig(): Promise<TicketGameConfig> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ published: number; priceP: number; poolSize: number; prizes: string }[]>`
      SELECT "published","priceP","poolSize","prizes" FROM "TicketGameConfig" WHERE "id" = 1`
    if (!rows.length) return { ...DEFAULT_CONFIG }
    const r = rows[0]
    return { published: Number(r.published) > 0, priceP: Number(r.priceP), poolSize: Number(r.poolSize), prizes: parsePrizes(r.prizes) }
  } catch { return { ...DEFAULT_CONFIG } }
}

export async function saveConfig(cfg: { priceP: number; poolSize: number; prizes: TicketTier[] }): Promise<void> {
  await ensure()
  const priceP = Math.max(1, Math.round(cfg.priceP))
  const poolSize = Math.max(1, Math.round(cfg.poolSize))
  const prizes = JSON.stringify(parsePrizes(JSON.stringify(cfg.prizes)))
  // Upsert the single config row (id = 1), preserving the published flag.
  const existing = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "TicketGameConfig" WHERE "id" = 1`
  if (existing.length) {
    await prisma.$executeRaw`UPDATE "TicketGameConfig" SET "priceP" = ${priceP}, "poolSize" = ${poolSize}, "prizes" = ${prizes} WHERE "id" = 1`
  } else {
    await prisma.$executeRaw`INSERT INTO "TicketGameConfig" ("id","published","priceP","poolSize","prizes") VALUES (1, 0, ${priceP}, ${poolSize}, ${prizes})`
  }
}

export async function setPublished(published: boolean): Promise<void> {
  await ensure()
  const val = published ? 1 : 0
  const existing = await prisma.$queryRaw<{ id: number }[]>`SELECT "id" FROM "TicketGameConfig" WHERE "id" = 1`
  if (existing.length) {
    await prisma.$executeRaw`UPDATE "TicketGameConfig" SET "published" = ${val} WHERE "id" = 1`
  } else {
    await prisma.$executeRaw`INSERT INTO "TicketGameConfig" ("id","published","priceP","poolSize","prizes") VALUES (1, ${val}, 10, 500, '[]')`
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

/** Won counts keyed by tier key (t0, t1, …), for pool accounting. */
async function wonByKey(): Promise<Record<string, number>> {
  const rows = await prisma.$queryRaw<{ prizeKey: string; c: number | bigint }[]>`
    SELECT "prizeKey", COUNT(*) AS c FROM "TicketGamePlay" WHERE "revealed" = 1 AND "prizeKey" IS NOT NULL GROUP BY "prizeKey"`
  const map: Record<string, number> = {}
  for (const r of rows) map[r.prizeKey] = Number(r.c)
  return map
}

async function revealedCount(): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "revealed" = 1`
  return Number(rows[0]?.c || 0)
}

interface Decision { winKey: string | null; tier: TicketTier | null }
function decide(prizes: TicketTier[], won: Record<string, number>, remainingEntries: number): Decision {
  const status = prizes.map((p, i) => ({ p, key: `t${i}`, left: Math.max(0, p.total - (won[`t${i}`] || 0)) }))
  const avail = status.filter(s => s.left > 0)
  const totalLeft = avail.reduce((s, t) => s + t.left, 0)
  if (totalLeft === 0 || remainingEntries <= 0) return { winKey: null, tier: null }
  const winChance = Math.min(1, totalLeft / Math.max(1, remainingEntries))
  if (Math.random() >= winChance) return { winKey: null, tier: null }
  let r = Math.random() * totalLeft
  for (const s of avail) {
    if (r < s.left) return { winKey: s.key, tier: s.p }
    r -= s.left
  }
  const last = avail[avail.length - 1]
  return { winKey: last.key, tier: last.p }
}

/**
 * Reveal the user's next unrevealed play. Decides the outcome server-side,
 * marks the play atomically (so a double-tap can't reveal twice), and pays out
 * (site credit → balance; custom prize → claimable win). Returns the result.
 */
export async function revealNext(userId: string): Promise<TicketWin | null> {
  await ensure()
  const cfg = await getConfig()

  for (let attempt = 0; attempt < 4; attempt++) {
    const nextRows = await prisma.$queryRaw<{ id: string; ticketNo: number }[]>`
      SELECT "id","ticketNo" FROM "TicketGamePlay" WHERE "userId" = ${userId} AND "revealed" = 0 ORDER BY "ticketNo" ASC LIMIT 1`
    if (!nextRows.length) return null
    const play = nextRows[0]

    const won = await wonByKey()
    const revealed = await revealedCount()
    const remainingEntries = Math.max(1, cfg.poolSize - revealed)
    const decision = decide(cfg.prizes, won, remainingEntries)

    const t = decision.tier
    const prizeKey = decision.winKey
    const prizeType = t ? t.type : null
    const prizeAmount = t ? t.amount : 0
    const prizeName = t?.type === 'custom' ? (t.name || 'Prize') : null
    const prizeImage = t?.type === 'custom' ? (t.image || null) : null

    // Atomic claim: only succeeds if the play is still unrevealed.
    const claimed = await prisma.$executeRaw`
      UPDATE "TicketGamePlay"
      SET "revealed" = 1, "prizeKey" = ${prizeKey}, "prizeType" = ${prizeType},
          "prizeAmount" = ${prizeAmount}, "prizeName" = ${prizeName}, "prizeImage" = ${prizeImage}
      WHERE "id" = ${play.id} AND "revealed" = 0`
    if (!claimed) continue // someone revealed it first — retry with the next one

    // Payout
    if (t?.type === 'credit' && t.amount > 0) {
      await prisma.user.update({ where: { id: userId }, data: { siteCredit: { increment: t.amount } } })
      await prisma.notification.create({
        data: { userId, title: `£${t.amount % 1 === 0 ? t.amount : t.amount.toFixed(2)} site credit won 🎉`, body: `You won £${t.amount % 1 === 0 ? t.amount : t.amount.toFixed(2)} in site credit on an Instant Win ticket — it's been added to your account balance.`, icon: 'win' },
      }).catch(() => {})
    } else if (t?.type === 'custom') {
      await prisma.notification.create({
        data: { userId, title: `You won ${prizeName}! 🎁`, body: `You won ${prizeName} on an Instant Win ticket. Head to your account to claim it and enter your delivery details.`, icon: 'win' },
      }).catch(() => {})
    }

    return {
      win: !!t,
      type: t?.type,
      amount: t?.amount,
      name: prizeName || undefined,
      image: prizeImage || undefined,
      ticketNumber: play.ticketNo,
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

/** For the admin dashboard: how many of each tier have been won. */
export async function poolStatus(): Promise<Array<TicketTier & { key: string; won: number; left: number }>> {
  const cfg = await getConfig()
  const won = await wonByKey()
  return cfg.prizes.map((p, i) => ({ ...p, key: `t${i}`, won: won[`t${i}`] || 0, left: Math.max(0, p.total - (won[`t${i}`] || 0)) }))
}
