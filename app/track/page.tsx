'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Package, AlertCircle } from 'lucide-react'
import OrderTracker from '@/components/OrderTracker'
import Image from 'next/image'

const trackSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  email: z.string().email('Please enter a valid email address'),
})

type TrackFormData = z.infer<typeof trackSchema>

export default function TrackOrderPage() {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
  })

  const onSubmit = async (data: TrackFormData) => {
    setIsLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch order details')
      }

      setOrder(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Confirmed' },
    PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Processing' },
    SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
  }

  const currentStatus = order 
    ? statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your Order ID and Email Address to see your order status.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  {...register('orderId')}
                  type="text"
                  placeholder="e.g. clx123..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
                {errors.orderId && (
                  <p className="text-red-500 text-sm mt-1">{errors.orderId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="The email used for the order"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={20} />
              )}
              Track Order
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3">
              <AlertCircle size={24} />
              <p>{error}</p>
            </div>
          )}
        </div>

        {order && currentStatus && (
          <div className="space-y-8 animate-fadeIn">
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Status</h2>
                  <p className="text-gray-600">Order #{order.id}</p>
                </div>
                <div className={`px-6 py-3 rounded-full border-2 font-bold inline-block text-center ${currentStatus.color}`}>
                  {currentStatus.label}
                </div>
              </div>

              {/* Progress Timeline */}
              <OrderTracker status={order.status} createdAt={order.createdAt} />
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-6">
                {order.items.map((item: any) => {
                  const imageUrl = item.variant?.color?.images?.[0] || 
                                  item.product?.image || 
                                  item.product?.colors?.[0]?.images?.[0]
                  
                  return (
                    <div key={item.id} className="flex gap-6 pb-6 border-b last:border-0">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product?.name || 'Product Image'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={32} />
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.product?.name || 'Product'}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.colorName && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Color:</span> {item.colorName}
                            </span>
                          )}
                          {item.bandSize && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Band:</span> {item.bandSize}
                            </span>
                          )}
                          {item.cupSize && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Cup:</span> {item.cupSize}
                            </span>
                          )}
                          {!item.bandSize && !item.cupSize && item.variant?.size && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Size:</span> {item.variant.size}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-xl font-bold text-primary-600">
                            Rs {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t-2 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Address</span>
                  <span className="font-medium text-right max-w-[200px] truncate" title={order.shippingAddress}>
                    {order.shippingAddress}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-3 border-t-2">
                  <span>Total</span>
                  <span className="text-primary-600">Rs {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
