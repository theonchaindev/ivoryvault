import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'

// ── Instant Win Games ─────────────────────────────────────────────────────
// A collection of self-contained instant-win games. Each game has its own
// prizes (specific winning ticket numbers), price, pool size, image, countdown
// and published flag — and is created + managed exactly like the original
// single "ticket game". Plays/claims are keyed by gameId.
//
// Self-creating tables + DB-agnostic tagged-template raw queries (SQLite + PG).
// The previous singleton (TicketGameConfig id=1) is migrated in as the first
// game so the live game is preserved.

export interface WinnerDef { type: 'credit' | 'custom'; amount: number; name?: string; image?: string }
export type GameKind = 'ticket' | 'instant'
export interface Game {
  id: string; slug: string; name: string; kind: GameKind; published: boolean
  priceP: number; poolSize: number; image: string; endsAt: string | null
  winners: Record<number, WinnerDef>; createdAt: string
}
export interface AggPrize { type: 'credit' | 'custom'; amount: number; name?: string; image?: string; total: number }
export interface TicketWin { win: boolean; type?: 'credit' | 'custom'; amount?: number; name?: string; image?: string; ticketNumber?: number }

export const IG_ITEM_PREFIX = '__ig__'
export const igItem = (gameId: string) => `${IG_ITEM_PREFIX}${gameId}`
export const gameIdFromItem = (item: string) => (item.startsWith(IG_ITEM_PREFIX) ? item.slice(IG_ITEM_PREFIX.length) : null)

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "InstantGame" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE,
      "name" TEXT NOT NULL DEFAULT 'Instant Win',
      "kind" TEXT NOT NULL DEFAULT 'ticket',
      "published" INTEGER NOT NULL DEFAULT 0,
      "priceP" INTEGER NOT NULL DEFAULT 50,
      "poolSize" INTEGER NOT NULL DEFAULT 500,
      "image" TEXT NOT NULL DEFAULT '',
      "endsAt" TEXT,
      "prizes" TEXT NOT NULL DEFAULT '{}',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "InstantGame" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'ticket'`) } catch { /* exists */ }
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
    // Plays gain a gameId so a single table serves every game.
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "TicketGamePlay" ADD COLUMN "gameId" TEXT`) } catch { /* exists */ }
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
    await migrateSingleton()
  } catch (e) { console.error('[instantGames] ensure failed:', e) }
}

/** One-time: turn the old single ticket game (TicketGameConfig id=1) into a Game. */
async function migrateSingleton() {
  try {
    const games = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "InstantGame"`
    if (Number(games[0]?.c || 0) > 0) return
    const old = await prisma.$queryRaw<{ published: number; priceP: number; poolSize: number; prizes: string; image: string | null; endsAt: string | null }[]>`
      SELECT "published","priceP","poolSize","prizes","image","endsAt" FROM "TicketGameConfig" WHERE "id" = 1`
    if (!old.length) return
    const o = old[0]
    const id = crypto.randomUUID()
    await prisma.$executeRaw`INSERT INTO "InstantGame" ("id","slug","name","published","priceP","poolSize","image","endsAt","prizes")
      VALUES (${id}, ${'instant-tickets'}, ${'Instant Win Tickets'}, ${Number(o.published) > 0 ? 1 : 0}, ${Number(o.priceP)}, ${Number(o.poolSize)}, ${o.image || ''}, ${o.endsAt || null}, ${o.prizes || '{}'})`
    // Existing plays belong to this migrated game.
    await prisma.$executeRaw`UPDATE "TicketGamePlay" SET "gameId" = ${id} WHERE "gameId" IS NULL`
  } catch (e) { console.error('[instantGames] migrate failed:', e) }
}

// ── prize helpers ──────────────────────────────────────────────────────────
function cleanWinner(p: unknown): WinnerDef | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>
  return { type: o.type === 'custom' ? 'custom' : 'credit', amount: Math.max(0, Number(o.amount) || 0), name: typeof o.name === 'string' ? o.name : undefined, image: typeof o.image === 'string' ? o.image : undefined }
}
export function parseWinners(raw: string | null | undefined): Record<number, WinnerDef> {
  try {
    const obj = JSON.parse(raw || '{}')
    const out: Record<number, WinnerDef> = {}
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj)) { const n = parseInt(k, 10); const w = cleanWinner(v); if (Number.isFinite(n) && n > 0 && w) out[n] = w }
    }
    return out
  } catch { return {} }
}
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

function rowToGame(r: { id: string; slug: string; name: string; kind: string | null; published: number; priceP: number; poolSize: number; image: string | null; endsAt: string | null; prizes: string; createdAt: string }): Game {
  return { id: r.id, slug: r.slug, name: r.name, kind: r.kind === 'instant' ? 'instant' : 'ticket', published: Number(r.published) > 0, priceP: Number(r.priceP), poolSize: Number(r.poolSize), image: r.image || '', endsAt: r.endsAt || null, winners: parseWinners(r.prizes), createdAt: String(r.createdAt) }
}
type GameRow = Parameters<typeof rowToGame>[0]
const SELECT_COLS = `"id","slug","name","kind","published","priceP","poolSize","image","endsAt","prizes","createdAt"`

// ── CRUD ─────────────────────────────────────────────────────────────────
export async function listGames(kind?: GameKind): Promise<Game[]> {
  await ensure()
  const where = kind ? ` WHERE "kind" = '${kind}'` : ''
  const rows = await prisma.$queryRawUnsafe<GameRow[]>(`SELECT ${SELECT_COLS} FROM "InstantGame"${where} ORDER BY "createdAt" ASC`)
  return rows.map(rowToGame)
}
export async function getGameById(id: string): Promise<Game | null> {
  await ensure()
  const rows = await prisma.$queryRawUnsafe<GameRow[]>(`SELECT ${SELECT_COLS} FROM "InstantGame" WHERE "id" = '${id.replace(/'/g, "''")}'`)
  return rows.length ? rowToGame(rows[0]) : null
}
export async function getGameBySlug(slug: string): Promise<Game | null> {
  await ensure()
  const rows = await prisma.$queryRawUnsafe<GameRow[]>(`SELECT ${SELECT_COLS} FROM "InstantGame" WHERE "slug" = '${slug.replace(/'/g, "''")}'`)
  return rows.length ? rowToGame(rows[0]) : null
}

