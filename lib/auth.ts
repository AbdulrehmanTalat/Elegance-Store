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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after sign-in
      // If url is a callbackUrl, use it
      if (url.startsWith('/')) {
        // Don't redirect back to sign-in
        if (url === '/auth/signin' || url.startsWith('/auth/')) {
          return `${baseUrl}/profile`
        }
        return `${baseUrl}${url}`
      }
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

