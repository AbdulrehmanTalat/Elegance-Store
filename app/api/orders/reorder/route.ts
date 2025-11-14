import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSchema = z.object({
  orderId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = reorderSchema.parse(body)

    // Get the original order
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                color: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check stock availability and prepare items for cart
    const cartItems = []
    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          colors: {
            include: {
              variants: true,
            },
          },
        },
      })

      if (!product || !product.isActive) {
        continue // Skip unavailable products
      }

      // Handle variant products
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        })

        if (!variant || variant.stock <= 0) {
          continue // Skip out of stock variants
        }

        const availableQuantity = Math.min(item.quantity, variant.stock)
        if (availableQuantity > 0) {
          // Get color image for variant
          const color = product.colors.find(c => 
            c.variants.some(v => v.id === item.variantId)
          )
          const image = color?.images?.[0] || product.image || ''

          cartItems.push({
            productId: item.productId,
            variantId: item.variantId,
            name: `${product.name} - ${item.colorName || ''} ${item.bandSize || ''} ${item.cupSize || ''} ${item.size || ''}`.trim(),
            price: variant.price,
            image,
            quantity: availableQuantity,
          })
        }
      } else {
        // Handle non-variant products (use basePrice if available)
        const price = product.basePrice || 0
        if (price > 0) {
          cartItems.push({
            productId: item.productId,
            name: product.name,
            price,
            image: product.image || '',
            quantity: item.quantity,
          })
        }
      }
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'No items available to reorder' },
        { status: 400 }
      )
    }

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder' },
      { status: 500 }
    )
  }
}

