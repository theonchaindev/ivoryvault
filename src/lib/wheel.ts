// Wheel segments in visual order (clockwise). Values in GBP.
export const WHEEL_SEGMENTS: number[] = [0.25, 0.5, 1, 0.25, 2.5, 0.5, 0.25, 5, 0.5, 1]

// Probability weights per prize amount — heavily favours 25p / 50p.
const WEIGHTS: Record<string, number> = {
  '0.25': 40,
  '0.5': 33,
  '1': 15,
  '2.5': 8,
  '5': 4,
}

/** Server-side weighted pick. Returns the winning amount and a matching segment index. */
export function pickPrize(): { amount: number; index: number } {
  const total = Object.values(WEIGHTS).reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  let amount = 0.25
  for (const [amt, w] of Object.entries(WEIGHTS)) {
    if (r < w) { amount = parseFloat(amt); break }
    r -= w
  }
  // pick a random segment index that matches the chosen amount
  const matches = WHEEL_SEGMENTS.map((v, i) => (v === amount ? i : -1)).filter(i => i >= 0)
  const index = matches[Math.floor(Math.random() * matches.length)] ?? 0
  return { amount, index }
}

export function formatPrize(v: number): string {
  return v < 1 ? `${Math.round(v * 100)}p` : `£${v % 1 === 0 ? v : v.toFixed(2)}`
}
