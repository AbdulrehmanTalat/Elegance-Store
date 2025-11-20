'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react'
import MetricCard from '@/components/admin/MetricCard'
import SalesChart from '@/components/admin/SalesChart'
import CategoryChart from '@/components/admin/CategoryChart'
import TopProductsTable from '@/components/admin/TopProductsTable'

interface AnalyticsData {
  metrics: {
    totalRevenue: number
    revenueChange: number
    orderCount: number
    orderChange: number
    newCustomers: number
    avgOrderValue: number
  }
  ordersByStatus: {
    total: number
    pending: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  salesTrends: Array<{ date: string; revenue: number; orders: number }>
  revenueByCategory: Array<{ category: string; revenue: number }>
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>
  recentOrders: Array<{
    id: string
    customerName: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || !session) {
      router.push('/auth/signin?callbackUrl=/admin/dashboard')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchAnalytics()
  }, [session, status, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl">Loading analytics...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of your store performance</p>
        </div>
        <Link
          href="/admin"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          Manage Products
        </Link>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {['today', 'week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={data.metrics.totalRevenue}
          change={data.metrics.revenueChange}
          icon={<DollarSign size={24} />}
          format="currency"
        />
        <MetricCard
          title="Orders"
          value={data.metrics.orderCount}
          change={data.metrics.orderChange}
          icon={<ShoppingCart size={24} />}
        />
        <MetricCard
          title="New Customers"
          value={data.metrics.newCustomers}
          icon={<Users size={24} />}
        />
        <MetricCard
          title="Avg Order Value"
          value={data.metrics.avgOrderValue}
          icon={<TrendingUp size={24} />}
          format="currency"
        />
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-8">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{data.ordersByStatus.pending}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">{data.ordersByStatus.confirmed}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-2xl font-bold text-purple-600">{data.ordersByStatus.processing}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Shipped</p>
          <p className="text-2xl font-bold text-indigo-600">{data.ordersByStatus.shipped}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{data.ordersByStatus.delivered}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{data.ordersByStatus.cancelled}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{data.ordersByStatus.total}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8">
        <SalesChart data={data.salesTrends} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CategoryChart data={data.revenueByCategory} />
        <TopProductsTable products={data.topProducts} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Link href="/admin/orders" className="text-primary-600 hover:underline text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-3 text-sm font-medium text-gray-600">Order ID</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Customer</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Amount</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <Link 
                      href={`/admin/orders`}
                      className="text-primary-600 hover:underline font-mono text-sm"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3 font-medium">Rs {order.amount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
