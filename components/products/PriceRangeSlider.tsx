'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PriceRangeSliderProps {
  min: number
  max: number
}

export default function PriceRangeSlider({ min, max }: PriceRangeSliderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [minPrice, setMinPrice] = useState(parseInt(searchParams.get('minPrice') || min.toString()))
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || max.toString()))

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (minPrice > min) {
      params.set('minPrice', minPrice.toString())
    } else {
      params.delete('minPrice')
    }
    
    if (maxPrice < max) {
      params.set('maxPrice', maxPrice.toString())
    } else {
      params.delete('maxPrice')
    }
    
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">Rs {minPrice.toLocaleString()}</span>
        <span className="text-gray-400">-</span>
        <span className="font-semibold text-gray-700">Rs {maxPrice.toLocaleString()}</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
          <input
            type="range"
            min={min}
            max={max}
            step={100}
            value={minPrice}
            onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 100))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
          <input
            type="range"
            min={min}
            max={max}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 100))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
        </div>
      </div>

      <button
        onClick={handleApply}
        className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
      >
        Apply Price Range
      </button>
    </div>
  )
}
