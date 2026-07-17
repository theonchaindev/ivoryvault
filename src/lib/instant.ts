export type PrizeKind = 'credit' | 'cash'
export interface PrizeTier { amount: number; total: number; kind: PrizeKind }
export interface PrizeStatus { amount: number; total: number; won: number; left: number; kind: PrizeKind }

export const prizeKey = (amount: number, kind: PrizeKind) => `${amount}:${kind}`

export function parsePrizes(raw: string | null | undefined): PrizeTier[] {
  try {
    const arr = JSON.parse(raw || '[]')
    if (!Array.isArray(arr)) return []
    return arr
      .filter((p) => typeof p.amount === 'number' && typeof p.total === 'number')
      .map((p) => ({ amount: p.amount, total: p.total, kind: p.kind === 'cash' ? 'cash' : 'credit' as PrizeKind }))
  } catch { return [] }
}

/** Build per-tier status from the config + how many of each (amount+kind) have already been won. */
export function prizeStatus(prizes: PrizeTier[], wonByKey: Record<string, number>): PrizeStatus[] {
  return prizes
    .map(p => {
      const won = wonByKey[prizeKey(p.amount, p.kind)] || 0
      return { amount: p.amount, total: p.total, won, left: Math.max(0, p.total - won), kind: p.kind }
    })
    .sort((a, b) => (a.amount - b.amount) || (a.kind === b.kind ? 0 : a.kind === 'credit' ? -1 : 1))
    .reverse()
}

/**
 * Decide the outcome of one spin.
 * Wins are dripped across every remaining entry (maxTickets) so the pool empties over the
 * whole competition, and a tier can never be over-awarded (only tiers with left > 0 can win).
 * Site-credit prizes are always given out before any cash prizes.
 */
export function resolveOutcome(status: PrizeStatus[], remainingEntries: number): { win: boolean; amount: number; kind: PrizeKind } {
  const avail = status.filter(s => s.left > 0)
  const totalLeft = avail.reduce((s, t) => s + t.left, 0)
  if (totalLeft === 0 || remainingEntries <= 0) return { win: false, amount: 0, kind: 'credit' }

  const winChance = Math.min(1, totalLeft / Math.max(1, remainingEntries))
  if (Math.random() >= winChance) return { win: false, amount: 0, kind: 'credit' }

  // Exhaust all site-credit prizes before releasing any cash prizes.
  const creditAvail = avail.filter(s => s.kind === 'credit')
  const pool = creditAvail.length ? creditAvail : avail
  const poolLeft = pool.reduce((s, t) => s + t.left, 0)

  let r = Math.random() * poolLeft
  for (const t of pool) {
    if (r < t.left) return { win: true, amount: t.amount, kind: t.kind }
    r -= t.left
  }
  const last = pool[pool.length - 1]
  return { win: true, amount: last.amount, kind: last.kind }
}

export function formatPrize(v: number): string {
  return v < 1 ? `${Math.round(v * 100)}p` : `£${v % 1 === 0 ? v.toLocaleString() : v.toFixed(2)}`
}
