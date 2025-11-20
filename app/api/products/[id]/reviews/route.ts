import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                productId: params.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Error fetching reviews:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: 'You must be logged in to leave a review' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { rating, title, comment, images } = body

        if (!rating || !comment) {
            return NextResponse.json(
                { error: 'Rating and comment are required' },
                { status: 400 }
            )
        }

        // Check if user has purchased the product
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                productId: params.id,
                order: {
                    userId: session.user.id,
                    status: 'DELIVERED', // Only allow reviews for delivered items
                },
            },
        })

        // Check if user has already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId: params.id,
                    userId: session.user.id,
                },
            },
        })

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 400 }
            )
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                productId: params.id,
                userId: session.user.id,
                rating,
                title,
                comment,
                images: images || [],
                verified: !!orderItem, // Mark as verified if they bought it
            },
        })

        // Update product average rating
        const aggregates = await prisma.review.aggregate({
            where: { productId: params.id },
            _avg: { rating: true },
            _count: { rating: true },
        })

        await prisma.product.update({
            where: { id: params.id },
            data: {
                avgRating: aggregates._avg.rating || 0,
                reviewCount: aggregates._count.rating || 0,
            },
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        )
    }
}
