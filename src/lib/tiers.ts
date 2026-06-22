export interface Tier {
  name: string
  min: number
  max: number
  color: string
  perks: string[]
}

export const TIERS: Tier[] = [
  { name: 'Bronze', min: 0, max: 49, color: '#cd7f32', perks: ['Early access to new competitions', 'Member newsletter'] },
  { name: 'Silver', min: 50, max: 199, color: '#a8a9ad', perks: ['All Bronze perks', '5% bonus entries on purchases', 'Priority customer support'] },
  { name: 'Gold', min: 200, max: 499, color: '#c9a84c', perks: ['All Silver perks', '10% bonus entries', 'Exclusive Gold-only competitions', 'Free postal entries'] },
  { name: 'Platinum', min: 500, max: Infinity, color: '#c9a84c', perks: ['All Gold perks', '15% bonus entries', 'Dedicated account manager', 'VIP draw events', 'First refusal on limited prizes'] },
]

export function getTierIndex(totalTickets: number): number {
  const idx = TIERS.findIndex(t => totalTickets >= t.min && totalTickets <= t.max)
  return idx < 0 ? 0 : idx
}

export function getTier(totalTickets: number): Tier {
  return TIERS[getTierIndex(totalTickets)]
}

export function getNextTier(totalTickets: number): Tier | null {
  const idx = getTierIndex(totalTickets)
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}
