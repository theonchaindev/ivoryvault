import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// One-time: add the nullable phone column to the User table in production.
export async function POST() {
  try {
    await requireAdmin()
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    const err = e as Error
    if (err.message === 'Unauthorized' || err.message === 'Forbidden') {
      return NextResponse.json({ error: err.message }, { status: err.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('add-phone-column error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
