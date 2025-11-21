'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Filter, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuditLog {
  id: string
  userId: string
  action: string
  entity: string
  entityId: string | null
  details: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    email: string
    name: string | null
    role: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    userId: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/admin/audit-logs')
      return
    }

    const userRole = (session.user as any)?.role
    if (userRole !== 'SUPER_ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    fetchLogs()
  }, [session, status, pagination.page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.action) params.append('action', filters.action)
      if (filters.entity) params.append('entity', filters.entity)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address', 'Details']
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.user.email,
      log.action,
      log.entity,
      log.entityId || '-',
      log.ipAddress || '-',
      JSON.stringify(log.details),
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-gray-600">Track all admin actions and changes</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT">Export</option>
            <option value="IMPORT">Import</option>
          </select>

          <select
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Product">Product</option>
            <option value="Order">Order</option>
            <option value="Coupon">Coupon</option>
            <option value="AdminPermissions">Admin Permissions</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600"
            placeholder="End Date"
          />

          <button
            onClick={() => setFilters({ action: '', entity: '', userId: '', startDate: '', endDate: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-primary-100 text-sm">Total Logs</p>
            <p className="text-3xl font-bold">{pagination.total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Current Page</p>
            <p className="text-3xl font-bold">{pagination.page} / {pagination.pages}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm">Showing</p>
            <p className="text-3xl font-bold">{logs.length} logs</p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{log.user.email}</div>
                      <div className="text-gray-500">{log.user.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.entity}
                    {log.entityId && (
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {log.entityId.slice(0, 8)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details ? (
                      <pre className="text-xs max-w-xs overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                    {log.ipAddress || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
