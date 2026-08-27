import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClaim } from '@/lib/prizeClaims'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { winnerId, fullName, addressLine1, addressLine2, city, postcode, phone } = await req.json()
    if (!winnerId || !fullName?.trim() || !addressLine1?.trim() || !city?.trim() || !postcode?.trim()) {
      return NextResponse.json({ error: 'Please fill in your name and full delivery address.' }, { status: 400 })
    }

    // The winner record must belong to this user.
    const winner = await prisma.winner.findUnique({ where: { id: winnerId }, include: { competition: { select: { title: true } } } })
    if (!winner || winner.userId !== session.userId) {
      return NextResponse.json({ error: 'Prize not found' }, { status: 404 })
    }

    await createClaim({
      winnerId, userId: session.userId,
      fullName: fullName.trim(), addressLine1: addressLine1.trim(), addressLine2: addressLine2?.trim() || null,
      city: city.trim(), postcode: postcode.trim().toUpperCase(), phone: phone?.trim() || null,
    })

    await prisma.notification.create({
      data: { userId: session.userId, title: 'Prize claim received 🎁', body: `Thanks — we've got your delivery details for ${winner.competition.title}. Our team will be in touch to arrange your prize.`, icon: 'info' },
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('claim error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
