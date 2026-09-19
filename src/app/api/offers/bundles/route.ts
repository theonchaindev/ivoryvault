import { NextRequest, NextResponse } from 'next/server'
import { getBundleFor } from '@/lib/offers'

export const dynamic = 'force-dynamic'

// Public: resolve the active bundle offer (buy X get Y free) for a set of
// competition ids, so the basket can show the free entries a customer will get.
export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json() as { ids?: string[] }
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ bundles: {} })
    const out: Record<string, { buyQty: number; freeQty: number }> = {}
    await Promise.all(ids.slice(0, 50).map(async id => {
      if (typeof id !== 'string') return
      const b = await getBundleFor('raffle', id).catch(() => null)
      if (b) out[id] = b
    }))
    return NextResponse.json({ bundles: out })
  } catch {
    return NextResponse.json({ bundles: {} })
  }
}
