import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    // Non-admin trying to access admin route
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Always allow API auth routes
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // Always allow sign-in page - let NextAuth redirect handle it
        if (pathname.startsWith('/auth/signin')) {
          return true
        }

        // Protect admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' ? true : false
        }

        // Protect other routes - check if token exists (any truthy value)
        if (
          pathname.startsWith('/checkout') ||
          pathname.startsWith('/profile') ||
          pathname.startsWith('/orders')
        ) {
          // If token exists (even empty object), allow access
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
    '/auth/signin',
    '/auth/signin/:path*',
  ],
}
