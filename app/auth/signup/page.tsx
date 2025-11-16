'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ToastProvider'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
})

const verifyOTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignUpFormData = z.infer<typeof signUpSchema>
type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>

export default function SignUpPage() {
  const router = useRouter()
  const { showSuccess } = useToast()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'signup' | 'verify'>('signup')
  const [email, setEmail] = useState('')

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
  })

  const onSubmitSignup = async (data: SignUpFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
        return
      }

      setEmail(data.email)
      setStep('verify')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitVerify = async (data: VerifyOTPFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: data.otp,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Verification failed')
        return
      }

      router.push('/auth/signin?registered=true')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to resend OTP')
        return
      }

      showSuccess('OTP resent to your email!')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {step === 'signup' ? 'Sign Up' : 'Verify Email'}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 'signup' ? (
          <form onSubmit={handleSubmitSignup(onSubmitSignup)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                {...registerSignup('name')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter your name"
              />
              {signupErrors.name && (
                <p className="text-red-600 text-sm mt-1">{signupErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                {...registerSignup('email')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter your email"
              />
              {signupErrors.email && (
                <p className="text-red-600 text-sm mt-1">{signupErrors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitVerify(onSubmitVerify)} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              <p className="text-sm">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                {...registerVerify('otp')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              {verifyErrors.otp && (
                <p className="text-red-600 text-sm mt-1">{verifyErrors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                {...registerVerify('password')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter your password"
              />
              {verifyErrors.password && (
                <p className="text-red-600 text-sm mt-1">
                  {verifyErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...registerVerify('confirmPassword')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Confirm your password"
              />
              {verifyErrors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {verifyErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full text-primary-600 hover:text-primary-700 text-sm"
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => setStep('signup')}
              className="w-full text-gray-600 hover:text-gray-700 text-sm"
            >
              Change Email
            </button>
          </form>
        )}

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
