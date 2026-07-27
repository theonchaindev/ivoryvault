import { NextRequest, NextResponse } from 'next/server'
import { createEntrantsToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const expected = process.env.ENTRANTS_PASSWORD
    if (!expected) return NextResponse.json({ error: 'Viewer access not configured' }, { status: 503 })
    if (typeof password !== 'string' || password !== expected) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }
    const token = await createEntrantsToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set('iv-entrants', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
