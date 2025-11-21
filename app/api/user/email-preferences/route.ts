import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's email preferences
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                emailOrderConfirmation: true,
                emailShippingUpdates: true,
                emailOrderStatus: true,
                emailMarketing: true,
                emailAccountUpdates: true,
                emailPreferencesUpdatedAt: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching email preferences:', error)
        return NextResponse.json(
            { error: 'Failed to fetch email preferences' },
            { status: 500 }
        )
    }
}

// PATCH - Update user's email preferences
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()

        // Validate that only allowed fields are being updated
        const allowedFields = [
            'emailOrderConfirmation',
            'emailShippingUpdates',
            'emailOrderStatus',
            'emailMarketing',
            'emailAccountUpdates',
        ]

        const updates: any = {}
        for (const field of allowedFields) {
            if (typeof body[field] === 'boolean') {
                updates[field] = body[field]
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            )
        }

        // Update timestamp
        updates.emailPreferencesUpdatedAt = new Date()

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updates,
            select: {
                emailOrderConfirmation: true,
                emailShippingUpdates: true,
                emailOrderStatus: true,
                emailMarketing: true,
                emailAccountUpdates: true,
                emailPreferencesUpdatedAt: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating email preferences:', error)
        return NextResponse.json(
            { error: 'Failed to update email preferences' },
            { status: 500 }
        )
    }
}
