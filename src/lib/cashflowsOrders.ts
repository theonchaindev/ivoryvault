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
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "paidAt" TIMESTAMP
    )`)
    // Store the Cashflows job reference so the success return can reconcile the
    // order (grant immediately) instead of waiting on the async webhook.
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "CashflowsOrder" ADD COLUMN "jobRef" TEXT`) } catch { /* exists */ }
    ensured = true
  } catch (e) { console.error('[cashflowsOrders] ensure failed:', e) }
}

/** Save the Cashflows job reference against an order (called right after createPaymentJob). */
export async function setOrderJobRef(orderNumber: string, jobRef: string) {
  await ensure()
  try {
    await prisma.$executeRawUnsafe(`UPDATE "CashflowsOrder" SET "jobRef" = $1 WHERE "orderNumber" = $2`, jobRef, orderNumber)
  } catch (e) { console.error('[cashflowsOrders] setOrderJobRef failed:', e) }
}

export interface StoredOrder { orderNumber: string; userId: string; items: OrderItem[]; creditUsed: number; amount: string; status: string; jobRef: string | null }

/** Fetch a single order (for reconciliation on the payment return). */
export async function getOrder(orderNumber: string): Promise<StoredOrder | null> {
  await ensure()
  try {
    const rows = await prisma.$queryRawUnsafe<{ orderNumber: string; userId: string; items: string; creditUsed: number; amount: string; status: string; jobRef: string | null }[]>(
      `SELECT "orderNumber","userId","items","creditUsed","amount","status","jobRef" FROM "CashflowsOrder" WHERE "orderNumber" = $1`,
      orderNumber,
    )
    if (!rows.length) return null
    const r = rows[0]
    let items: OrderItem[] = []
    try { items = JSON.parse(r.items) } catch { /* ignore */ }
    return { orderNumber: r.orderNumber, userId: r.userId, items, creditUsed: r.creditUsed, amount: r.amount, status: r.status, jobRef: r.jobRef }
  } catch { return null }
}

export interface OrderItem { id: string; qty: number }

export async function createOrder(d: { orderNumber: string; userId: string; items: OrderItem[]; creditUsed: number; amount: string }) {
  await ensure()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "CashflowsOrder" ("orderNumber","userId","items","creditUsed","amount") VALUES ($1,$2,$3,$4,$5)`,
    d.orderNumber, d.userId, JSON.stringify(d.items), d.creditUsed, d.amount,
  )
}

export interface OrderSummary { orderNumber: string; userId: string; items: OrderItem[]; amount: string; status: string; createdAt: string; paidAt: string | null }

/** Recent orders, newest first — for admin diagnostics/recovery. */
export async function listRecentOrders(limit = 50): Promise<OrderSummary[]> {
  await ensure()
  try {
    // Inline the (sanitised) integer limit — a positional LIMIT param trips a
    // Prisma error on SQLite, and there are no other params to worry about.
    const n = Math.min(500, Math.max(1, Math.round(limit)))
    const rows = await prisma.$queryRawUnsafe<{ orderNumber: string; userId: string; items: string; amount: string; status: string; createdAt: Date; paidAt: Date | null }[]>(
      `SELECT "orderNumber","userId","items","amount","status","createdAt","paidAt" FROM "CashflowsOrder" ORDER BY "createdAt" DESC LIMIT ${n}`,
    )
    return rows.map(r => {
      let items: OrderItem[] = []
      try { items = JSON.parse(r.items) } catch { /* ignore */ }
      return { orderNumber: r.orderNumber, userId: r.userId, items, amount: r.amount, status: r.status, createdAt: new Date(r.createdAt).toISOString(), paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : null }
    })
  } catch { return [] }
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
