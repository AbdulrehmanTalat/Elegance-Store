import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { UndergarmentSubcategory } from '@prisma/client'

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().positive().optional().nullable(),
  image: z.string().optional().nullable(),
  category: z.enum(['UNDERGARMENTS', 'JEWELRY', 'MAKEUP']),
  subcategory: z.enum(['LINGERIE', 'BRA', 'PANTIES', 'BRA_PANTIES_SET', 'THONGS', 'BIKINI', 'LOUNGE_WEAR', 'PLUS_SIZE_LINGERIE']).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const admin = searchParams.get('admin') === 'true'

    // Check if admin is requesting all products
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    const where: any = {}

    // Only filter by isActive if not admin or admin=false
    if (!admin || !isAdmin) {
      where.isActive = true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        colors: {
          include: {
            variants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Received product data:', body)
    
    // Validate the data
    const validatedData = productSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Ensure subcategory is only set for UNDERGARMENTS
    const productData: any = {
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      basePrice: validatedData.basePrice,
      image: validatedData.image,
      isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
    }

    // Only add subcategory if category is UNDERGARMENTS
    if (validatedData.category === 'UNDERGARMENTS' && validatedData.subcategory) {
      // Cast to Prisma enum type
      productData.subcategory = validatedData.subcategory as UndergarmentSubcategory
    } else {
      productData.subcategory = null
    }

    console.log('Creating product with data:', productData)

    const product = await prisma.product.create({
      data: productData,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating product:', error)
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

