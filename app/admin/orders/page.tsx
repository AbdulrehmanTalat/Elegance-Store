'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  totalAmount: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress: string
  phone: string
  email: string
  createdAt: string
  items: OrderItem[]
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Error updating order:', error)
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
      <div className="mb-6">
        <Link href="/admin" className="text-primary-600 hover:underline">
          ← Back to Products
        </Link>
      </div>
      <h1 className="text-4xl font-bold mb-8">Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  Rs {order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.paymentMethod} - {order.paymentStatus}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="font-semibold">Status:</p>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="mt-1 border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="mb-4">
              <p className="font-semibold">Shipping Address:</p>
              <p className="text-gray-600">{order.shippingAddress}</p>
              <p className="text-gray-600">Phone: {order.phone}</p>
              <p className="text-gray-600">Email: {order.email}</p>
            </div>

            <div>
              <p className="font-semibold mb-2">Items:</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-12">No orders found.</p>
        )}
      </div>
    </div>
  )
}

