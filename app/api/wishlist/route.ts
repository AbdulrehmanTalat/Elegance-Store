import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const wishlist = await prisma.wishlist.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                product: {
                    include: {
                        colors: {
                            include: {
                                variants: true
                            }
                        }
                    }
                },
                variant: {
                    include: {
                        color: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(wishlist)
    } catch (error) {
        console.error('Error fetching wishlist:', error)
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { productId, variantId } = body

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Check if already exists
        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_productId_variantId: {
                    userId: session.user.id,
                    productId,
                    variantId: variantId || null, // Handle optional variantId
                },
            },
        })

        if (existing) {
            return NextResponse.json(
                { message: 'Item already in wishlist' },
                { status: 200 }
            )
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: session.user.id,
                productId,
                variantId: variantId || null,
            },
        })

        return NextResponse.json(wishlistItem)
    } catch (error) {
        console.error('Error adding to wishlist:', error)
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const variantId = searchParams.get('variantId')

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // Prisma doesn't support deleteMany with unique constraint directly in the same way as delete
        // But here we want to delete a specific item.
        // Since we have a unique constraint on [userId, productId, variantId], we can use delete with the unique key.
        // However, variantId might be null, and URL params are strings.

        // If we pass the ID of the wishlist item, it's easier. But usually frontend has product ID.
        // Let's try to find it first or use deleteMany which is safer if we don't have the wishlist ID.

        await prisma.wishlist.deleteMany({
            where: {
                userId: session.user.id,
                productId,
                variantId: variantId || null,
            },
        })

        return NextResponse.json({ message: 'Removed from wishlist' })
    } catch (error) {
        console.error('Error removing from wishlist:', error)
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        )
    }
}
