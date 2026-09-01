import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// The Ticket Game admin is now the multi-game Instant Win manager.
export default function TicketGameRedirect() {
  redirect('/admin/instant-win')
}
