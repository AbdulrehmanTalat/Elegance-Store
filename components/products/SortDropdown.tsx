'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'popular', label: 'Most Popular' },
]

export default function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentSort = searchParams.get('sort') || 'newest'
  const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Newest First'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/products?${params.toString()}`)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-500 transition-all font-medium"
      >
        <span className="text-sm">Sort: {currentLabel}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSort(option.value)}
              className={`w-full px-4 py-2.5 text-left hover:bg-pink-50 transition-colors ${
                currentSort === option.value ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
