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

