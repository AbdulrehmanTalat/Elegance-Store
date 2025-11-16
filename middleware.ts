import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isSignInPage = req.nextUrl.pathname.startsWith('/auth/signin')

    // If user is authenticated and tries to access sign-in page, redirect them
    if (token && isSignInPage) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // Check for callbackUrl in query params
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
      if (callbackUrl) {
        try {
          // Extract path from callbackUrl (handle both full URLs and paths)
          let targetPath = callbackUrl
          if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
            const urlObj = new URL(callbackUrl)
            targetPath = urlObj.pathname
          }
          // Only redirect if it's a valid path and not back to sign-in
          if (targetPath.startsWith('/') && !targetPath.startsWith('/auth/')) {
            return NextResponse.redirect(new URL(targetPath, req.url))
          }
        } catch {
          // If URL parsing fails, fall through to default redirect
        }
      }
      return NextResponse.redirect(new URL('/profile', req.url))
    }

    // Non-admin trying to access admin route
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

        // Allow access to sign-in page (we handle redirect in middleware function)
        if (req.nextUrl.pathname.startsWith('/auth/signin')) {
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

