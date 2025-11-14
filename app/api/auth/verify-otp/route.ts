import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = verifyOTPSchema.parse(body)

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

    // Check if OTP exists and is valid
    if (!user.otp || !user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (user.otp !== validatedData.otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Update user: set password, verify email, clear OTP
    await prisma.user.update({
      where: { email: validatedData.email },
      data: {
        password: hashedPassword,
        emailVerified: true,
        otp: null,
        otpExpires: null,
      },
    })

    return NextResponse.json(
      { message: 'Email verified and account created successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}

