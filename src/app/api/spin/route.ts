import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pickPrize } from '@/lib/wheel'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.hasSpun) {
      return NextResponse.json({ error: 'already', siteCredit: user.siteCredit }, { status: 409 })
    }

    const { amount, index } = pickPrize()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { hasSpun: true, siteCredit: { increment: amount } },
    })

    return NextResponse.json({ amount, index, siteCredit: updated.siteCredit })
  } catch (err) {
    console.error('Spin error:', err)
    return NextResponse.json({ error: 'Spin failed' }, { status: 500 })
  }
}
