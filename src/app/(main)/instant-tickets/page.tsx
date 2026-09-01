import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// The original single ticket game now lives in the multi-game system under its
// migrated slug. Keep the old URL working.
export default function InstantTicketsRedirect() {
  redirect('/instant-win/instant-tickets')
}
