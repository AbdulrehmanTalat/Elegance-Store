'use client'

import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotal = useCartStore((state) => state.getTotal)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition inline-block"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4"
            >
              <div className="relative w-full md:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-4">
                  Rs {item.price.toFixed(2)}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  Rs {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs {getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>Rs {getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            {session ? (
              <Link
                href="/checkout"
                className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-lg hover:bg-primary-700 transition"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2">
                  Please sign in to checkout
                </p>
                <Link
                  href="/auth/signin?callbackUrl=/checkout"
                  className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                >
                  Sign In to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

