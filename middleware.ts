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
        const pathname = req.nextUrl.pathname
        
        // Allow access to public routes
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // Allow access to sign-in page (we handle redirect in middleware function)
        if (pathname.startsWith('/auth/signin')) {
          return true
        }

        // Protect admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN' ? true : false
        }

        // Protect checkout and profile routes
        if (
          pathname.startsWith('/checkout') ||
          pathname.startsWith('/profile') ||
          pathname.startsWith('/orders')
        ) {
          // CRITICAL: If token exists at all, allow access
          // This prevents redirect loops after sign-in
          // token can be an object even if role is missing temporarily
          const hasToken = token !== null && token !== undefined
          return hasToken
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


