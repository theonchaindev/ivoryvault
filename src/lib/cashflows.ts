import crypto from 'node:crypto'

// Cashflows Gateway API client (Hosted Checkout Pages).
// Auth: ConfigurationId header + Hash header = SHA512(apiKey + rawBody), hex.
// The EXACT raw body string that is hashed must be the one sent.

const ENV = process.env.CASHFLOWS_ENVIRONMENT || 'integration'
const CONFIG_ID = process.env.CASHFLOWS_CONFIGURATION_ID || ''
const API_KEY = process.env.CASHFLOWS_API_KEY || ''

export const CASHFLOWS_BASE =
  ENV === 'production' ? 'https://gateway.cashflows.com' : 'https://gateway-inta.cashflows.com'

export const cashflowsConfigured = () => Boolean(CONFIG_ID && API_KEY)

function signedHeaders(rawBody: string) {
  const hash = crypto.createHash('sha512').update(API_KEY + rawBody).digest('hex')
  return { ConfigurationId: CONFIG_ID, Hash: hash, 'Content-Type': 'application/json' }
}

export interface CreatePaymentJobInput {
  amount: string            // major units, e.g. "10.00"
  currency?: string         // default GBP
  orderNumber: string
  email?: string
  firstName?: string
  lastName?: string
  returnUrlSuccess: string
  returnUrlFailed: string
  returnUrlCancelled: string
  webhookUrl: string
}

export interface CreatePaymentJobResult {
  paymentJobReference: string
  actionUrl: string         // hosted payment page to redirect the shopper to
  raw: unknown
}

export async function createPaymentJob(input: CreatePaymentJobInput): Promise<CreatePaymentJobResult> {
  const body = {
    amountToCollect: input.amount,
    currency: input.currency || 'GBP',
    locale: 'en_GB',
    order: {
      orderNumber: input.orderNumber,
      billingIdentity: input.email ? { emailAddress: input.email } : undefined,
      billingAddress: {
        firstName: input.firstName || undefined,
        lastName: input.lastName || undefined,
        countryIso3166Alpha2: 'GB',
      },
    },
    parameters: {
      ReturnUrlSuccess: input.returnUrlSuccess,
      ReturnUrlFailed: input.returnUrlFailed,
      ReturnUrlCancelled: input.returnUrlCancelled,
      WebhookUrl: input.webhookUrl,
    },
    paymentMethodsToUse: ['card'],
  }

  const raw = JSON.stringify(body)
  const res = await fetch(`${CASHFLOWS_BASE}/api/gateway/payment-jobs`, {
    method: 'POST',
    headers: signedHeaders(raw),
    body: raw,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Cashflows create failed (${res.status}): ${JSON.stringify(json)}`)
  }
  const data = json.data ?? json
  const actionUrl: string | undefined = data?.links?.action?.url
  const paymentJobReference: string | undefined = data?.reference
  if (!actionUrl || !paymentJobReference) {
    throw new Error(`Cashflows create: missing action url / reference: ${JSON.stringify(json)}`)
  }
  return { paymentJobReference, actionUrl, raw: json }
}

export interface PaymentJobStatus {
  paymentStatus: string     // Pending | Paid | Failed | Cancelled | ...
  amountToCollect?: string
  currency?: string
  orderNumber?: string
  raw: unknown
}

// Authoritative status lookup — always call this on webhook/return, never trust the redirect alone.
export async function getPaymentJob(paymentJobReference: string): Promise<PaymentJobStatus> {
  const res = await fetch(`${CASHFLOWS_BASE}/api/gateway/payment-jobs/${paymentJobReference}`, {
    method: 'GET',
    headers: signedHeaders(''), // GET has no body → hash of apiKey + ''
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`Cashflows get failed (${res.status}): ${JSON.stringify(json)}`)
  const data = json.data ?? json
  return {
    paymentStatus: data?.paymentStatus ?? 'Unknown',
    amountToCollect: data?.amountToCollect,
    currency: data?.currency,
    orderNumber: data?.order?.orderNumber,
    raw: json,
  }
}
