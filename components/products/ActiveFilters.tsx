'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

export default function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = []
  
  // Search
  const search = searchParams.get('search')
  if (search) {
    filters.push({ key: 'search', label: `Search: "${search}"`, value: search })
  }

  // Category
  const category = searchParams.get('category')
  if (category) {
    const categoryLabels: Record<string, string> = {
      UNDERGARMENTS: 'Undergarments',
      JEWELRY: 'Jewelry',
      MAKEUP: 'Makeup',
    }
    filters.push({ key: 'category', label: `Category: ${categoryLabels[category] || category}`, value: category })
  }

  // Price range
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  if (minPrice || maxPrice) {
    const label = `Price: Rs ${minPrice || '0'} - Rs ${maxPrice || '∞'}`
    filters.push({ key: 'price', label, value: 'price' })
  }

  // Rating
  const minRating = searchParams.get('minRating')
  if (minRating) {
    filters.push({ key: 'minRating', label: `${minRating}+ Stars`, value: minRating })
  }

  // In Stock
  const inStock = searchParams.get('inStock')
  if (inStock === 'true') {
    filters.push({ key: 'inStock', label: 'In Stock', value: 'true' })
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (key === 'price') {
      params.delete('minPrice')
      params.delete('maxPrice')
    } else {
      params.delete(key)
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => {
    router.push('/products')
  }

  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
      
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => removeFilter(filter.key)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors group"
        >
          <span>{filter.label}</span>
          <X size={14} className="group-hover:scale-110 transition-transform" />
        </button>
      ))}

      {filters.length > 1 && (
        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-pink-600 transition-colors underline"
        >
          Clear All
        </button>
      )}
    </div>
  )
}
