import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusUpdateEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
        include: {
          user: true,
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

      // Prepare order items for email
      const emailItems = order.items.map((item) => {
        let image: string | null = null
        
        // Get image from variant color or product
        if (item.variant?.color?.images && item.variant.color.images.length > 0) {
          image = item.variant.color.images[0]
        } else if (item.product.image) {
          image = item.product.image
        }
        
        return {
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image,
          colorName: item.colorName,
          bandSize: item.bandSize || item.variant?.bandSize || null,
          cupSize: item.cupSize || item.variant?.cupSize || null,
          size: item.variant?.size || null,
        }
      })

      await sendOrderStatusUpdateEmail(
        order.email,
        order.id,
        'CONFIRMED',
        order.totalAmount,
        order.shippingAddress,
        order.phone,
        emailItems,
        order.createdAt
      )
    }
  }

  return NextResponse.json({ received: true })
}

