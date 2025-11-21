'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowRight, Scale } from 'lucide-react'
import { useComparisonStore } from '@/store/comparison-store'

interface Product {
  id: string
  name: string
  image: string | null
}

export default function ComparisonBar() {
  const { productIds, removeProduct, clearAll } = useComparisonStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && productIds.length > 0) {
      setIsVisible(true)
      fetchProducts()
    } else if (mounted) {
      setIsVisible(false)
    }
  }, [productIds, mounted])

  const fetchProducts = async () => {
    try {
      const promises = productIds.map(id =>
        fetch(`/api/products/${id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setProducts(results)
    } catch (error) {
      console.error('Failed to fetch comparison products:', error)
    }
  }

  if (!mounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300">
      <div className="bg-white border-t-2 border-primary-600 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-purple-600">
          <div className="flex items-center gap-3 text-white">
            <Scale size={20} />
            <span className="font-semibold">
              Compare Products ({productIds.length}/4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1.5 rounded transition"
            >
              {isMinimized ? '▲' : '▼'}
            </button>
            <button
              onClick={clearAll}
              className="text-white hover:bg-white/20 p-1.5 rounded transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Products */}
        {!isMinimized && (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4 overflow-x-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="relative flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden group"
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {product.name}
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 4 - productIds.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs"
                >
                  Add More
                </div>
              ))}
            </div>

            <Link
              href="/compare"
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
            >
              Compare Now
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
