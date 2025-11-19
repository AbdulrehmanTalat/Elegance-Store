'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Suspense } from 'react'
import Link from 'next/link'
import { useToast } from '@/components/ToastProvider'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/profile'
  const { data: session, status } = useSession()
  const { showError } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  // Extract pathname from callbackUrl (handle both full URLs and relative paths)
  const getCallbackPath = () => {
    try {
      // If it's a full URL, extract the pathname
      if (rawCallbackUrl.startsWith('http://') || rawCallbackUrl.startsWith('https://')) {
        const url = new URL(rawCallbackUrl)
        return url.pathname
      }
      // If it's already a relative path, use it as is
      return rawCallbackUrl
    } catch {
      // If URL parsing fails, default to /profile
      return '/profile'
    }
  }

  const callbackPath = getCallbackPath()

  // Let middleware handle redirects - don't redirect here to avoid loops
  // Just show loading while session is being processed
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    )
  }

  const onSubmit = async (data: SignInFormData) => {
    try {
      // Determine the target URL - use relative path for NextAuth
      const targetUrl = callbackPath !== '/' && 
                       callbackPath !== '/auth/signin' && 
                       !callbackPath.startsWith('/auth/')
        ? callbackPath
        : '/profile'

      // Use NextAuth's built-in redirect - this will handle the redirect properly
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false, // Handle redirect manually to avoid conflicts
        callbackUrl: targetUrl,
      })

      if (result?.error) {
        showError('Invalid email or password')
      } else if (result?.ok) {
        // Let NextAuth handle the redirect
        window.location.href = targetUrl
      }
    } catch (error) {
      showError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16">Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
