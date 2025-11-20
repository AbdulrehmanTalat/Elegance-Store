'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }
      
      router.push(`/products?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search 
          size={20} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all glass-white text-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>
      
      {/* Search hint */}
      <p className="text-sm text-gray-500 mt-2 ml-1">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">/</kbd> to focus
      </p>
    </div>
  )
}
