'use client'

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

interface CouponListProps {
  coupons: Coupon[]
  onEdit: (coupon: Coupon) => void
  onDelete: (couponId: string) => void
  onToggleActive: (couponId: string, isActive: boolean) => void
}

export default function CouponList({ coupons, onEdit, onDelete, onToggleActive }: CouponListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)

    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">Inactive</span>
    }

    if (now < validFrom) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 text-blue-700">Scheduled</span>
    }

    if (now > validUntil) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-200 text-red-700">Expired</span>
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-200 text-orange-700">Limit Reached</span>
    }

    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-700">Active</span>
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% off`
    }
    return `$${coupon.discountValue.toFixed(2)} off`
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">🎟️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No coupons found</h3>
        <p className="text-gray-500">Create your first coupon to start offering discounts</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Saved
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                    {coupon.description && (
                      <div className="text-sm text-gray-500">{coupon.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDiscount(coupon)}</div>
                  {coupon.minPurchase && (
                    <div className="text-xs text-gray-500">Min: ${coupon.minPurchase.toFixed(2)}</div>
                  )}
                  {coupon.maxDiscount && (
                    <div className="text-xs text-gray-500">Max: ${coupon.maxDiscount.toFixed(2)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                  </div>
                  {coupon.perUserLimit && (
                    <div className="text-xs text-gray-500">{coupon.perUserLimit} per user</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(coupon.validFrom)}</div>
                  <div className="text-sm text-gray-500">to {formatDate(coupon.validUntil)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(coupon)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-green-600">
                    ${coupon.totalDiscountGiven.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onToggleActive(coupon.id, coupon.isActive)}
                      className={`${
                        coupon.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                      }`}
                      title={coupon.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => onDelete(coupon.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
