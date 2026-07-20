import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

interface BasketLine { competitionId: string; quantity: number }

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json() as { items: BasketLine[] }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your basket is empty' }, { status: 400 })
    }

    // Validate every line against the DB (never trust client prices)
    const lineItems = []
    const metaItems: { id: string; qty: number }[] = []

    for (const line of items) {
      if (!line.competitionId || !line.quantity || line.quantity < 1) {
        return NextResponse.json({ error: 'Invalid basket item' }, { status: 400 })
      }
      const comp = await prisma.competition.findUnique({ where: { id: line.competitionId } })
      if (!comp) return NextResponse.json({ error: 'A competition in your basket no longer exists' }, { status: 404 })
      if (comp.status !== 'active') return NextResponse.json({ error: `${comp.title} is no longer active` }, { status: 400 })

      const remaining = comp.maxTickets - comp.ticketsSold
      if (line.quantity > remaining) {
        return NextResponse.json({ error: `Only ${remaining} tickets left for ${comp.title}` }, { status: 400 })
      }

      let images: string[] = []
      try { images = JSON.parse(comp.images) } catch { /* ignore */ }

      lineItems.push({
        quantity: line.quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(comp.ticketPrice * 100),
          product_data: {
            name: comp.title,
            ...(images[0] ? { images: [images[0]] } : {}),
          },
        },
      })
      metaItems.push({ id: comp.id, qty: line.quantity })
    }

    const origin = request.headers.get('origin')
      || process.env.NEXT_PUBLIC_BASE_URL
      || 'https://ivoryvault.vercel.app'

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/basket`,
      metadata: {
        userId: session.userId,
        items: JSON.stringify(metaItems),
      },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
