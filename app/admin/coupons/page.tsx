'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CouponList from '@/components/admin/CouponList'
import CouponForm from '@/components/admin/CouponForm'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  perUserLimit: number | null
  validFrom: string
  validUntil: string
  isActive: boolean
  categories: string[]
  productIds: string[]
  totalDiscountGiven: number
  createdAt: string
}

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchCoupons()
  }, [searchTerm, filterActive])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterActive !== 'all') params.append('isActive', filterActive === 'active' ? 'true' : 'false')

      const response = await fetch(`/api/coupons?${params}`)
      if (!response.ok) throw new Error('Failed to fetch coupons')
      
      const data = await response.json()
      setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
      alert('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setShowForm(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setShowForm(true)
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete coupon')
      
      const data = await response.json()
      alert(data.message)
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const handleToggleActive = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update coupon')
      
      fetchCoupons()
    } catch (error) {
      console.error('Error updating coupon:', error)
      alert('Failed to update coupon status')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCoupon(null)
    fetchCoupons()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCoupon(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="mt-2 text-gray-600">Create and manage discount coupons for your store</p>
        </div>

        {!showForm ? (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 flex gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 flex-1 sm:flex-initial"
                />
                
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                onClick={handleCreate}
                className="w-full sm:w-auto bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Create New Coupon
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <p className="mt-2 text-gray-600">Loading coupons...</p>
              </div>
            ) : (
              <CouponList
                coupons={coupons}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <CouponForm
              coupon={editingCoupon}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
