import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: string
  [key: string]: unknown
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret)
  return token
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('iv-session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession()
  if (session.role !== 'admin') throw new Error('Forbidden')
  return session
}

// ── Password reset (stateless, signed) ────────────────────────────────
// A short-lived JWT carrying the user id + a slice of the current password
// hash. Because the slice changes when the password is reset, an old link
// stops working after a successful reset. No DB table required.

export function pwVersion(passwordHash: string): string {
  return passwordHash.slice(-12)
}

export async function createResetToken(userId: string, pv: string): Promise<string> {
  return new SignJWT({ userId, pv, purpose: 'pwreset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)
}

export async function verifyResetToken(token: string): Promise<{ userId: string; pv: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.purpose !== 'pwreset' || typeof payload.userId !== 'string' || typeof payload.pv !== 'string') return null
    return { userId: payload.userId, pv: payload.pv }
  } catch {
    return null
  }
}
