import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  email: z.string().email('Valid email is required'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, email } = trackSchema.parse(body)

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        email: email.toLowerCase(),
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                colors: true,
              },
            },
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
        { error: 'Order not found. Please check your Order ID and Email address.' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Error fetching tracking order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order tracking information' },
      { status: 500 }
    )
  }
}
