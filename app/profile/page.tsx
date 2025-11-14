'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { RotateCcw } from 'lucide-react'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items?: Array<{
    productId: string
    quantity: number
    product: {
      name: string
      image: string
      price: number
    }
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (orderId: string) => {
    setReordering(orderId)
    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to reorder')
        return
      }

      // Add items to cart
      for (const item of result.items) {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
          })
        }
      }

      // Navigate to cart
      router.push('/cart')
    } catch (error) {
      console.error('Error reordering:', error)
      alert('An error occurred while reordering')
    } finally {
      setReordering(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {session?.user?.name || 'Not set'}
          </p>
          <p>
            <strong>Email:</strong> {session?.user?.email}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 hover:text-primary-600"
                  >
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      Rs {order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleReorder(order.id)}
                    disabled={reordering === order.id}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    {reordering === order.id ? 'Adding to Cart...' : 'Reorder'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  )
}

