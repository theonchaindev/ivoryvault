export interface PrizeTier { amount: number; total: number }
export interface PrizeStatus { amount: number; total: number; won: number; left: number }

export function parsePrizes(raw: string | null | undefined): PrizeTier[] {
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr.filter((p) => typeof p.amount === 'number' && typeof p.total === 'number') : []
  } catch { return [] }
}

/** Build per-tier status from the config + how many of each amount have already been won. */
export function prizeStatus(prizes: PrizeTier[], wonByAmount: Record<string, number>): PrizeStatus[] {
  return prizes
    .map(p => {
      const won = wonByAmount[String(p.amount)] || 0
      return { amount: p.amount, total: p.total, won, left: Math.max(0, p.total - won) }
    })
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Decide the outcome of one spin.
 * Expected wins are spread across the remaining spins so the pool empties naturally,
 * and a tier can never be over-awarded (only tiers with left > 0 can win).
 */
export function resolveOutcome(status: PrizeStatus[], unrevealedSpins: number): { win: boolean; amount: number } {
  const avail = status.filter(s => s.left > 0)
  const totalLeft = avail.reduce((s, t) => s + t.left, 0)
  if (totalLeft === 0 || unrevealedSpins <= 0) return { win: false, amount: 0 }

  const winChance = Math.min(1, totalLeft / unrevealedSpins)
  if (Math.random() >= winChance) return { win: false, amount: 0 }

  // Weighted pick among available tiers by remaining count
  let r = Math.random() * totalLeft
  for (const t of avail) {
    if (r < t.left) return { win: true, amount: t.amount }
    r -= t.left
  }
  return { win: true, amount: avail[avail.length - 1].amount }
}

export function formatPrize(v: number): string {
  return v < 1 ? `${Math.round(v * 100)}p` : `£${v % 1 === 0 ? v.toLocaleString() : v.toFixed(2)}`
}
