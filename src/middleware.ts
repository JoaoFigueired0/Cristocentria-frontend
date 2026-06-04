import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth
    const { pathname } = req.nextUrl

    const isAdminRoute =
      pathname.startsWith('/admin') || pathname.startsWith('/api/admin')

    if (isAdminRoute && token?.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acesso negado', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl
        const protectedPaths = ['/conta', '/admin', '/api/admin']
        const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
        return isProtected ? !!token : true
      },
    },
  }
)

export const config = {
  matcher: ['/conta/:path*', '/admin/:path*', '/api/admin/:path*'],
}