async function slugExists(slug: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ x: number }[]>`SELECT 1 AS x FROM "InstantGame" WHERE "slug" = ${slug}`
  return rows.length > 0
}
function slugify(name: string): string {
  return (name || 'instant-win').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'instant-win'
}

export async function createGame(name: string, kind: GameKind = 'ticket'): Promise<Game> {
  await ensure()
  const clean = (name || '').trim() || 'New Instant Win'
  let slug = slugify(clean); let i = 2
  while (await slugExists(slug)) { slug = `${slugify(clean)}-${i++}` }
  const id = crypto.randomUUID()
  const k = kind === 'instant' ? 'instant' : 'ticket'
  await prisma.$executeRaw`INSERT INTO "InstantGame" ("id","slug","name","kind","published","priceP","poolSize","image","prizes") VALUES (${id}, ${slug}, ${clean}, ${k}, 0, 50, 500, '', '{}')`
  return (await getGameById(id))!
}

export async function updateGame(id: string, d: { name?: string; priceP: number; poolSize: number; image?: string; endsAt?: string | null; winners: Record<number, WinnerDef> }): Promise<void> {
  await ensure()
  const priceP = Math.max(1, Math.round(d.priceP))
  const poolSize = Math.max(1, Math.round(d.poolSize))
  const image = typeof d.image === 'string' ? d.image : ''
  const endsAt = d.endsAt ? new Date(d.endsAt).toISOString() : null
  const name = (d.name || '').trim()
  const clean: Record<number, WinnerDef> = {}
  for (const [k, v] of Object.entries(d.winners || {})) { const n = parseInt(k, 10); const w = cleanWinner(v); if (Number.isFinite(n) && n >= 1 && n <= poolSize && w) clean[n] = w }
  const winners = JSON.stringify(clean)
  if (name) {
    await prisma.$executeRaw`UPDATE "InstantGame" SET "name" = ${name}, "priceP" = ${priceP}, "poolSize" = ${poolSize}, "image" = ${image}, "endsAt" = ${endsAt}, "prizes" = ${winners} WHERE "id" = ${id}`
  } else {
    await prisma.$executeRaw`UPDATE "InstantGame" SET "priceP" = ${priceP}, "poolSize" = ${poolSize}, "image" = ${image}, "endsAt" = ${endsAt}, "prizes" = ${winners} WHERE "id" = ${id}`
  }
}

export async function setGamePublished(id: string, published: boolean): Promise<void> {
  await ensure()
  await prisma.$executeRaw`UPDATE "InstantGame" SET "published" = ${published ? 1 : 0} WHERE "id" = ${id}`
  if (published) {
    // Ensure a countdown exists — default to 30 days if none set.
    const g = await getGameById(id)
    if (g && !g.endsAt) {
      const iso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await prisma.$executeRaw`UPDATE "InstantGame" SET "endsAt" = ${iso} WHERE "id" = ${id} AND ("endsAt" IS NULL OR "endsAt" = '')`
    }
  }
}

