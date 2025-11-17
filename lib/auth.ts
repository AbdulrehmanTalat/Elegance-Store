import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth: Missing credentials')
          return null
        }

        // Normalize email (trim and lowercase)
        const normalizedEmail = credentials.email.trim().toLowerCase()
        console.log('Auth: Attempting login for:', normalizedEmail)
        console.log('Auth: Original email:', credentials.email)

        // Try exact match first, then case-insensitive
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        // If not found, try case-insensitive search
        if (!user) {
          const users = await prisma.user.findMany({
            where: {
              email: {
                equals: normalizedEmail,
                mode: 'insensitive',
              },
            },
          })
          user = users[0] || null
        }

        if (!user) {
          console.log('Auth: User not found')
          return null
        }

        if (!user.password) {
          console.log('Auth: User has no password')
          return null
        }

        // Check if email is verified (admins can bypass this check)
        if (!user.emailVerified && user.role !== 'ADMIN') {
          console.log('Auth: Email not verified')
          throw new Error('Please verify your email first')
        }
        
        // Auto-verify admin emails if not already verified
        if (user.role === 'ADMIN' && !user.emailVerified) {
          console.log('Auth: Auto-verifying admin email')
          await prisma.user.update({
            where: { email: normalizedEmail },
            data: { emailVerified: true },
          })
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('Auth: Password valid:', isPasswordValid)
        console.log('Auth: User role:', user.role)

        if (!isPasswordValid) {
          console.log('Auth: Invalid password')
          return null
        }

        console.log('Auth: Login successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - session is updated every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days - JWT token expires after 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60
      const now = Math.floor(Date.now() / 1000)
      
      if (user) {
        // New token creation - set expiration to 30 days from now
        token.role = (user as any).role
        token.id = user.id
        token.exp = now + thirtyDaysInSeconds
      } else if (!token.exp || token.exp > now + (60 * 24 * 60 * 60)) {
        // Existing token - fix expiration if it's wrong (more than 60 days)
        // This fixes tokens created with old code that had 1-year expiration
        token.exp = now + thirtyDaysInSeconds
      }
      // If token.exp exists and is reasonable (30-60 days), keep it as is
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      // Use token.exp (which we force to 30 days in jwt callback) to set session expiration
      if (token.exp && typeof token.exp === 'number') {
        session.expires = new Date(token.exp * 1000).toISOString()
      } else {
        // Fallback: calculate 30 days from now
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        session.expires = thirtyDaysFromNow.toISOString()
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Parse the URL to handle both relative and absolute paths
      let targetUrl = url
      
      // If it's a relative path, make it absolute
      if (url.startsWith('/')) {
        targetUrl = `${baseUrl}${url}`
      }
      
      // Parse to get the pathname
      try {
        const parsed = new URL(targetUrl)
        const pathname = parsed.pathname
        
        // Never redirect back to sign-in or auth pages
        if (pathname === '/auth/signin' || pathname.startsWith('/auth/')) {
          // Default to /profile - middleware will redirect admins to /admin
          return `${baseUrl}/profile`
        }
        
        // If it's the same origin, return the full URL
        if (parsed.origin === baseUrl) {
          return targetUrl
        }
      } catch {
        // If URL parsing fails, default to /profile
      }
      
      // Default: redirect to /profile (middleware will handle admin redirect)
      return `${baseUrl}/profile`
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

