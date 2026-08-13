// Time-based lifecycle for standard competitions.
//
// A standard competition with a draw date passes through:
//   open    → now < drawDate                      (buyable, detail page live)
//   closed  → drawDate <= now < drawDate + 16h     (shown as "Closed", no buying, no detail)
//   expired → now >= drawDate + 16h                (removed from the public site)
//
// Instant-win competitions have no draw and are never closed by this logic.

export const CLOSED_WINDOW_MS = 16 * 60 * 60 * 1000 // 16 hours

type CompLike = { drawDate: Date | string | null; type?: string | null }

function drawMs(drawDate: Date | string | null): number | null {
  if (!drawDate) return null
  const t = new Date(drawDate).getTime()
  return Number.isNaN(t) ? null : t
}

/** Draw date has passed — no longer buyable, detail page hidden. */
export function isCompClosed(c: CompLike, now: number = Date.now()): boolean {
  if (c.type === 'instant') return false
  const d = drawMs(c.drawDate)
  return d !== null && now >= d
}

/** More than 16h past the draw date — drop from the public site entirely. */
export function isCompExpired(c: CompLike, now: number = Date.now()): boolean {
  if (c.type === 'instant') return false
  const d = drawMs(c.drawDate)
  return d !== null && now >= d + CLOSED_WINDOW_MS
}
