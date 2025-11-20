'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ToastProvider'
import { useState, useEffect } from 'react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    basePrice?: number | null
    image?: string | null
    avgRating?: number | null
    reviewCount?: number
    colors?: Array<{
      images: string[]
      variants?: Array<{
        price: number
        stock: number
      }>
    }>
    stock?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isHovered, setIsHovered] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { data: session } = useSession()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/wishlist/check?productId=${product.id}`)
        .then(res => res.json())
        .then(data => setIsInWishlist(data.isInWishlist))
        .catch(console.error)
    }
  }, [session, product.id])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      window.location.href = `/auth/signin?callbackUrl=/products/${product.id}`
      return
    }

    try {
      if (isInWishlist) {
        const res = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setIsInWishlist(false)
          showSuccess('Removed from wishlist')
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })
        if (res.ok) {
          setIsInWishlist(true)
          showSuccess('Added to wishlist')
        }
      }
    } catch (error) {
      showError('Failed to update wishlist')
    }
  }

  // Calculate price display
  const hasVariants = product.colors && product.colors.length > 0
  const hasVariantsWithData = hasVariants && (product.colors?.some(color => 
    color.variants && color.variants.length > 0
  ) ?? false)
  
  let displayPrice: number | null = null
  let priceText = ''
  let totalStock = 0

  if (hasVariantsWithData && product.colors) {
    const colors = product.colors
    const variantPrices = colors
      .flatMap(color => color.variants || [])
      .map(v => v.price)
      .filter(price => price > 0)
    
    if (variantPrices.length > 0) {
      const minPrice = Math.min(...variantPrices)
      const maxPrice = Math.max(...variantPrices)
      displayPrice = minPrice
      priceText = minPrice === maxPrice 
        ? `Rs ${minPrice.toLocaleString()}`
        : `From Rs ${minPrice.toLocaleString()}`
    }
    
    totalStock = colors
      .flatMap(color => color.variants || [])
      .reduce((sum, v) => sum + (v.stock || 0), 0)
  } else {
    displayPrice = product.basePrice || null
    priceText = displayPrice ? `Rs ${displayPrice.toLocaleString()}` : 'Price on request'
    totalStock = (product as any).stock || 0
  }

  // Get display images (primary and hover)
  let displayImage: string | null = null
  let hoverImage: string | null = null
  
  if (hasVariants && product.colors) {
    for (const color of product.colors) {
      if (color.images && color.images.length > 0) {
        if (!displayImage) displayImage = color.images[0]
        if (color.images.length > 1 && !hoverImage) hoverImage = color.images[1]
        if (displayImage && hoverImage) break
      }
    }
  }
  
  if (!displayImage) {
    displayImage = product.image || null
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (hasVariantsWithData) {
      window.location.href = `/products/${product.id}`
      return
    }

    if (displayPrice) {
      addItem({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: displayImage || '',
        quantity: 1,
        productId: product.id,
        category: (product as any).category,
      })
    }
  }

  const isOutOfStock = hasVariantsWithData ? totalStock === 0 : totalStock === 0
  const isLowStock = !isOutOfStock && totalStock < 10 && totalStock > 0

  return (
    <div 
      className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        {/* Image Container */}
        <div className="relative h-80 w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 ${
                  isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
                }`}
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} - alternate view`}
                  fill
                  className={`object-cover transition-all duration-500 ${
                    isHovered ? 'opacity-100 scale-110' : 'opacity-0'
                  }`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye size={48} className="opacity-30" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOutOfStock && (
              <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Out of Stock
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Only {totalStock} Left!
              </span>
            )}

          </div>

          {/* Wishlist Button */}
          <button 
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:scale-110"
            onClick={toggleWishlist}
          >
            <Heart 
              size={20} 
              className={`transition ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'}`} 
            />
          </button>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={20} />
              Quick View
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold mb-2 hover:text-primary-600 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>

        {/* Rating */}
        {product.avgRating && product.avgRating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= (product.avgRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex justify-between items-center mt-4">
          <div>

            <span className="text-2xl font-bold text-primary-600">
              {priceText}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={18} />
            <span className="font-medium">
              {hasVariantsWithData 
                ? 'Options' 
                : isOutOfStock 
                  ? 'Sold Out' 
                  : 'Add'}
            </span>
          </button>
        </div>

        {/* Color Swatches Preview */}
        {hasVariants && product.colors && product.colors.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Colors:</span>
              <div className="flex gap-1.5">
                {product.colors.slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border-2 border-gray-200 overflow-hidden hover:border-primary-500 transition cursor-pointer"
                    title={color.images?.[0] ? 'View color' : 'Color option'}
                  >
                    {color.images?.[0] && (
                      <Image
                        src={color.images[0]}
                        alt="Color swatch"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
                {product.colors.length > 5 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{product.colors.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
