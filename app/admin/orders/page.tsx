'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface OrderItem {
  id: string
  quantity: number
  price: number
  colorName?: string | null
  bandSize?: string | null
  cupSize?: string | null
  product: {
    id: string
    name: string
    description: string | null
    image: string | null
  }
  variant?: {
    id: string
    size?: string | null
    color: {
      id: string
      name: string
      images: string[]
    }
  } | null
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

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
      setFilteredOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = orders.filter((order) => {
      // Search by order ID
      if (order.id.toLowerCase().includes(query)) return true
      
      // Search by customer email
      if (order.email.toLowerCase().includes(query)) return true
      
      // Search by customer phone
      if (order.phone.includes(query)) return true
      
      // Search by product names in order items
      if (order.items.some(item => 
        item.product.name.toLowerCase().includes(query)
      )) return true
      
      // Search by shipping address
      if (order.shippingAddress.toLowerCase().includes(query)) return true
      
      return false
    })
    
    setFilteredOrders(filtered)
  }, [searchQuery, orders])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchOrders()
        // Small delay to show success state
        setTimeout(() => {
          setUpdatingOrderId(null)
        }, 500)
      } else {
        setUpdatingOrderId(null)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      setUpdatingOrderId(null)
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Orders</h1>
        <div className="flex-1 md:max-w-md md:ml-8">
          <input
            type="text"
            placeholder="Search by order ID, email, phone, product name, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}

      <div className="space-y-6">
        {filteredOrders.map((order) => {
          // Determine payment status display
          const paymentStatusDisplay = order.status === 'CANCELLED' 
            ? 'CANCELLED' 
            : order.paymentStatus
          
          return (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600">
                  {new Date(order.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  Rs {order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {order.paymentMethod} - {paymentStatusDisplay}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold">Status:</p>
                {updatingOrderId === order.id && (
                  <span className="text-sm text-primary-600 flex items-center gap-1">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating & sending email...
                  </span>
                )}
              </div>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                disabled={updatingOrderId === order.id}
                className={`mt-1 border border-gray-300 rounded-lg px-4 py-2 ${
                  updatingOrderId === order.id 
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'cursor-pointer'
                }`}
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
              <p className="font-semibold mb-4">Items:</p>
              <div className="space-y-4">
                {order.items.map((item) => {
                  // Get image from variant color or product
                  let displayImage: string | null = null
                  if (item.variant?.color?.images && item.variant.color.images.length > 0) {
                    displayImage = item.variant.color.images[0]
                  } else if (item.product.image) {
                    displayImage = item.product.image
                  }

                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {displayImage ? (
                          <Image
                            src={displayImage}
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">
                          {item.product.name}
                        </h4>
                        {item.product.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.product.description}
                          </p>
                        )}
                        <div className="space-y-1 mb-2">
                          {item.colorName && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Color:</span> {item.colorName}
                            </p>
                          )}
                          {item.bandSize && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Band Size:</span> {item.bandSize}
                            </p>
                          )}
                          {item.cupSize && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Cup Size:</span> {item.cupSize}
                            </p>
                          )}
                          {!item.bandSize && !item.cupSize && item.variant?.size && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Size:</span> {item.variant.size}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary-600 mt-2">
                          Rs {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            {searchQuery ? 'No orders found matching your search.' : 'No orders found.'}
          </p>
        )}
      </div>
    </div>
  )
}

