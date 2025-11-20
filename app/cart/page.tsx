'use client'

import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, ShieldCheck, Truck } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotal = useCartStore((state) => state.getTotal)

  const total = getTotal()
  const shipping = 0 // Free shipping
  const tax = total * 0.0 // No tax for now
  const grandTotal = total + shipping + tax
  const freeShippingThreshold = 3000
  const progressToFreeShipping = Math.min((total / freeShippingThreshold) * 100, 100)
  const amountNeeded = Math.max(freeShippingThreshold - total, 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingBag size={64} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>

        {/* Free Shipping Progress */}
        {total < freeShippingThreshold && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                🚚 Add <span className="text-green-600">Rs {amountNeeded.toLocaleString()}</span> more for FREE shipping!
              </span>
              <span className="text-sm text-gray-600">{progressToFreeShipping.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="relative w-full md:w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 group">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={40} />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2 hover:text-primary-600 transition">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          Rs {item.price.toLocaleString()}
                        </span>
                        {item.color && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            Color: {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-3 hover:bg-gray-100 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-6 py-3 font-semibold min-w-[60px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-3 hover:bg-gray-100 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Item Total</p>
                        <p className="text-2xl font-bold">
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Benefits Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Truck className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over Rs 3,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <ShieldCheck className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Tag className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="font-semibold">Best Prices</p>
                  <p className="text-xs text-gray-600">Quality guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">Rs {total.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    Shipping
                    {total >= freeShippingThreshold && (
                      <span className="text-xs text-green-600 font-semibold">FREE</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {total >= freeShippingThreshold || shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `Rs ${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-semibold">Rs {tax.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t-2 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">Rs {grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Including all applicable taxes</p>
                </div>
              </div>

              {session ? (
                <Link
                  href="/checkout"
                  className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center px-6 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-3"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3 mb-3">
                  <p className="text-sm text-gray-600 text-center">
                    Please sign in to complete your purchase
                  </p>
                  <Link
                    href="/auth/signin?callbackUrl=/checkout"
                    className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center px-6 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Sign In to Checkout
                  </Link>
                </div>
              )}

              <div className="space-y-2 text-center text-sm text-gray-500">
                <p className="flex items-center justify-center gap-2">
                  <ShieldCheck size={16} className="text-green-600" />
                  Secure Checkout
                </p>
                <p>Your information is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
