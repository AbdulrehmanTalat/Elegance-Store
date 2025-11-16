import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusUpdateEmail } from '@/lib/email'
import { PaymentStatus } from '@prisma/client'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateOrderSchema.parse(body)

    // If order is cancelled, also update payment status to FAILED
    const updateData: { status: string; paymentStatus?: PaymentStatus } = {
      status: validatedData.status,
    }
    
    if (validatedData.status === 'CANCELLED') {
      updateData.paymentStatus = 'FAILED'
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
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
      validatedData.status,
      order.totalAmount,
      order.shippingAddress,
      order.phone,
      emailItems,
      order.createdAt
    )

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

