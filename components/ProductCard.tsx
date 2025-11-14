'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    basePrice?: number | null
    image?: string | null
    colors?: Array<{
      images: string[]
      variants?: Array<{
        price: number
        stock: number
      }>
    }>
    stock?: number // Legacy field, may not exist
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  // Calculate price display
  const hasVariants = product.colors && product.colors.length > 0
  const hasVariantsWithData = hasVariants && (product.colors?.some(color => 
    color.variants && color.variants.length > 0
  ) ?? false)
  
  let displayPrice: number | null = null
  let priceText = ''
  let totalStock = 0

  if (hasVariantsWithData && product.colors) {
    // Get all variant prices
    const variantPrices = product.colors
      .flatMap(color => color.variants || [])
      .map(v => v.price)
      .filter(price => price > 0)
    
    if (variantPrices.length > 0) {
      const minPrice = Math.min(...variantPrices)
      const maxPrice = Math.max(...variantPrices)
      displayPrice = minPrice
      priceText = minPrice === maxPrice 
        ? `Rs ${minPrice.toFixed(2)}`
        : `From Rs ${minPrice.toFixed(2)}`
    }
    
    // Calculate total stock from variants
    totalStock = product.colors
      .flatMap(color => color.variants || [])
      .reduce((sum, v) => sum + (v.stock || 0), 0)
  } else {
    // Use basePrice for non-variant products
    displayPrice = product.basePrice || null
    priceText = displayPrice ? `Rs ${displayPrice.toFixed(2)}` : 'Price on request'
    totalStock = (product as any).stock || 0
  }

  // Get display image (prioritize variant images, then product image)
  let displayImage: string | null = null
  
  if (hasVariants && product.colors) {
    // Try to find first color with images
    for (const color of product.colors) {
      if (color.images && color.images.length > 0) {
        displayImage = color.images[0]
        break
      }
    }
  }
  
  // Fall back to product image if no variant images found
  if (!displayImage) {
    displayImage = product.image || null
  }

  const handleAddToCart = () => {
    // For products with variants, redirect to product page
    // For products without variants, add directly to cart
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
      })
    }
  }

  const isOutOfStock = hasVariantsWithData ? totalStock === 0 : totalStock === 0

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-64 w-full bg-gray-200">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary-600 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-600">
            {priceText}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ShoppingCart size={20} />
            <span>
              {hasVariantsWithData 
                ? 'View Options' 
                : isOutOfStock 
                  ? 'Out of Stock' 
                  : 'Add to Cart'}
            </span>
          </button>
        </div>
        {!hasVariants && totalStock < 10 && totalStock > 0 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {totalStock} left in stock!
          </p>
        )}
      </div>
    </div>
  )
}

