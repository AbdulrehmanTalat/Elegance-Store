'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/'
  const { data: session, status } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Extract path from callbackUrl (handle both full URLs and paths)
  const getCallbackPath = (url: string): string => {
    try {
      // If it's a full URL, extract the path
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const urlObj = new URL(url)
        return urlObj.pathname + urlObj.search
      }
      // If it's already a path, return as is
      return url
    } catch {
      // If URL parsing fails, treat as path
      return url.startsWith('/') ? url : `/${url}`
    }
  }

  const callbackUrl = getCallbackPath(rawCallbackUrl)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  // Redirect if already authenticated - use hard redirect to break any loops
  useEffect(() => {
    if (status === 'loading' || isRedirecting) return

    if (session?.user) {
      setIsRedirecting(true)
      // Use hard redirect to break any loops - middleware should handle this, but as fallback
      if (session.user.role === 'ADMIN') {
        window.location.href = '/admin'
      } else {
        // For regular users, use callbackUrl if provided, otherwise go to profile
        const cleanCallback = callbackUrl.split('?')[0]
        let targetUrl = '/profile'
        
        if (cleanCallback && 
            cleanCallback !== '/' && 
            cleanCallback !== '/auth/signin' && 
            !cleanCallback.startsWith('/auth/') &&
            cleanCallback.startsWith('/')) {
          targetUrl = cleanCallback
        }
        
        window.location.href = targetUrl
      }
    }
  }, [session, status, callbackUrl, isRedirecting])

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'Please verify your email first') {
          setError('Please verify your email first. Check your inbox for the verification code.')
        } else {
          setError('Invalid email or password')
        }
      } else if (result?.ok) {
        // Fetch session to get user role and redirect accordingly
        const getSessionWithRetry = async (retries = 3): Promise<void> => {
          try {
            const sessionResponse = await fetch('/api/auth/session', {
              cache: 'no-store',
            })
            const session = await sessionResponse.json()
            
            if (session?.user?.role) {
              // Redirect based on role
              if (session.user.role === 'ADMIN') {
                router.replace('/admin')
              } else {
                // Regular users go to profile/dashboard
                router.replace('/profile')
              }
            } else if (retries > 0) {
              // Retry if session not ready yet
              await new Promise((resolve) => setTimeout(resolve, 200))
              return getSessionWithRetry(retries - 1)
            } else {
              // Fallback to default redirect
              const cleanCallback = callbackUrl.split('?')[0]
              const targetUrl = cleanCallback && cleanCallback !== '/' && cleanCallback !== '/auth/signin' && cleanCallback.startsWith('/') 
                ? cleanCallback 
                : '/profile'
              router.replace(targetUrl)
            }
          } catch (err) {
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 200))
              return getSessionWithRetry(retries - 1)
            } else {
              // Fallback to default redirect
              const cleanCallback = callbackUrl.split('?')[0]
              const targetUrl = cleanCallback && cleanCallback !== '/' && cleanCallback !== '/auth/signin' && cleanCallback.startsWith('/') 
                ? cleanCallback 
                : '/profile'
              router.replace(targetUrl)
            }
          }
        }
        
        await getSessionWithRetry()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  // Don't render form if already authenticated (redirect is in progress)
  if (session?.user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
          <div className="text-center">Redirecting...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
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
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

