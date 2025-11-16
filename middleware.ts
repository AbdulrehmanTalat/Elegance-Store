import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isSignInPage = req.nextUrl.pathname.startsWith('/auth/signin')

    // If user is authenticated and tries to access sign-in page, redirect them immediately
    if (token && isSignInPage) {
      // Check for callbackUrl in query params first
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
      let targetPath = '/profile'
      
      if (callbackUrl) {
        try {
          // Extract path from callbackUrl (handle both full URLs and paths)
          let extractedPath = callbackUrl
          if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
            const urlObj = new URL(callbackUrl)
            extractedPath = urlObj.pathname
          }
          // Only use if it's a valid path and not back to sign-in
          if (extractedPath.startsWith('/') && 
              !extractedPath.startsWith('/auth/') && 
              extractedPath !== '/auth/signin') {
            targetPath = extractedPath
          }
        } catch {
          // If URL parsing fails, use default
        }
      }
      
      // Admin always goes to /admin, regular users go to targetPath
      if (isAdmin) {
        targetPath = '/admin'
      }
      
      // Use absolute URL to ensure proper redirect with 307 (Temporary Redirect)
      // 307 preserves the method and prevents caching issues
      const redirectUrl = new URL(targetPath, req.url)
      return NextResponse.redirect(redirectUrl, 307)
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

        // Protect admin routes - return false to trigger NextAuth redirect
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' || false
        }

        // Protect checkout and profile routes - return false to trigger NextAuth redirect
        // BUT: if token exists, allow access (even if role is missing temporarily)
        if (
          req.nextUrl.pathname.startsWith('/checkout') ||
          req.nextUrl.pathname.startsWith('/profile') ||
          req.nextUrl.pathname.startsWith('/orders')
        ) {
          // If we have a token, allow access (session might be loading on client)
          // Only block if there's absolutely no token
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


