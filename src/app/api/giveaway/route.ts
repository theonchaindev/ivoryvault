import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Instagram giveaway post (with a UTM tag for referral tracking).
const TARGET = 'https://www.instagram.com/p/DbN6aAuCvii/?igsh=MTQ0aDJwYzBkMWF5Yg==&utm_source=ivoryvault&utm_medium=banner&utm_campaign=free_giveaway'

let tableEnsured = false

/** Records a click, then redirects to the giveaway post. Used as the banner CTA. */
export async function GET() {
  try {
    if (!tableEnsured) {
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "GiveawayClick" ("id" SERIAL PRIMARY KEY, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now())`)
      tableEnsured = true
    }
    await prisma.$executeRawUnsafe(`INSERT INTO "GiveawayClick" DEFAULT VALUES`)
  } catch (e) {
    console.error('giveaway click tracking failed:', e)
  }
  return NextResponse.redirect(TARGET, 302)
}