export async function deleteGame(id: string): Promise<void> {
  await ensure()
  await prisma.$executeRaw`DELETE FROM "TicketGameClaim" WHERE "playId" IN (SELECT "id" FROM "TicketGamePlay" WHERE "gameId" = ${id})`
  await prisma.$executeRaw`DELETE FROM "TicketGamePlay" WHERE "gameId" = ${id}`
  await prisma.$executeRaw`DELETE FROM "InstantGame" WHERE "id" = ${id}`
}

// ── plays ──────────────────────────────────────────────────────────────────
export async function countSold(gameId: string): Promise<number> {
  await ensure()
  try { const r = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "gameId" = ${gameId}`; return Number(r[0]?.c || 0) } catch { return 0 }
}
export async function countWon(gameId: string): Promise<number> {
  await ensure()
  try { const r = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "gameId" = ${gameId} AND "revealed" = 1 AND "prizeType" IS NOT NULL`; return Number(r[0]?.c || 0) } catch { return 0 }
}
export async function countUnrevealed(gameId: string, userId: string): Promise<number> {
  await ensure()
  try { const r = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "TicketGamePlay" WHERE "gameId" = ${gameId} AND "userId" = ${userId} AND "revealed" = 0`; return Number(r[0]?.c || 0) } catch { return 0 }
}
export async function createPlays(gameId: string, userId: string, qty: number): Promise<void> {
  await ensure()
  const n = Math.max(0, Math.round(qty))
  if (!gameId || !userId || n <= 0) return
  const maxRows = await prisma.$queryRaw<{ m: number | bigint | null }[]>`SELECT MAX("ticketNo") AS m FROM "TicketGamePlay" WHERE "gameId" = ${gameId}`
  let next = Number(maxRows[0]?.m || 0)
  for (let i = 0; i < n; i++) { next += 1; const id = crypto.randomUUID(); await prisma.$executeRaw`INSERT INTO "TicketGamePlay" ("id","gameId","userId","ticketNo","revealed") VALUES (${id}, ${gameId}, ${userId}, ${next}, 0)` }
}
export async function resetPlays(gameId: string): Promise<void> {
  await ensure()
  await prisma.$executeRaw`DELETE FROM "TicketGameClaim" WHERE "playId" IN (SELECT "id" FROM "TicketGamePlay" WHERE "gameId" = ${gameId})`
  await prisma.$executeRaw`DELETE FROM "TicketGamePlay" WHERE "gameId" = ${gameId}`
}

export async function revealNext(gameId: string, userId: string): Promise<TicketWin | null> {
  await ensure()
  const game = await getGameById(gameId)
  if (!game) return null
  for (let attempt = 0; attempt < 4; attempt++) {
    const nextRows = await prisma.$queryRaw<{ id: string; ticketNo: number }[]>`SELECT "id","ticketNo" FROM "TicketGamePlay" WHERE "gameId" = ${gameId} AND "userId" = ${userId} AND "revealed" = 0 ORDER BY "ticketNo" ASC LIMIT 1`
    if (!nextRows.length) return null
    const play = nextRows[0]; const ticketNo = Number(play.ticketNo)
    const w = game.winners[ticketNo] || null
    const prizeKey = w ? `n${ticketNo}` : null
    const prizeType = w ? w.type : null
    const prizeAmount = w ? w.amount : 0
    const prizeName = w?.type === 'custom' ? (w.name || 'Prize') : null
    const prizeImage = w?.type === 'custom' ? (w.image || null) : null
    const claimed = await prisma.$executeRaw`UPDATE "TicketGamePlay" SET "revealed" = 1, "prizeKey" = ${prizeKey}, "prizeType" = ${prizeType}, "prizeAmount" = ${prizeAmount}, "prizeName" = ${prizeName}, "prizeImage" = ${prizeImage} WHERE "id" = ${play.id} AND "revealed" = 0`
    if (!claimed) continue
    if (w?.type === 'credit' && w.amount > 0) {
      await prisma.user.update({ where: { id: userId }, data: { siteCredit: { increment: w.amount } } })
      await prisma.notification.create({ data: { userId, title: `£${w.amount % 1 === 0 ? w.amount : w.amount.toFixed(2)} site credit won 🎉`, body: `You won £${w.amount % 1 === 0 ? w.amount : w.amount.toFixed(2)} in site credit on ${game.name} — it's been added to your account balance.`, icon: 'win' } }).catch(() => {})
    } else if (w?.type === 'custom') {
      await prisma.notification.create({ data: { userId, title: `You won ${prizeName}! 🎁`, body: `You won ${prizeName} on ${game.name}. Head to your account to claim it and enter your delivery details.`, icon: 'win' } }).catch(() => {})
    }
    return { win: !!w, type: w?.type, amount: w?.amount, name: prizeName || undefined, image: prizeImage || undefined, ticketNumber: ticketNo }
  }
  return null
}

