import crypto from 'node:crypto'
import { prisma } from '@/lib/prisma'

// Referral programme (first-order only):
//   • Referred person gets 20% off their first order.
//   • Referrer gets 20% of that first order's value as site credit (once).
// Uses Prisma tagged-template raw queries so placeholders work on BOTH
// SQLite (local) and Postgres (prod). Booleans stored as INTEGER 0/1.

export const REFERRAL_RATE = 0.20

let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Referral" (
      "userId" TEXT PRIMARY KEY,
      "code" TEXT UNIQUE,
      "referredByUserId" TEXT,
      "pendingRewardPence" INTEGER NOT NULL DEFAULT 0,
      "discountUsed" INTEGER NOT NULL DEFAULT 0,
      "referrerRewarded" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    ensured = true
  } catch (e) { console.error('[referrals] ensure failed:', e) }
}

interface RawRow { userId: string; code: string; referredByUserId: string | null; pendingRewardPence: number; discountUsed: number; referrerRewarded: number }
export interface ReferralRow { userId: string; code: string; referredByUserId: string | null; discountUsed: boolean; referrerRewarded: boolean }

const normalize = (r: RawRow): ReferralRow => ({ userId: r.userId, code: r.code, referredByUserId: r.referredByUserId, discountUsed: Number(r.discountUsed) > 0, referrerRewarded: Number(r.referrerRewarded) > 0 })

async function rowByUser(userId: string): Promise<RawRow | undefined> {
  const rows = await prisma.$queryRaw<RawRow[]>`SELECT "userId","code","referredByUserId","pendingRewardPence","discountUsed","referrerRewarded" FROM "Referral" WHERE "userId" = ${userId}`
  return rows[0]
}

async function codeExists(code: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ x: number }[]>`SELECT 1 AS x FROM "Referral" WHERE "code" = ${code}`
  return rows.length > 0
}

/** Get the user's referral row, generating their code on first access. */
export async function getOrCreateReferral(userId: string, name?: string): Promise<ReferralRow> {
  await ensure()
  const existing = await rowByUser(userId)
  if (existing) return normalize(existing)

  const base = (name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'IVV'
  let code = ''
  for (let i = 0; i < 25; i++) {
    code = `${base}${crypto.randomUUID().replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase()}`
    if (!(await codeExists(code))) break
  }
  await prisma.$executeRaw`INSERT INTO "Referral" ("userId","code") VALUES (${userId}, ${code})`
  return { userId, code, referredByUserId: null, discountUsed: false, referrerRewarded: false }
}

export async function getReferralByCode(code: string): Promise<ReferralRow | null> {
  await ensure()
  const rows = await prisma.$queryRaw<RawRow[]>`SELECT "userId","code","referredByUserId","pendingRewardPence","discountUsed","referrerRewarded" FROM "Referral" WHERE UPPER("code") = UPPER(${code})`
  return rows.length ? normalize(rows[0]) : null
}

/** How many people this user has successfully referred (rewarded). */
export async function getReferredCount(userId: string): Promise<number> {
  await ensure()
  try {
    const rows = await prisma.$queryRaw<{ c: number | bigint }[]>`SELECT COUNT(*) AS c FROM "Referral" WHERE "referredByUserId" = ${userId} AND "referrerRewarded" > 0`
    return Number(rows[0]?.c || 0)
  } catch { return 0 }
}

/** Validate a referral code for a buyer at checkout. */
export async function validateReferral(userId: string, code: string): Promise<{ ok: true; referrerUserId: string } | { ok: false; error: string }> {
  await ensure()
  const me = await getOrCreateReferral(userId)
  if (me.discountUsed) return { ok: false, error: 'You have already used a referral discount.' }
  const ref = await getReferralByCode(code.trim())
  if (!ref) return { ok: false, error: 'That referral code is not valid.' }
  if (ref.userId === userId || ref.code.toUpperCase() === me.code.toUpperCase()) return { ok: false, error: "You can't use your own referral code." }
  return { ok: true, referrerUserId: ref.userId }
}

/** Record who referred this user + the reward owed, set at checkout when a valid code is applied. */
export async function setReferredBy(userId: string, referrerUserId: string, pendingRewardPence: number) {
  await ensure()
  await getOrCreateReferral(userId)
  const pence = Math.max(0, Math.round(pendingRewardPence))
  await prisma.$executeRaw`UPDATE "Referral" SET "referredByUserId" = ${referrerUserId}, "pendingRewardPence" = ${pence} WHERE "userId" = ${userId} AND "discountUsed" = 0`
}

/** Called once the referred user's first order is paid. Credits the referrer once. Idempotent. */
export async function rewardReferrer(referredUserId: string) {
  await ensure()
  const row = await rowByUser(referredUserId)
  if (!row || !row.referredByUserId || Number(row.referrerRewarded) > 0) return

  // Atomically claim the reward so duplicate webhooks can't double-credit.
  const claimed = await prisma.$executeRaw`UPDATE "Referral" SET "referrerRewarded" = 1, "discountUsed" = 1 WHERE "userId" = ${referredUserId} AND "referrerRewarded" = 0`
  if (!claimed) return

  const creditPounds = Math.round(Number(row.pendingRewardPence)) / 100
  if (creditPounds > 0) {
    await prisma.user.update({ where: { id: row.referredByUserId }, data: { siteCredit: { increment: creditPounds } } })
    await prisma.notification.create({
      data: { userId: row.referredByUserId, title: `£${creditPounds.toFixed(2)} referral reward 🎉`, body: `Someone you referred just made their first entry — you've earned £${creditPounds.toFixed(2)} in site credit. Thanks for spreading the word!`, icon: 'info' },
    }).catch(() => {})
  }
}
