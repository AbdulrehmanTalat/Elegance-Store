'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecentlyViewed, type RecentlyViewedProduct } from '@/lib/recentlyViewed'
import { Eye, Clock } from 'lucide-react'

export default function RecentlyViewed() {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setProducts(getRecentlyViewed())
    setIsLoading(false)
  }, [])

  if (isLoading || products.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="text-primary-600" size={32} />
          <div>
            <h2 className="text-3xl font-bold">
              <span className="text-gradient">Recently Viewed</span>
            </h2>
            <p className="text-gray-600">Continue shopping where you left off</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gray-200">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Eye size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition">
                  {product.name}
                </h3>
                {product.basePrice && (
                  <p className="text-primary-600 font-bold">
                    Rs {product.basePrice.toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
