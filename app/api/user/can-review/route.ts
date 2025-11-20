import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ canReview: false, reason: 'unauthenticated' })
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Check if user has already reviewed
        const existingReview = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId: session.user.id,
                },
            },
        })

        if (existingReview) {
            return NextResponse.json({ canReview: false, reason: 'already_reviewed' })
        }

        // Check if user has purchased the product
        // Note: We allow reviews even if not verified, but we mark them differently.
        // However, for this implementation, let's enforce purchase for now as per plan,
        // or we can allow it but 'verified' will be false.
        // Let's stick to the plan: "Verify if user has purchased the product" implies we might block it?
        // Actually, the POST route I wrote allows verified=false if orderItem is missing?
        // Wait, looking at my POST route: `verified: !!orderItem`.
        // But usually we want to encourage reviews.
        // Let's check if they bought it.

        const orderItem = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId: session.user.id,
                    status: 'DELIVERED',
                },
            },
        })

        return NextResponse.json({
            canReview: true,
            isVerified: !!orderItem,
            hasPurchased: !!orderItem
        })

    } catch (error) {
        console.error('Error checking review eligibility:', error)
        return NextResponse.json(
            { error: 'Failed to check eligibility' },
            { status: 500 }
        )
    }
}
