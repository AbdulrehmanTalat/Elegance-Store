'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const couponFormSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minPurchase: z.number().nonnegative('Minimum purchase cannot be negative').optional().nullable(),
  maxDiscount: z.number().positive('Max discount must be positive').optional().nullable(),
  usageLimit: z.number().int().positive('Usage limit must be a positive integer').optional().nullable(),
  perUserLimit: z.number().int().positive('Per user limit must be a positive integer').optional().nullable(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean(),
  categories: z.array(z.string()),
  productIds: z.array(z.string()),
}).refine(data => {
  if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
    return false
  }
  return true
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue'],
})

type CouponFormData = z.infer<typeof couponFormSchema>

interface CouponFormProps {
  coupon?: any
  onSuccess: () => void
  onCancel: () => void
}

const CATEGORIES = ['UNDERGARMENTS', 'JEWELRY', 'MAKEUP']

export default function CouponForm({ coupon, onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(coupon?.categories || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: coupon ? {
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      isActive: coupon.isActive,
      categories: coupon.categories || [],
      productIds: coupon.productIds || [],
    } : {
      discountType: 'PERCENTAGE',
      isActive: true,
      categories: [],
      productIds: [],
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  })

  const discountType = watch('discountType')

  const generateCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setValue('code', code)
  }

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(newCategories)
    setValue('categories', newCategories)
  }

  const onSubmit = async (data: CouponFormData) => {
    try {
      setLoading(true)

      // Clean up nullable fields
      const cleanData = {
        ...data,
        minPurchase: data.minPurchase || null,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit || null,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: new Date(data.validUntil).toISOString(),
      }

      const url = coupon ? `/api/coupons/${coupon.id}` : '/api/coupons'
      const method = coupon ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save coupon')
      }

      alert(coupon ? 'Coupon updated successfully!' : 'Coupon created successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Error saving coupon:', error)
      alert(error.message || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Coupon Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Coupon Code *
        </label>
        <div className="flex gap-2">
          <input
            {...register('code')}
            type="text"
            placeholder="SAVE20"
            disabled={!!coupon}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase disabled:bg-gray-100"
          />
          {!coupon && (
            <button
              type="button"
              onClick={generateCode}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Generate
            </button>
          )}
        </div>
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
        <p className="mt-1 text-sm text-gray-500">Only uppercase letters, numbers, hyphens, and underscores</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="20% off on all products"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Discount Type and Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Type *
          </label>
          <select
            {...register('discountType')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Value *
          </label>
          <input
            {...register('discountValue', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder={discountType === 'PERCENTAGE' ? '20' : '10.00'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>}
        </div>
      </div>

      {/* Min Purchase and Max Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Purchase ($)
          </label>
          <input
            {...register('minPurchase', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.minPurchase && <p className="mt-1 text-sm text-red-600">{errors.minPurchase.message}</p>}
        </div>

        {discountType === 'PERCENTAGE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Discount ($)
            </label>
            <input
              {...register('maxDiscount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Optional cap"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {errors.maxDiscount && <p className="mt-1 text-sm text-red-600">{errors.maxDiscount.message}</p>}
          </div>
        )}
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Usage Limit
          </label>
          <input
            {...register('usageLimit', { valueAsNumber: true })}
            type="number"
            placeholder="Unlimited"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.usageLimit && <p className="mt-1 text-sm text-red-600">{errors.usageLimit.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Per User Limit
          </label>
          <input
            {...register('perUserLimit', { valueAsNumber: true })}
            type="number"
            placeholder="Unlimited"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.perUserLimit && <p className="mt-1 text-sm text-red-600">{errors.perUserLimit.message}</p>}
        </div>
      </div>

      {/* Validity Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid From *
          </label>
          <input
            {...register('validFrom')}
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valid Until *
          </label>
          <input
            {...register('validUntil')}
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>}
        </div>
      </div>

      {/* Category Restrictions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Restrictions
        </label>
        <div className="flex gap-4">
          {CATEGORIES.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm text-gray-500">Leave empty to apply to all categories</p>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          {...register('isActive')}
          type="checkbox"
          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Active (coupon can be used)
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
