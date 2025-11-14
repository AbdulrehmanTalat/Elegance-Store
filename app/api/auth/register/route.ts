import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (existingUser && !existingUser.emailVerified) {
      // Update existing unverified user
      await prisma.user.update({
        where: { email: validatedData.email },
        data: {
          name: validatedData.name,
          otp,
          otpExpires,
        },
      })
    } else {
      // Create new user without password (will be set after OTP verification)
      await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          otp,
          otpExpires,
          emailVerified: false,
        },
      })
    }

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
      { message: 'OTP sent to your email. Please verify to complete registration.' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

