'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Gem, Palette, Star, Package } from 'lucide-react'
import PriceRangeSlider from './PriceRangeSlider'

interface FilterSidebarProps {
  priceRange: { min: number; max: number }
}

export default function FilterSidebar({ priceRange }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category')
  const currentRating = searchParams.get('minRating')
  const inStock = searchParams.get('inStock') === 'true'

  const categories = [
    { value: 'UNDERGARMENTS', label: 'Undergarments', icon: Heart, color: 'text-pink-600' },
    { value: 'JEWELRY', label: 'Jewelry', icon: Gem, color: 'text-purple-600' },
    { value: 'MAKEUP', label: 'Makeup', icon: Palette, color: 'text-blue-600' },
  ]

  const ratings = [5, 4, 3, 2, 1]

  const toggleCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentCategory === value) {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const setRating = (rating: number) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (currentRating === rating.toString()) {
      params.delete('minRating')
    } else {
      params.set('minRating', rating.toString())
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const toggleStock = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (inStock) {
      params.delete('inStock')
    } else {
      params.set('inStock', 'true')
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="glass-white p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = currentCategory === category.value

            return (
              <button
                key={category.value}
                onClick={() => toggleCategory(category.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <Icon size={20} className={category.color} />
                <span className={`font-medium ${isActive ? 'text-pink-600' : 'text-gray-700'}`}>
                  {category.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 bg-pink-600 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="glass-white p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Price Range</h3>
        <PriceRangeSlider min={priceRange.min} max={priceRange.max} />
      </div>

      {/* Rating Filter */}
      <div className="glass-white p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Minimum Rating</h3>
        <div className="space-y-2">
          {ratings.map((rating) => {
            const isActive = currentRating === rating.toString()

            return (
              <button
                key={rating}
                onClick={() => setRating(rating)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-pink-50 border-2 border-pink-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className={`text-sm ${isActive ? 'text-pink-600 font-semibold' : 'text-gray-600'}`}>
                  {rating}+ Stars
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="glass-white p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Availability</h3>
        <button
          onClick={toggleStock}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            inStock
              ? 'bg-green-50 border-2 border-green-500'
              : 'hover:bg-gray-50 border-2 border-transparent'
          }`}
        >
          <Package size={20} className={inStock ? 'text-green-600' : 'text-gray-400'} />
          <span className={`font-medium ${inStock ? 'text-green-600' : 'text-gray-700'}`}>
            In Stock Only
          </span>
          {inStock && <span className="ml-auto w-2 h-2 bg-green-600 rounded-full" />}
        </button>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  )
}
