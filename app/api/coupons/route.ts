import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createCouponSchema = z.object({
    code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
    description: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    discountValue: z.number().positive(),
    minPurchase: z.number().nonnegative().optional(),
    maxDiscount: z.number().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
    isActive: z.boolean().default(true),
    categories: z.array(z.string()).default([]),
    productIds: z.array(z.string()).default([]),
})

// GET /api/coupons - Get all coupons (admin only)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const isActiveFilter = searchParams.get('isActive')

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.code = {
                contains: search,
                mode: 'insensitive',
            }
        }

        if (isActiveFilter !== null && isActiveFilter !== undefined && isActiveFilter !== '') {
            where.isActive = isActiveFilter === 'true'
        }

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    orderUsages: {
                        select: {
                            discount: true,
                        },
                    },
                },
            }),
            prisma.coupon.count({ where }),
        ])

        // Calculate total discounts given for each coupon
        const couponsWithStats = coupons.map(coupon => ({
            ...coupon,
            totalDiscountGiven: coupon.orderUsages.reduce((sum, usage) => sum + usage.discount, 0),
        }))

        return NextResponse.json({
            coupons: couponsWithStats,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching coupons:', error)
        return NextResponse.json(
            { error: 'Failed to fetch coupons' },
            { status: 500 }
        )
    }
}

// POST /api/coupons - Create new coupon (admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validatedData = createCouponSchema.parse(body)

        // Check if coupon code already exists
        const existingCoupon = await prisma.coupon.findUnique({
            where: { code: validatedData.code },
        })

        if (existingCoupon) {
            return NextResponse.json(
                { error: 'Coupon code already exists' },
                { status: 400 }
            )
        }

        // Validate date range
        const fromDate = new Date(validatedData.validFrom)
        const untilDate = new Date(validatedData.validUntil)

        if (fromDate >= untilDate) {
            return NextResponse.json(
                { error: 'Valid from date must be before valid until date' },
                { status: 400 }
            )
        }

        // Validate percentage discount
        if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
            return NextResponse.json(
                { error: 'Percentage discount cannot exceed 100%' },
                { status: 400 }
            )
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: validatedData.code,
                description: validatedData.description,
                discountType: validatedData.discountType,
                discountValue: validatedData.discountValue,
                minPurchase: validatedData.minPurchase,
                maxDiscount: validatedData.maxDiscount,
                usageLimit: validatedData.usageLimit,
                perUserLimit: validatedData.perUserLimit,
                validFrom: fromDate,
                validUntil: untilDate,
                isActive: validatedData.isActive,
                categories: validatedData.categories,
                productIds: validatedData.productIds,
            },
        })

        return NextResponse.json(coupon, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating coupon:', error)
        return NextResponse.json(
            { error: 'Failed to create coupon' },
            { status: 500 }
        )
    }
}
