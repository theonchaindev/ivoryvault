// Wheel shows alternating WIN / NO WIN segments (looks 50/50)…
export interface WheelSeg { win: boolean }

export const WHEEL_SEGMENTS: WheelSeg[] = [
  { win: true }, { win: false },
  { win: true }, { win: false },
  { win: true }, { win: false },
  { win: true }, { win: false },
  { win: true }, { win: false },
]

// …but a real win is 1 in 10.
export const WIN_CHANCE = 0.1
// Prize pool when you do win.
export const WIN_AMOUNTS = [0.25, 0.5, 0.75, 1]

/** Server-side outcome. Returns whether it's a win, the amount, and a segment index to land on. */
export function pickOutcome(): { win: boolean; amount: number; index: number } {
  const winIdx = WHEEL_SEGMENTS.map((s, i) => (s.win ? i : -1)).filter(i => i >= 0)
  const loseIdx = WHEEL_SEGMENTS.map((s, i) => (!s.win ? i : -1)).filter(i => i >= 0)

  if (Math.random() < WIN_CHANCE) {
    const amount = WIN_AMOUNTS[Math.floor(Math.random() * WIN_AMOUNTS.length)]
    return { win: true, amount, index: winIdx[Math.floor(Math.random() * winIdx.length)] }
  }
  return { win: false, amount: 0, index: loseIdx[Math.floor(Math.random() * loseIdx.length)] }
}

export function formatPrize(v: number): string {
  return v < 1 ? `${Math.round(v * 100)}p` : `£${v % 1 === 0 ? v : v.toFixed(2)}`
}
