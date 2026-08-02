import { prisma } from '@/lib/prisma'

// Simple key/value site settings, stored in a self-created table so no
// schema migration is needed. Used for admin-editable config (e.g. Meta Pixel).
let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "SiteSetting" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now())`
    )
    ensured = true
  } catch { /* ignore */ }
}

export async function getSetting(key: string): Promise<string | null> {
  await ensure()
  try {
    const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
      `SELECT "value" FROM "SiteSetting" WHERE "key" = $1`, key
    )
    return rows?.[0]?.value ?? null
  } catch { return null }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await ensure()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "SiteSetting" ("key","value") VALUES ($1,$2)
     ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()`,
    key, value
  )
}
