import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        variant: {
          include: {
            color: true,
          },
        },
      },
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, variantId, quantity } = body

    // Check if variant exists and has stock
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { color: { include: { product: true } } },
      })

      if (!variant || !variant.color.product.isActive || variant.stock < quantity) {
        return NextResponse.json(
          { error: 'Variant not available or out of stock' },
          { status: 400 }
        )
      }

      const cartItem = await prisma.cartItem.upsert({
        where: {
          userId_productId_variantId: {
            userId: session.user.id,
            productId,
            variantId,
          },
        },
        update: {
          quantity: {
            increment: quantity || 1,
          },
        },
        create: {
          userId: session.user.id,
          productId,
          variantId,
          quantity: quantity || 1,
        },
        include: {
          product: true,
          variant: {
            include: {
              color: true,
            },
          },
        },
      })

      return NextResponse.json(cartItem)
    }

    // Handle non-variant products (backward compatibility)
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 400 }
      )
    }

    // Find existing cart item for non-variant products
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        variantId: null,
      },
    })

    let cartItem
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: {
            increment: quantity || 1,
          },
        },
        include: {
          product: true,
        },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variantId: null,
          quantity: quantity || 1,
        },
        include: {
          product: true,
        },
      })
    }

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      })
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id },
      })
    }

    return NextResponse.json({ message: 'Cart item removed' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}

