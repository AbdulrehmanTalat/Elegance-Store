'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Star, ShoppingCart, CheckCircle, XCircle, Package } from 'lucide-react'
import { useComparisonStore } from '@/store/comparison-store'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'

interface Product {
  id: string
  name: string
  description: string
  basePrice: number | null
  image: string | null
  category: string
  avgRating: number | null
  reviewCount: number
  colors: Array<{
    name: string
    images: string[]
    variants?: Array<{
      id: string
      price: number
      stock: number
      size?: string | null
      bandSize?: string | null
      cupSize?: string | null
    }>
  }>
}

export default function ProductComparison() {
  const { productIds, removeProduct, clearAll } = useComparisonStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const { showSuccess } = useToast()

  useEffect(() => {
    if (productIds.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [productIds])

  const fetchProducts = async () => {
    try {
      const promises = productIds.map(id =>
        fetch(`/api/products/${id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setProducts(results)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    const price = product.basePrice || product.colors?.[0]?.variants?.[0]?.price || 0
    const image = product.image || product.colors?.[0]?.images?.[0] || ''
    
    addItem({
      id: product.id,
      name: product.name,
      price,
      image,
      quantity: 1,
    })
    showSuccess(`${product.name} added to cart!`)
  }

  const getProductStock = (product: Product) => {
    if (product.colors && product.colors.length > 0) {
      const totalStock = product.colors
        .flatMap(c => c.variants || [])
        .reduce((sum, v) => sum + v.stock, 0)
      return totalStock
    }
    return 0
  }

  const getProductPrice = (product: Product) => {
    if (product.basePrice) return product.basePrice
    if (product.colors?.[0]?.variants?.[0]?.price) {
      return product.colors[0].variants[0].price
    }
    return 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products to Compare</h2>
        <p className="text-gray-600 mb-6">Add products from the shop to compare them</p>
        <Link
          href="/products"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Compare Products ({products.length})
        </h1>
        <button
          onClick={clearAll}
          className="text-red-600 hover:text-red-700 font-semibold transition"
        >
          Clear All
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(250px, 1fr))` }}>
            {/* Product Cards */}
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Image */}
                <div className="relative h-64 bg-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <Link href={`/products/${product.id}`} className="text-lg font-bold hover:text-primary-600 transition">
                      {product.name}
                    </Link>
                  </div>

                  {/* Price */}
                  <div className="text-3xl font-bold text-primary-600">
                    Rs {getProductPrice(product).toLocaleString()}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-yellow-400">
                      <Star size={16} fill="currentColor" />
                      <span className="ml-1 text-gray-700 font-medium">
                        {product.avgRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    {getProductStock(product) > 0 ? (
                      <>
                        <CheckCircle size={18} className="text-green-600" />
                        <span className="text-green-600 font-semibold">In Stock</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="text-red-600" />
                        <span className="text-red-600 font-semibold">Out of Stock</span>
                      </>
                    )}
                  </div>

                  {/* Category */}
                  <div className="text-sm text-gray-600">
                    <strong>Category:</strong> {product.category.replace('_', ' ')}
                  </div>

                  {/* Colors */}
                  <div>
                    <strong className="text-sm text-gray-700">Colors:</strong>
                    <div className="flex gap-1 mt-2">
                      {product.colors?.slice(0, 5).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border-2 border-gray-200 overflow-hidden"
                          title={color.name}
                        >
                          {color.images[0] && (
                            <Image
                              src={color.images[0]}
                              alt={color.name}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {(product.colors?.length || 0) > 5 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{product.colors!.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {product.description}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={getProductStock(product) === 0}
                      className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      <ShoppingCart size={18} />
                      {getProductStock(product) === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-center block hover:border-primary-600 hover:text-primary-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
