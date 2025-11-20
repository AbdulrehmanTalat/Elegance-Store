import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateCouponSchema = z.object({
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    discountValue: z.number().positive().optional(),
    minPurchase: z.number().nonnegative().optional().nullable(),
    maxDiscount: z.number().positive().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    perUserLimit: z.number().int().positive().optional().nullable(),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
})

// GET /api/coupons/[id] - Get coupon details (admin only)
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            )
        }

        const coupon = await prisma.coupon.findUnique({
            where: { id: params.id },
            include: {
                orderUsages: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        order: {
                            select: {
                                id: true,
                                createdAt: true,
                                totalAmount: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        })

        if (!coupon) {
            return NextResponse.json(
                { error: 'Coupon not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(coupon)
    } catch (error) {
        console.error('Error fetching coupon:', error)
        return NextResponse.json(
            { error: 'Failed to fetch coupon' },
            { status: 500 }
        )
    }
}

// PUT /api/coupons/[id] - Update coupon (admin only)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validatedData = updateCouponSchema.parse(body)

        // Check if coupon exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { id: params.id },
        })

        if (!existingCoupon) {
            return NextResponse.json(
                { error: 'Coupon not found' },
                { status: 404 }
            )
        }

        // Validate date range if both dates are provided
        if (validatedData.validFrom || validatedData.validUntil) {
            const fromDate = validatedData.validFrom
                ? new Date(validatedData.validFrom)
                : existingCoupon.validFrom
            const untilDate = validatedData.validUntil
                ? new Date(validatedData.validUntil)
                : existingCoupon.validUntil

            if (fromDate >= untilDate) {
                return NextResponse.json(
                    { error: 'Valid from date must be before valid until date' },
                    { status: 400 }
                )
            }
        }

        // Validate percentage discount
        const discountType = validatedData.discountType || existingCoupon.discountType
        const discountValue = validatedData.discountValue || existingCoupon.discountValue

        if (discountType === 'PERCENTAGE' && discountValue > 100) {
            return NextResponse.json(
                { error: 'Percentage discount cannot exceed 100%' },
                { status: 400 }
            )
        }

        const updateData: any = { ...validatedData }

        if (validatedData.validFrom) {
            updateData.validFrom = new Date(validatedData.validFrom)
        }
        if (validatedData.validUntil) {
            updateData.validUntil = new Date(validatedData.validUntil)
        }

        const coupon = await prisma.coupon.update({
            where: { id: params.id },
            data: updateData,
        })

        return NextResponse.json(coupon)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error updating coupon:', error)
        return NextResponse.json(
            { error: 'Failed to update coupon' },
            { status: 500 }
        )
    }
}

// DELETE /api/coupons/[id] - Delete coupon (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            )
        }

        // Check if coupon exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { id: params.id },
            include: {
                orderUsages: true,
            },
        })

        if (!existingCoupon) {
            return NextResponse.json(
                { error: 'Coupon not found' },
                { status: 404 }
            )
        }

        // If coupon has been used, just deactivate it instead of deleting
        if (existingCoupon.orderUsages.length > 0) {
            const updatedCoupon = await prisma.coupon.update({
                where: { id: params.id },
                data: { isActive: false },
            })

            return NextResponse.json({
                message: 'Coupon has been used and was deactivated instead of deleted',
                coupon: updatedCoupon,
            })
        }

        // Delete coupon if it hasn't been used
        await prisma.coupon.delete({
            where: { id: params.id },
        })

        return NextResponse.json({
            message: 'Coupon deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting coupon:', error)
        return NextResponse.json(
            { error: 'Failed to delete coupon' },
            { status: 500 }
        )
    }
}
