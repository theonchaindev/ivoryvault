import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewCompetitionEmail, broadcastNewCompetition } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function recipients(): Promise<string[]> {
  const users = await prisma.user.findMany({ select: { email: true } })
  const set = new Set<string>()
  for (const u of users) {
    const e = (u.email || '').toLowerCase().trim()
    if (!e || e.endsWith('@example.com') || e === 'admin@ivoryvault.com') continue
    set.add(e)
  }
  return [...set]
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { mode, email } = await req.json()

    if (mode === 'count') {
      return NextResponse.json({ count: (await recipients()).length })
    }
    if (mode === 'test') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      await sendNewCompetitionEmail(String(email).trim())
      return NextResponse.json({ ok: true, sentTo: email })
    }
    if (mode === 'send') {
      const list = await recipients()
      const result = await broadcastNewCompetition(list)
      return NextResponse.json({ ok: true, recipients: list.length, ...result })
    }
    return NextResponse.json({ error: 'Unknown mode' }, { status: 400 })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('broadcast error:', e)
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
