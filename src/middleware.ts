import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  const protectedPaths = ['/conta', '/admin', '/api/admin']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const isAdminRoute =
    pathname.startsWith('/admin') || pathname.startsWith('/api/admin')

  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Acesso negado', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/conta/:path*', '/admin/:path*', '/api/admin/:path*'],
}
