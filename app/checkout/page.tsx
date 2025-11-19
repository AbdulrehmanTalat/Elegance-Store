'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { pakistanProvinces, sortedPakistanCities } from '@/lib/pakistan-data'

const checkoutSchema = z.object({
  streetAddress1: z.string().min(5, 'Street Address 1 must be at least 5 characters'),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, 'Please select a city'),
  state: z.string().min(1, 'Please select a state/province'),
  zipCode: z.string().min(4, 'Zip code must be at least 4 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  paymentMethod: z.enum(['ONLINE', 'COD']),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showError } = useToast()
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(false)

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading...</p>
      </div>
    )
  }

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

    // Build complete shipping address
    const shippingAddress = [
      data.streetAddress1,
      data.streetAddress2,
      data.city,
      data.state,
      data.zipCode,
    ]
      .filter(Boolean)
      .join(', ')

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
          shippingAddress: shippingAddress,
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
        // COD - order created, clear cart and redirect immediately to order confirmation
        clearCart()
        window.location.href = `/orders/${result.orderId}`
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showError('An error occurred. Please try again.')
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
                Street Address 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('streetAddress1')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="House/Flat number, Street name"
              />
              {errors.streetAddress1 && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.streetAddress1.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Street Address 2 (Optional)
              </label>
              <input
                type="text"
                {...register('streetAddress2')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
              {errors.streetAddress2 && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.streetAddress2.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('city')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select a city</option>
                  {sortedPakistanCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('state')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Select a state</option>
                  {pakistanProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Zip/Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('zipCode')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., 54000"
                />
                {errors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="e.g., 03001234567"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
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
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-lg font-semibold text-primary-600 mt-1">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-600">Rs {getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

