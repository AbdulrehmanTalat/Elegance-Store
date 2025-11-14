import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingAddress, phone, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate total and verify stock
    let totalAmount = 0
    for (const item of items) {
      if (item.variantId) {
        // Check variant stock
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { color: { include: { product: true } } },
        })

        if (!variant || !variant.color.product.isActive || variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.name || 'product'}` },
            { status: 400 }
          )
        }
      } else {
        // Check product stock (for non-variant products)
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || !product.isActive) {
          return NextResponse.json(
            { error: `Product ${product?.name || 'product'} not available` },
            { status: 400 }
          )
        }
      }

      totalAmount += item.price * item.quantity
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        shippingAddress,
        phone,
        email: session.user.email!,
        items: {
          create: await Promise.all(
            items.map(async (item: any) => {
              let variantData: any = {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              }

              if (item.variantId) {
                const variant = await prisma.productVariant.findUnique({
                  where: { id: item.variantId },
                  include: { color: true },
                })
                if (variant) {
                  variantData.variantId = item.variantId
                  variantData.colorName = variant.color.name
                  variantData.bandSize = variant.bandSize
                  variantData.cupSize = variant.cupSize
                }
              }

              return variantData
            })
          ),
        },
      },
      include: { items: true },
    })

    // Update stock
    for (const item of items) {
      if (item.variantId) {
        // Update variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
      // Note: Non-variant products don't have stock field anymore
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(
      session.user.email!,
      order.id,
      totalAmount
    )

    if (paymentMethod === 'ONLINE') {
      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'pkr',
            product_data: {
              name: item.name || 'Product',
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`,
        metadata: {
          orderId: order.id,
        },
      })

      return NextResponse.json({
        orderId: order.id,
        paymentUrl: checkoutSession.url,
      })
    }

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

