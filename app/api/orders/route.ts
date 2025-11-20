import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from '@/lib/email'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingAddress, phone, paymentMethod, couponId, discountAmount } = body

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

    // Apply discount
    const finalTotalAmount = totalAmount - (discountAmount || 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: finalTotalAmount,
        discountAmount: discountAmount || 0,
        couponId: couponId || null,
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
                  // Note: size is stored in variant, not OrderItem (schema limitation)
                }
              }

              return variantData
            })
          ),
        },
      },
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

    // Create coupon usage record if coupon was applied
    if (couponId && discountAmount > 0) {
      await prisma.couponUsage.create({
        data: {
          couponId,
          userId: session.user.id,
          orderId: order.id,
          discount: discountAmount,
        },
      })

      // Increment coupon usage count
      await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usageCount: { increment: 1 },
        },
      })
    }

    // Note: Stock will be decremented when order is confirmed (not at creation)
    // This prevents stock issues if order is cancelled or payment fails

    // Prepare order items for email
    const emailItems = order.items.map((item) => {
      let image: string | null = null

      // Get image from variant color or product
      if (item.variant?.color?.images && item.variant.color.images.length > 0) {
        image = item.variant.color.images[0]
      } else if (item.product.image) {
        image = item.product.image
      }

      // Return base product name (variant info will be shown separately in email)
      return {
        productName: item.product.name, // Base product name only
        quantity: item.quantity,
        price: item.price,
        image,
        colorName: item.colorName,
        bandSize: item.bandSize || item.variant?.bandSize || null,
        cupSize: item.cupSize || item.variant?.cupSize || null,
        size: item.variant?.size || null,
      }
    })

    // Send confirmation email to customer
    await sendOrderConfirmationEmail(
      session.user.email!,
      order.id,
      finalTotalAmount,
      shippingAddress,
      phone,
      emailItems,
      order.createdAt,
      discountAmount || 0
    )

    // Get admin emails and send notification
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    })

    // Send notification to all admins
    await Promise.all(
      admins.map((admin) =>
        sendAdminOrderNotificationEmail(
          admin.email,
          order.id,
          totalAmount,
          session.user.email!,
          shippingAddress,
          phone,
          emailItems,
          order.createdAt
        )
      )
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

