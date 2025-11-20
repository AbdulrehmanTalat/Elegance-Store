import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const validateCouponSchema = z.object({
    code: z.string().min(1),
    cartTotal: z.number().positive(),
    cartItems: z.array(z.object({
        productId: z.string(),
        category: z.string(),
    })).optional(),
})

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'You must be logged in to use coupons' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { code, cartTotal, cartItems } = validateCouponSchema.parse(body)

        // Find the coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                orderUsages: {
                    where: {
                        userId: session.user.id,
                    },
                },
            },
        })

        if (!coupon) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid coupon code',
                    errorType: 'NOT_FOUND',
                },
                { status: 404 }
            )
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'This coupon is no longer active',
                    errorType: 'INACTIVE',
                },
                { status: 400 }
            )
        }

        // Check date validity
        const now = new Date()
        if (now < coupon.validFrom) {
            return NextResponse.json(
                {
                    valid: false,
                    error: `This coupon is not valid yet. Valid from ${coupon.validFrom.toLocaleDateString()}`,
                    errorType: 'NOT_YET_VALID',
                },
                { status: 400 }
            )
        }

        if (now > coupon.validUntil) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'This coupon has expired',
                    errorType: 'EXPIRED',
                },
                { status: 400 }
            )
        }

        // Check total usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'This coupon has reached its usage limit',
                    errorType: 'USAGE_LIMIT_REACHED',
                },
                { status: 400 }
            )
        }

        // Check per-user limit
        if (coupon.perUserLimit && coupon.orderUsages.length >= coupon.perUserLimit) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'You have already used this coupon the maximum number of times',
                    errorType: 'USER_LIMIT_REACHED',
                },
                { status: 400 }
            )
        }

        // Check minimum purchase requirement
        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            return NextResponse.json(
                {
                    valid: false,
                    error: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} required to use this coupon`,
                    errorType: 'MIN_PURCHASE_NOT_MET',
                    required: coupon.minPurchase,
                    current: cartTotal,
                },
                { status: 400 }
            )
        }

        // Check category restrictions
        if (coupon.categories.length > 0 && cartItems) {
            const hasValidCategory = cartItems.some(item =>
                coupon.categories.includes(item.category)
            )

            if (!hasValidCategory) {
                return NextResponse.json(
                    {
                        valid: false,
                        error: 'This coupon is not valid for items in your cart',
                        errorType: 'INVALID_CATEGORY',
                    },
                    { status: 400 }
                )
            }
        }

        // Check product restrictions
        if (coupon.productIds.length > 0 && cartItems) {
            const hasValidProduct = cartItems.some(item =>
                coupon.productIds.includes(item.productId)
            )

            if (!hasValidProduct) {
                return NextResponse.json(
                    {
                        valid: false,
                        error: 'This coupon is not valid for items in your cart',
                        errorType: 'INVALID_PRODUCT',
                    },
                    { status: 400 }
                )
            }
        }

        // Calculate discount
        let discountAmount = 0

        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * coupon.discountValue) / 100

            // Apply max discount cap if specified
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount
            }
        } else {
            // FIXED_AMOUNT
            discountAmount = coupon.discountValue

            // Ensure discount doesn't exceed cart total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal
            }
        }

        // Round to 2 decimal places
        discountAmount = Math.round(discountAmount * 100) / 100
        const finalTotal = Math.max(0, cartTotal - discountAmount)

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discount: {
                amount: discountAmount,
                originalTotal: cartTotal,
                finalTotal,
            },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error validating coupon:', error)
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        )
    }
}
