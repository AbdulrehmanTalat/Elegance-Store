'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'Address must be at least 10 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  paymentMethod: z.enum(['ONLINE', 'COD']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId || item.id.split('-')[0], // Extract productId from composite id if needed
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name, // Include name for error messages
          })),
          shippingAddress: data.shippingAddress,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
        }),
      })

      const result = await response.json()

      if (data.paymentMethod === 'ONLINE') {
        // Redirect to Stripe checkout
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
        }
      } else {
        // COD - order created, clear cart and redirect
        clearCart()
        router.push(`/orders/${result.orderId}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl mb-4">Please sign in to checkout</p>
        <button
          onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          Sign In
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Shipping Address
              </label>
              <textarea
                {...register('shippingAddress')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows={4}
                placeholder="Enter your complete shipping address"
              />
              {errors.shippingAddress && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.shippingAddress.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-4">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="ONLINE"
                    defaultChecked
                    className="w-4 h-4"
                  />
                  <span>Online Payment (Credit/Debit Card)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('paymentMethod')}
                    value="COD"
                    className="w-4 h-4"
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>Rs {getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

