import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAccountRoute = pathname.startsWith('/account')
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isAccountRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get('iv-session')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
