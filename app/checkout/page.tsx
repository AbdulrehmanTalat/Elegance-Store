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
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Check, 
  Truck, 
  ShieldCheck,
  Banknote,
  Lock
} from 'lucide-react'

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
  const [currentStep, setCurrentStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'ONLINE',
    },
  })

  const paymentMethod = watch('paymentMethod')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to proceed with your purchase.</p>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
      return
    }

    setLoading(true)

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
            productId: item.productId || item.id.split('-')[0],
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
          shippingAddress: shippingAddress,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
        }),
      })

      const result = await response.json()

      if (data.paymentMethod === 'ONLINE') {
        if (result.paymentUrl) {
          // Clear cart before redirect (online payment handles cart clearing on success callback)
          clearCart()
          window.location.href = result.paymentUrl
        }
      } else {
        // For COD, navigate first then clear cart to avoid empty cart flash
        window.location.href = `/orders/${result.orderId}?new=true`
        // Cart will be cleared on the order page or after navigation
        setTimeout(() => clearCart(), 100)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      showError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingBag size={64} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  const total = getTotal()
  const shipping = 0
  const tax = 0
  const grandTotal = total + shipping + tax

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: Check },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shipping Information Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <MapPin className="text-primary-600" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Shipping Information</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('streetAddress1')}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="House/Flat number, Street name"
                    />
                    {errors.streetAddress1 && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        ⚠️ {errors.streetAddress1.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 2 <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      {...register('streetAddress2')}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      placeholder="Apartment, suite, unit, building..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('city')}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      >
                        <option value="">Select city</option>
                        {sortedPakistanCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-2">⚠️ {errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('state')}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      >
                        <option value="">Select province</option>
                        {pakistanProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-2">⚠️ {errors.state.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('zipCode')}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="e.g., 54000"
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm mt-2">⚠️ {errors.zipCode.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="03001234567"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-2">⚠️ {errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <CreditCard className="text-primary-600" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Online Payment */}
                  <label
                    className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'ONLINE'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="ONLINE"
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-3">
                      <CreditCard
                        className={paymentMethod === 'ONLINE' ? 'text-primary-600' : 'text-gray-400'}
                        size={32}
                      />
                      {paymentMethod === 'ONLINE' && (
                        <div className="bg-primary-600 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">Online Payment</h3>
                    <p className="text-sm text-gray-600">Pay securely with credit/debit card</p>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'COD'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value="COD"
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-3">
                      <Banknote
                        className={paymentMethod === 'COD' ? 'text-primary-600' : 'text-gray-400'}
                        size={32}
                      />
                      {paymentMethod === 'COD' && (
                        <div className="bg-primary-600 text-white rounded-full p-1">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-5 rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={24} />
                    Complete Purchase - Rs {grandTotal.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">
                        {item.name}
                      </p>
                      <p className="text-lg font-bold text-primary-600 mt-1">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck size={16} /> Shipping
                  </span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">Rs {tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold pt-3 border-t-2">
                  <span>Total</span>
                  <span className="text-primary-600">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="text-green-600" size={20} />
                  <span>Secure checkout protected</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="text-blue-600" size={20} />
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="text-purple-600" size={20} />
                  <span>7-day return guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
