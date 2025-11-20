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
          throw new Error('UserNotFound')
        }

        if (!user.password) {
          console.log('Auth: User has no password')
          throw new Error('UserHasNoPassword')
        }

        // Check if email is verified (admins can bypass this check)
        if (!user.emailVerified && user.role !== 'ADMIN') {
          console.log('Auth: Email not verified')
          throw new Error('EmailNotVerified')
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
          throw new Error('InvalidPassword')
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
    maxAge: 4 * 60 * 60, // 4 hours
    updateAge: 60 * 60, // 1 hour - session is updated every hour
  },
  jwt: {
    maxAge: 4 * 60 * 60, // 4 hours - JWT token expires after 4 hours
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const fourHoursInSeconds = 4 * 60 * 60
      const now = Math.floor(Date.now() / 1000)

      if (user) {
        // New token creation - set expiration to 4 hours from now
        token.role = (user as any).role
        token.id = user.id
        token.exp = now + fourHoursInSeconds
        console.log('JWT: New token created, exp set to:', new Date((token.exp as number) * 1000).toISOString())
      } else {
        // For existing tokens, check and fix expiration
        const currentExp = typeof token.exp === 'number' ? token.exp : 0
        const hoursFromNow = currentExp > 0 ? Math.floor((currentExp - now) / (60 * 60)) : 0

        // If expiration is more than 8 hours (catches old long-lived tokens), fix it
        if (!token.exp || currentExp > now + (8 * 60 * 60)) {
          token.exp = now + fourHoursInSeconds
          console.log('JWT: Fixed token exp from', currentExp ? `${hoursFromNow} hours` : 'missing', 'to 4 hours')
        } else {
          console.log('JWT: Token exp is correct:', hoursFromNow, 'hours from now')
        }
      }

      // Ensure token.exp is always set correctly
      if (!token.exp || (typeof token.exp === 'number' && token.exp > now + (8 * 60 * 60))) {
        token.exp = now + fourHoursInSeconds
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      // Explicitly set session.expires from token.exp
      // NextAuth doesn't always use token.exp correctly, so we force it
      if (token.exp && typeof token.exp === 'number') {
        session.expires = new Date(token.exp * 1000).toISOString()
      } else {
        // Fallback: calculate 4 hours from now if token.exp is missing
        const fourHoursFromNow = new Date()
        fourHoursFromNow.setHours(fourHoursFromNow.getHours() + 4)
        session.expires = fourHoursFromNow.toISOString()
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


