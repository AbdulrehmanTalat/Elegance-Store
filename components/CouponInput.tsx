'use client'

import { useState } from 'react'

interface CouponInputProps {
  onCouponApplied: (coupon: any, discount: any) => void
  onCouponRemoved: () => void
  cartTotal: number
  cartItems: Array<{ productId: string; category: string }>
}

export default function CouponInput({
  onCouponApplied,
  onCouponRemoved,
  cartTotal,
  cartItems,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState<any>(null)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          cartTotal,
          cartItems,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setError(data.error || 'Invalid coupon code')
        setAppliedCoupon(null)
        setDiscount(null)
        return
      }

      setAppliedCoupon(data.coupon)
      setDiscount(data.discount)
      setError('')
      onCouponApplied(data.coupon, data.discount)
    } catch (err) {
      console.error('Error applying coupon:', err)
      setError('Failed to apply coupon. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setDiscount(null)
    setError('')
    onCouponRemoved()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApplyCoupon()
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Have a coupon?</h3>

      {!appliedCoupon ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase disabled:bg-gray-100"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-green-800 font-bold text-lg">{appliedCoupon.code}</span>
                  <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                    Applied
                  </span>
                </div>
                {appliedCoupon.description && (
                  <p className="text-green-700 text-sm mt-1">{appliedCoupon.description}</p>
                )}
                <p className="text-green-800 font-semibold mt-1">
                  You save: ${discount.amount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
