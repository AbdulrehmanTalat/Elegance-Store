'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Suggestion {
  id: string
  name: string
  price: number
  image: string | null
  category: string
}

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions(query)
      } else {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch suggestions', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder="Search for products..."
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none text-sm"
        />
        <Search 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" 
          size={18} 
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="max-h-[300px] overflow-y-auto">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Search size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-primary-600 font-semibold">
                        Rs {product.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={(e) => handleSearch(e)}
                className="w-full p-3 text-center text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-100"
              >
                View all results for "{query}"
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
