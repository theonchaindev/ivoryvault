import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResetToken, pwVersion } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ivoryvaultcompetitions.co.uk'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Only send if the account exists, but always respond the same way so we
    // never reveal whether an email is registered.
    if (user) {
      const token = await createResetToken(user.id, pwVersion(user.password))
      const resetUrl = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`
      await sendPasswordResetEmail(user.email, user.name, resetUrl)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot-password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
