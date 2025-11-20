'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  ChevronDown
} from 'lucide-react'

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

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

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((order) => {
        return (
          order.id.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.items.some((item) => item.product.name.toLowerCase().includes(query)) ||
          order.shippingAddress.toLowerCase().includes(query)
        )
      })
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

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

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    processing: orders.filter((o) => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    revenue: orders
      .filter((o) => o.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }

  const statusConfig = {
    ALL: { label: 'All Orders', count: stats.total, color: 'text-gray-600' },
    PENDING: { label: 'Pending', count: stats.pending, color: 'text-yellow-600' },
    CONFIRMED: { label: 'Confirmed', count: orders.filter((o) => o.status === 'CONFIRMED').length, color: 'text-blue-600' },
    PROCESSING: { label: 'Processing', count: orders.filter((o) => o.status === 'PROCESSING').length, color: 'text-purple-600' },
    SHIPPED: { label: 'Shipped', count: stats.shipped, color: 'text-indigo-600' },
    DELIVERED: { label: 'Delivered', count: stats.delivered, color: 'text-green-600' },
    CANCELLED: { label: 'Cancelled', count: stats.cancelled, color: 'text-red-600' },
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800' },
      PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-800' },
      SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' },
    }
    const style = config[status] || config.PENDING
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
        {status}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4 inline-flex"
          >
            <ArrowLeft size={20} />
            Back to Admin Panel
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Orders Management</h1>
              <p className="text-gray-600">{stats.total} total orders | Rs {stats.revenue.toLocaleString()} revenue</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition inline-flex items-center gap-2"
            >
              <Package size={20} />
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-600" size={24} />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="text-purple-600" size={24} />
              <span className="text-2xl font-bold">{stats.processing}</span>
            </div>
            <p className="text-gray-600 text-sm">Processing</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Truck className="text-indigo-600" size={24} />
              <span className="text-2xl font-bold">{stats.shipped}</span>
            </div>
            <p className="text-gray-600 text-sm">Shipped</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-2xl font-bold">{stats.delivered}</span>
            </div>
            <p className="text-gray-600 text-sm">Delivered</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order ID, email, phone, product, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${
                  statusFilter === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.label} ({config.count})
              </button>
            ))}
          </div>

          {searchQuery && (
            <p className="text-sm text-gray-600 mt-4">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          )}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id
            const paymentStatusDisplay = order.status === 'CANCELLED' ? 'CANCELLED' : order.paymentStatus

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">#{order.id.slice(0, 12)}...</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={16} />
                          {order.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={16} />
                          {order.paymentMethod} - {paymentStatusDisplay}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary-600">
                          Rs {order.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{order.items.length} items</p>
                      </div>
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ChevronDown
                          size={24}
                          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Update Status
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="flex-1 max-w-xs border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          {updatingOrderId === order.id && (
                            <span className="text-sm text-primary-600 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                              Updating & sending email...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin size={18} className="text-primary-600" />
                            Shipping Address
                          </h4>
                          <p className="text-gray-700 mb-2">{order.shippingAddress}</p>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 text-gray-600">
                              <Phone size={14} />
                              {order.phone}
                            </p>
                            <p className="flex items-center gap-2 text-gray-600">
                              <Mail size={14} />
                              {order.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-4">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => {
                            const displayImage =
                              item.variant?.color?.images?.[0] || item.product.image

                            return (
                              <div
                                key={item.id}
                                className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                              >
                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  {displayImage ? (
                                    <Image
                                      src={displayImage}
                                      alt={item.product.name}
                                      width={80}
                                      height={80}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package size={24} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold mb-2">{item.product.name}</h5>
                                  <div className="flex flex-wrap gap-2 text-sm mb-2">
                                    {item.colorName && (
                                      <span className="bg-white px-2 py-1 rounded text-gray-700">
                                        Color: {item.colorName}
                                      </span>
                                    )}
                                    {item.bandSize && (
                                      <span className="bg-white px-2 py-1 rounded text-gray-700">
                                        Band: {item.bandSize}
                                      </span>
                                    )}
                                    {item.cupSize && (
                                      <span className="bg-white px-2 py-1 rounded text-gray-700">
                                        Cup: {item.cupSize}
                                      </span>
                                    )}
                                    {!item.bandSize && !item.cupSize && item.variant?.size && (
                                      <span className="bg-white px-2 py-1 rounded text-gray-700">
                                        Size: {item.variant.size}
                                      </span>
                                    )}
                                    <span className="bg-white px-2 py-1 rounded text-gray-700">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                  <p className="text-lg font-bold text-primary-600">
                                    Rs {(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Orders will appear here once customers start placing orders'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
