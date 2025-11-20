import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ isInWishlist: false })
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

        const item = await prisma.wishlist.findUnique({
            where: {
                userId_productId_variantId: {
                    userId: session.user.id,
                    productId,
                    variantId: variantId || null,
                },
            },
        })

        return NextResponse.json({ isInWishlist: !!item })
    } catch (error) {
        console.error('Error checking wishlist:', error)
        return NextResponse.json(
            { error: 'Failed to check wishlist' },
            { status: 500 }
        )
    }
}
