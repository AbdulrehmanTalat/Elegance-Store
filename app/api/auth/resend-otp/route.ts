import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const resendOTPSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = resendOTPSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new OTP
    await prisma.user.update({
      where: { email: validatedData.email },
      data: {
        otp,
        otpExpires,
      },
    })

    // Send OTP email
    try {
      await sendOTPEmail(validatedData.email, otp)
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please check your email settings.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'OTP resent to your email' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to resend OTP' },
      { status: 500 }
    )
  }
}

