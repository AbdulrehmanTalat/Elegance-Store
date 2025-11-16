import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // If authenticated, redirect immediately before rendering anything
  if (session?.user) {
    // Get callbackUrl from request URL
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const path = headersList.get('x-pathname') || '/auth/signin'
    const search = headersList.get('x-search') || ''
    
    // Try to get from URL search params
    let targetPath = '/profile'
    
    if (search) {
      try {
        const params = new URLSearchParams(search)
        const callbackUrl = params.get('callbackUrl')
        if (callbackUrl) {
          let extractedPath = callbackUrl
          if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
            const urlObj = new URL(callbackUrl)
            extractedPath = urlObj.pathname
          }
          if (extractedPath.startsWith('/') && 
              !extractedPath.startsWith('/auth/') && 
              extractedPath !== '/auth/signin') {
            targetPath = extractedPath
          }
        }
      } catch {
        // Use default
      }
    }
    
    if (session.user.role === 'ADMIN') {
      redirect('/admin')
    } else {
      redirect(targetPath)
    }
  }
  
  return <>{children}</>
}

