import { prisma } from '@/lib/prisma'

// Pending Cashflows orders — links an orderNumber to the basket + buyer so the
// webhook can grant entries once the payment is confirmed Paid. Self-creating table.
let ensured = false
async function ensure() {
  if (ensured) return
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "CashflowsOrder" (
      "orderNumber" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "items" TEXT NOT NULL,
      "creditUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "amount" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "paidAt" TIMESTAMPTZ
    )`)
    ensured = true
  } catch (e) { console.error('[cashflowsOrders] ensure failed:', e) }
}

export interface OrderItem { id: string; qty: number }

export async function createOrder(d: { orderNumber: string; userId: string; items: OrderItem[]; creditUsed: number; amount: string }) {
  await ensure()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "CashflowsOrder" ("orderNumber","userId","items","creditUsed","amount") VALUES ($1,$2,$3,$4,$5)`,
    d.orderNumber, d.userId, JSON.stringify(d.items), d.creditUsed, d.amount,
  )
}

export interface CashflowsOrderRow { orderNumber: string; userId: string; items: OrderItem[]; creditUsed: number; amount: string }

// Atomically transition pending → paid. Returns the row only if THIS call claimed
// it (so concurrent/duplicate webhooks can't grant entries twice).
export async function claimOrderPaid(orderNumber: string): Promise<CashflowsOrderRow | null> {
  await ensure()
  try {
    const rows = await prisma.$queryRawUnsafe<{ orderNumber: string; userId: string; items: string; creditUsed: number; amount: string }[]>(
      `UPDATE "CashflowsOrder" SET "status" = 'paid', "paidAt" = now()
       WHERE "orderNumber" = $1 AND "status" = 'pending'
       RETURNING "orderNumber","userId","items","creditUsed","amount"`,
      orderNumber,
    )
    if (!rows.length) return null
    const r = rows[0]
    let items: OrderItem[] = []
    try { items = JSON.parse(r.items) } catch { /* ignore */ }
    return { orderNumber: r.orderNumber, userId: r.userId, items, creditUsed: r.creditUsed, amount: r.amount }
  } catch (e) {
    console.error('[cashflowsOrders] claim failed:', e)
    return null
  }
}
