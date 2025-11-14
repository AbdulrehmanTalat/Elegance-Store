import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const colorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  images: z.array(z.string().min(1)), // Accept any string (URLs or file paths)
})

const variantSchema = z.object({
  id: z.string().optional(),
  colorId: z.string().optional(),
  colorName: z.string().min(1),
  bandSize: z.string().optional().nullable(),
  cupSize: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  sku: z.string().optional().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        colors: {
          include: {
            variants: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        subcategory: product.subcategory,
      },
      colors: product.colors,
      variants: product.colors.flatMap((color) =>
        color.variants.map((v) => ({
          ...v,
          colorName: color.name,
        }))
      ),
    })
  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { colors, variants } = body

    // Validate colors
    const validatedColors = z.array(colorSchema).parse(colors)
    const validatedVariants = z.array(variantSchema).parse(variants)

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { colors: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete existing colors and variants (cascade will handle variants)
    await prisma.productColor.deleteMany({
      where: { productId: params.id },
    })

    // Create new colors
    const createdColors = await Promise.all(
      validatedColors.map((color) =>
        prisma.productColor.create({
          data: {
            productId: params.id,
            name: color.name,
            images: color.images,
          },
        })
      )
    )

    // Create color name to ID mapping
    const colorMap = new Map<string, string>()
    validatedColors.forEach((color, index) => {
      colorMap.set(color.name, createdColors[index].id)
    })

    // Create variants
    await Promise.all(
      validatedVariants.map((variant) =>
        prisma.productVariant.create({
          data: {
            colorId: colorMap.get(variant.colorName)!,
            bandSize: variant.bandSize || null,
            cupSize: variant.cupSize || null,
            size: variant.size || null,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku || null,
          },
        })
      )
    )

    return NextResponse.json({ message: 'Variants saved successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error saving variants:', error)
    return NextResponse.json(
      { error: 'Failed to save variants' },
      { status: 500 }
    )
  }
}

