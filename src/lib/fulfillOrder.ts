import { prisma } from '@/lib/prisma'
import { getPaymentJob } from '@/lib/cashflows'
import { claimOrderPaid, getOrder, type CashflowsOrderRow } from '@/lib/cashflowsOrders'
import { recordPurchase, sendOrderConfirmation } from '@/lib/orders'
import { sendGuestCreateAccount } from '@/lib/email'
import { rewardReferrer } from '@/lib/referrals'

/**
 * Everything that must happen once an order is confirmed Paid: grant the
 * purchased items, apply any site credit, reward a referrer, and send emails.
 * Called after claimOrderPaid (which is atomic), so this runs exactly once per
 * order no matter whether the webhook OR the payment-return reconciles it first.
 */
export async function fulfillPaidOrder(order: CashflowsOrderRow, paymentRef: string) {
  for (const item of order.items) {
    await recordPurchase(order.userId, item.id, item.qty, paymentRef)
  }
  if (order.creditUsed > 0) {
    const u = await prisma.user.findUnique({ where: { id: order.userId }, select: { siteCredit: true } })
    const deduct = Math.min(order.creditUsed, u?.siteCredit ?? 0)
    if (deduct > 0) {
      await prisma.user.update({ where: { id: order.userId }, data: { siteCredit: { decrement: deduct } } })
      await prisma.notification.create({
        data: { userId: order.userId, title: `£${deduct.toFixed(2)} site credit used`, body: 'Your site credit was applied to your order.', icon: 'info' },
      }).catch(() => {})
    }
  }
  await rewardReferrer(order.userId)

  const buyer = await prisma.user.findUnique({ where: { id: order.userId }, select: { role: true, email: true, name: true } })
  if (buyer?.role === 'guest' && buyer.email) {
    void sendGuestCreateAccount(buyer.email, buyer.name).catch(() => {})
  }
  void sendOrderConfirmation(order.userId, order.items, Math.round(parseFloat(order.amount) * 100)).catch(() => {})
}

export interface FinalizeResult { status: 'granted' | 'already-paid' | 'not-paid' | 'unknown'; paymentStatus?: string }

/**
 * Reconcile an order on the payment return: verify the authoritative Cashflows
 * status and, if Paid, grant it now (idempotent with the webhook). Lets the
 * success page show the purchased items immediately instead of waiting.
 */
export async function finalizeByOrderNumber(orderNumber: string): Promise<FinalizeResult> {
  const order = await getOrder(orderNumber)
  if (!order) return { status: 'unknown' }
  if (order.status === 'paid') return { status: 'already-paid' }
  if (!order.jobRef) return { status: 'unknown' }

  let paymentStatus = 'Unknown'
  try { paymentStatus = (await getPaymentJob(order.jobRef)).paymentStatus } catch { return { status: 'unknown' } }
  if (paymentStatus !== 'Paid') return { status: 'not-paid', paymentStatus }

  const claimed = await claimOrderPaid(orderNumber) // atomic; null if webhook already granted
  if (claimed) await fulfillPaidOrder(claimed, order.jobRef)
  return { status: claimed ? 'granted' : 'already-paid', paymentStatus }
}
