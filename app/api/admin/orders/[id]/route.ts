import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusUpdateEmail } from '@/lib/email'
import { PaymentStatus, OrderStatus } from '@prisma/client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

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
    const userRole = (session?.user as any)?.role
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateOrderSchema.parse(body)

    // If order is cancelled, also update payment status to FAILED
    const updateData: { status: OrderStatus; paymentStatus?: PaymentStatus } = {
      status: validatedData.status as OrderStatus,
    }

    if (validatedData.status === 'CANCELLED') {
      updateData.paymentStatus = 'FAILED'
    }

    // Get the current order to check previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const previousStatus = currentOrder.status
    const newStatus = validatedData.status as OrderStatus

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

    // Handle stock updates based on status change
    if (newStatus === 'CONFIRMED' && previousStatus !== 'CONFIRMED') {
      // Check stock availability before confirming
      for (const item of order.items) {
        if (item.variantId) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
          })
          if (!variant || variant.stock < item.quantity) {
            return NextResponse.json(
              { error: `Insufficient stock for ${item.product.name}. Available: ${variant?.stock || 0}, Required: ${item.quantity}` },
              { status: 400 }
            )
          }
        }
      }

      // Decrement stock when order is confirmed
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }
    } else if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      // Restore stock when order is cancelled (only if it was previously confirmed)
      if (previousStatus === 'CONFIRMED') {
        for (const item of order.items) {
          if (item.variantId) {
            await prisma.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }
    }

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

