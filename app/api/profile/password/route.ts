import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = passwordSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.errors[0].message },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user?.password) {
            return NextResponse.json(
                { error: 'Invalid account type' },
                { status: 400 }
            )
        }

        // Verify current password
        const isValid = await bcrypt.compare(result.data.currentPassword, user.password)
        if (!isValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(result.data.newPassword, 10)

        // Update password
        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        })

        return NextResponse.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}
