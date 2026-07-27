import { cookies } from 'next/headers'
import { verifyEntrantsToken } from '@/lib/auth'
import EntrantsGate from './EntrantsGate'
import EntrantsViewer from './EntrantsViewer'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Entrants — Ivory Vault',
  robots: { index: false, follow: false },
}

export default async function EntrantsPage() {
  const token = (await cookies()).get('iv-entrants')?.value
  const authed = await verifyEntrantsToken(token)
  return authed ? <EntrantsViewer /> : <EntrantsGate />
}
