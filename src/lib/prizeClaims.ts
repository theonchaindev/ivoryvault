import { prisma } from '@/lib/prisma'

// Delivery/claim details a winner submits to claim their prize. Self-creating table.
let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "PrizeClaim" (
      "winnerId" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "fullName" TEXT NOT NULL,
      "addressLine1" TEXT NOT NULL,
      "addressLine2" TEXT,
      "city" TEXT NOT NULL,
      "postcode" TEXT NOT NULL,
      "phone" TEXT,
      "claimedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    ensured = true
  } catch (e) { console.error('[prizeClaims] ensure failed:', e) }
}

export interface PrizeClaim {
  winnerId: string; userId: string; fullName: string
  addressLine1: string; addressLine2: string | null; city: string; postcode: string
  phone: string | null; claimedAt: Date
}

export async function getClaimsForUser(userId: string): Promise<Record<string, PrizeClaim>> {
  await ensure()
  try {
    const rows = await prisma.$queryRawUnsafe<PrizeClaim[]>(`SELECT * FROM "PrizeClaim" WHERE "userId" = $1`, userId)
    const map: Record<string, PrizeClaim> = {}
    rows.forEach(r => { map[r.winnerId] = r })
    return map
  } catch { return {} }
}

export async function listAllClaims(): Promise<Record<string, PrizeClaim>> {
  await ensure()
  try {
    const rows = await prisma.$queryRawUnsafe<PrizeClaim[]>(`SELECT * FROM "PrizeClaim"`)
    const map: Record<string, PrizeClaim> = {}
    rows.forEach(r => { map[r.winnerId] = r })
    return map
  } catch { return {} }
}

export async function createClaim(d: {
  winnerId: string; userId: string; fullName: string
  addressLine1: string; addressLine2: string | null; city: string; postcode: string; phone: string | null
}) {
  await ensure()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "PrizeClaim" ("winnerId","userId","fullName","addressLine1","addressLine2","city","postcode","phone")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT ("winnerId") DO UPDATE SET
       "fullName"=EXCLUDED."fullName", "addressLine1"=EXCLUDED."addressLine1", "addressLine2"=EXCLUDED."addressLine2",
       "city"=EXCLUDED."city", "postcode"=EXCLUDED."postcode", "phone"=EXCLUDED."phone", "claimedAt"=now()`,
    d.winnerId, d.userId, d.fullName, d.addressLine1, d.addressLine2, d.city, d.postcode, d.phone,
  )
}
