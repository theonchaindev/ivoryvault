// Central switch for the payments outage.
//
// While PAYMENTS_PAUSED is true:
//   • the site-wide red alert bar shows
//   • checkout is disabled (client button + server route both refuse)
//   • all countdowns are frozen at PAUSED_AT and competitions cannot close
//
// To resume: set PAYMENTS_PAUSED = false. IMPORTANT — before doing so, push every
// live competition's drawDate forward by the outage's length (now − PAUSED_AT),
// otherwise the frozen countdowns will jump down and some comps may close instantly.
// Also reset the CSS default `--banner-h` to 0 in globals.css so no gap remains.

export const PAYMENTS_PAUSED = false

// The instant the clocks were frozen (used as "now" everywhere while paused).
export const PAUSED_AT = '2026-08-16T09:20:00Z'

/** "Now" for time-based logic — frozen while paused so nothing counts down or closes. */
export function effectiveNow(): number {
  if (PAYMENTS_PAUSED) {
    const t = new Date(PAUSED_AT).getTime()
    if (!Number.isNaN(t)) return t
  }
  return Date.now()
}
