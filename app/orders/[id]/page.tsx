import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Image from 'next/image'

async function getOrder(id: string, userId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  colors: {
                    include: {
                      variants: true,
                    },
                  },
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

    if (!order || order.userId !== userId) {
      return null
    }

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const order = await getOrder(params.id, session.user.id)

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Order not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {searchParams.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Payment successful! Your order has been confirmed.
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8">Order Confirmation</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="text-lg font-semibold">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold">{order.status}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Order Date</p>
          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Shipping Address</p>
          <p>{order.shippingAddress}</p>
          <p>Phone: {order.phone}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Payment</p>
          <p>
            {order.paymentMethod} - {order.paymentStatus}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {(() => {
                  // Try to get image from variant color first, then product
                  const imageUrl = item.variant?.color?.images?.[0] || 
                                  item.product.image || 
                                  item.product.colors?.[0]?.images?.[0]
                  return imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )
                })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <div className="space-y-1 mb-2">
                  {item.colorName && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Color:</span> {item.colorName}
                    </p>
                  )}
                  {item.bandSize && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Band Size:</span> {item.bandSize}
                    </p>
                  )}
                  {item.cupSize && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cup Size:</span> {item.cupSize}
                    </p>
                  )}
                  {!item.bandSize && !item.cupSize && item.variant?.size && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Size:</span> {item.variant.size}
                    </p>
                  )}
                </div>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-lg font-bold text-primary-600">
                  Rs {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-6 pt-6">
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>Rs {order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

