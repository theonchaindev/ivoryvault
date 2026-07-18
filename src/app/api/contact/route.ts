import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendContactReceipt } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }

    const contact = await prisma.contact.create({
      data: { name, email, subject: subject || null, message },
    })

    // Notify support after the response is sent.
    after(() => sendContactReceipt({ name, email, subject, message }))

    return NextResponse.json({ success: true, id: contact.id }, { status: 201 })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
