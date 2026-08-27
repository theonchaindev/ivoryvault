import { prisma } from '@/lib/prisma'

// Manually-curated winners for the public Winners page. Stored in a
// self-creating table (no schema migration needed).
let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "ManualWinner" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "competitionTitle" TEXT NOT NULL,
      "drawDate" TIMESTAMPTZ,
      "image" TEXT NOT NULL,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
    ensured = true
  } catch (e) { console.error('[winners] ensure table failed:', e) }
}

export interface ManualWinner {
  id: string
  name: string
  competitionTitle: string
  drawDate: Date | null
  image: string
  sortOrder: number
  createdAt: Date
}

export async function listWinners(): Promise<ManualWinner[]> {
  await ensure()
  try {
    return await prisma.$queryRawUnsafe<ManualWinner[]>(`SELECT * FROM "ManualWinner" ORDER BY "sortOrder" ASC, "createdAt" DESC`)
  } catch { return [] }
}

export async function createWinner(d: { name: string; competitionTitle: string; drawDate: Date | null; image: string; sortOrder: number }) {
  await ensure()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ManualWinner" ("id","name","competitionTitle","drawDate","image","sortOrder") VALUES ($1,$2,$3,$4,$5,$6)`,
    crypto.randomUUID(), d.name, d.competitionTitle, d.drawDate, d.image, d.sortOrder,
  )
}

export async function updateWinner(id: string, d: { name: string; competitionTitle: string; drawDate: Date | null; image: string }) {
  await ensure()
  await prisma.$executeRawUnsafe(
    `UPDATE "ManualWinner" SET "name" = $2, "competitionTitle" = $3, "drawDate" = $4, "image" = $5 WHERE "id" = $1`,
    id, d.name, d.competitionTitle, d.drawDate, d.image,
  )
}

export async function deleteWinner(id: string) {
  await ensure()
  await prisma.$executeRawUnsafe(`DELETE FROM "ManualWinner" WHERE "id" = $1`, id)
}
