// Work out how much site credit to apply to an order.
// Amounts in pounds. Stripe can't charge between 1p and 29p, so if applying
// credit would leave a sub-30p balance to pay, we trim the credit used so the
// card charge is either £0 (fully covered) or at least £0.30.
export function applyCredit(total: number, balance: number): { creditUsed: number; toPay: number } {
  const t = Math.round(total * 100)
  const b = Math.round(Math.max(0, balance) * 100)

  let credit = Math.min(b, t)
  let remaining = t - credit

  if (remaining > 0 && remaining < 30) {
    if (t >= 30) { credit = t - 30; remaining = 30 } // pay the 30p minimum
    else { credit = 0; remaining = t }               // sub-30p order: can't part-pay
  }

  return { creditUsed: credit / 100, toPay: remaining / 100 }
}
