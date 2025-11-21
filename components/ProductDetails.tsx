'use client'

import { useState } from 'react'
import ProductVariantSelector from './ProductVariantSelector'
import ProductImageGallery from './ProductImageGallery'
import ProductActions from './ProductActions'

interface Color {
  id: string
  name: string
  images: string[]
}

interface Variant {
  id: string
  colorId: string
  colorName: string
  bandSize?: string | null
  cupSize?: string | null
  size?: string | null
  price: number
  stock: number
}

interface ProductDetailsProps {
  productId: string
  productName: string
  description: string
  category: string
  basePrice?: number | null
  image?: string | null
  hasVariants: boolean
  colors: Color[]
  variants: Variant[]
  product?: any // For non-variant products
}

export default function ProductDetails({
  productId,
  productName,
  description,
  category,
  basePrice,
  image,
  hasVariants,
  colors,
  variants,
  product,
}: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(colors[0] || null)

  const galleryImages = hasVariants && selectedColor
    ? selectedColor.images
    : image
    ? [image]
    : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ProductImageGallery images={galleryImages} productName={productName} />
      <div>
        <h1 className="text-4xl font-bold mb-4">{productName}</h1>
        {basePrice && !hasVariants && (
          <p className="text-3xl font-bold text-primary-600 mb-6">
            Rs {basePrice.toFixed(2)}
          </p>
        )}
        {hasVariants && (
          <p className="text-lg text-gray-600 mb-2">
            Prices vary by size - select options below
          </p>
        )}
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-line">{description}</p>
        </div>

        {/* Stock Indicator & Delivery */}
        <div className="mb-6 space-y-3">
          {/* Stock Status */}
          {!hasVariants && product && (
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  {product.stock < 10 ? (
                    <div className="flex items-center gap-2 text-orange-600 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Only {product.stock} left in stock!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>In Stock</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
          )}

          {/* Free Shipping Badge */}
          <div className="flex items-center gap-2 text-primary-600 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Free Shipping - Nationwide</span>
          </div>

          {/* Estimated Delivery */}
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">
              <strong>Estimated Delivery:</strong> 3-5 business days
            </span>

          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Category:</strong> {category.replace('_', ' ').toLowerCase()}
          </p>
        </div>
        {hasVariants ? (
          <ProductVariantSelector
            productId={productId}
            productName={productName}
            productCategory={category}
            colors={colors}
            variants={variants}
            basePrice={basePrice}
            onColorChange={setSelectedColor}
          />
        ) : (
          <ProductActions product={product} />
        )}
      </div>
    </div>
  )
}

