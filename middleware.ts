import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }

        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }

        // Protect checkout and profile routes
        if (
          req.nextUrl.pathname.startsWith('/checkout') ||
          req.nextUrl.pathname.startsWith('/profile') ||
          req.nextUrl.pathname.startsWith('/orders')
        ) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/profile/:path*',
    '/orders/:path*',
  ],
}