// ── wins + claims ──────────────────────────────────────────────────────────
export interface TicketWinRow { playId: string; gameId: string; gameName: string; type: 'credit' | 'custom'; amount: number; name: string | null; image: string | null; ticketNo: number; createdAt: string; claim?: TicketClaimRow }
export interface TicketClaimRow { playId: string; userId: string; fullName: string; addressLine1: string; addressLine2: string | null; city: string; postcode: string; phone: string | null }

export async function getWinsForUser(userId: string): Promise<TicketWinRow[]> {
  await ensure()
  const rows = await prisma.$queryRaw<{ id: string; gameId: string; prizeType: string; prizeAmount: number; prizeName: string | null; prizeImage: string | null; ticketNo: number; createdAt: string }[]>`
    SELECT "id","gameId","prizeType","prizeAmount","prizeName","prizeImage","ticketNo","createdAt" FROM "TicketGamePlay" WHERE "userId" = ${userId} AND "revealed" = 1 AND "prizeType" IS NOT NULL ORDER BY "ticketNo" DESC`
  if (!rows.length) return []
  const claims = await claimsForUser(userId)
  const games = await listGames(); const nameById = new Map(games.map(g => [g.id, g.name]))
  return rows.map(r => ({ playId: r.id, gameId: r.gameId, gameName: nameById.get(r.gameId) || 'Instant Win', type: r.prizeType === 'custom' ? 'custom' : 'credit', amount: Number(r.prizeAmount), name: r.prizeName, image: r.prizeImage, ticketNo: Number(r.ticketNo), createdAt: String(r.createdAt), claim: claims[r.id] }))
}
async function claimsForUser(userId: string): Promise<Record<string, TicketClaimRow>> {
  const rows = await prisma.$queryRaw<TicketClaimRow[]>`SELECT "playId","userId","fullName","addressLine1","addressLine2","city","postcode","phone" FROM "TicketGameClaim" WHERE "userId" = ${userId}`
  const map: Record<string, TicketClaimRow> = {}
  for (const r of rows) map[r.playId] = r
  return map
}
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
export async function listCustomWinsForAdmin(gameId: string): Promise<Array<TicketWinRow & { userName: string; userEmail: string }>> {
  await ensure()
  const rows = await prisma.$queryRaw<{ id: string; userId: string; prizeAmount: number; prizeName: string | null; prizeImage: string | null; ticketNo: number; createdAt: string }[]>`
    SELECT "id","userId","prizeAmount","prizeName","prizeImage","ticketNo","createdAt" FROM "TicketGamePlay" WHERE "gameId" = ${gameId} AND "revealed" = 1 AND "prizeType" = 'custom' ORDER BY "ticketNo" DESC`
  if (!rows.length) return []
  const userIds = [...new Set(rows.map(r => r.userId))]
  const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
  const byUser = new Map(users.map(u => [u.id, u]))
  const claimRows = await prisma.$queryRaw<TicketClaimRow[]>`SELECT "playId","userId","fullName","addressLine1","addressLine2","city","postcode","phone" FROM "TicketGameClaim"`
  const claimByPlay = new Map(claimRows.map(c => [c.playId, c]))
  return rows.map(r => ({ playId: r.id, gameId, gameName: '', type: 'custom' as const, amount: Number(r.prizeAmount), name: r.prizeName, image: r.prizeImage, ticketNo: Number(r.ticketNo), createdAt: String(r.createdAt), claim: claimByPlay.get(r.id), userName: byUser.get(r.userId)?.name || 'Unknown', userEmail: byUser.get(r.userId)?.email || '' }))
}

// ── public tiles ───────────────────────────────────────────────────────────
export interface GameCard { id: string; slug: string; title: string; subtitle: null; prizeValue: number; ticketPrice: number; maxTickets: number; ticketsSold: number; images: string; drawDate: string | null; status: string; featured: boolean; closed: boolean; upcoming: boolean; href: string }
export async function getPublishedGameCards(): Promise<GameCard[]> {
  await ensure()
  const rows = await prisma.$queryRawUnsafe<GameRow[]>(`SELECT ${SELECT_COLS} FROM "InstantGame" WHERE "published" = 1 ORDER BY "createdAt" ASC`)
  const games = rows.map(rowToGame)
  const cards: GameCard[] = []
  for (const g of games) {
    const sold = await countSold(g.id)
    const top = aggregatePrizes(g.winners).reduce((m, p) => Math.max(m, p.amount), 0)
    cards.push({ id: `ig-${g.id}`, slug: g.slug, title: g.name, subtitle: null, prizeValue: top, ticketPrice: g.priceP / 100, maxTickets: g.poolSize, ticketsSold: sold, images: JSON.stringify(g.image ? [g.image] : []), drawDate: g.endsAt, status: 'active', featured: true, closed: false, upcoming: false, href: `/instant-win/${g.slug}` })
  }
  return cards
}
