'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Star, ShoppingCart, Check, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    description: string
    basePrice?: number | null
    image?: string | null
    avgRating?: number | null
    reviewCount?: number
    slug?: string
    colors?: Array<{
      name: string
      images: string[]
      variants?: Array<{
        id: string
        size: string | null
        bandSize?: string | null
        cupSize?: string | null
        price: number
        stock: number
      }>
    }>
    stock?: number
  }
}

import { createPortal } from 'react-dom'

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || ''
  )
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState<string>(
    product.image || product.colors?.[0]?.images?.[0] || ''
  )
  const [mounted, setMounted] = useState(false)
  
  const addItem = useCartStore((state) => state.addItem)
  const { showSuccess } = useToast()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColor(product.colors?.[0]?.name || '')
      setSelectedSize('')
      setQuantity(1)
      setActiveImage(product.image || product.colors?.[0]?.images?.[0] || '')
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, product])

  // Update image when color changes
  useEffect(() => {
    if (selectedColor) {
      const colorData = product.colors?.find(c => c.name === selectedColor)
      if (colorData?.images?.[0]) {
        setActiveImage(colorData.images[0])
      }
    }
  }, [selectedColor, product.colors])

  if (!isOpen || !mounted) return null

  const currentColor = product.colors?.find(c => c.name === selectedColor)
  
  // Helper to get display size
  const getVariantSize = (v: any) => v.size || `${v.bandSize || ''}${v.cupSize || ''}`.trim() || 'One Size'

  const currentVariant = currentColor?.variants?.find(v => getVariantSize(v) === selectedSize)
  
  const price = currentVariant?.price || product.basePrice || 0
  const stock = currentVariant?.stock ?? product.stock ?? 0
  const isOutOfStock = stock === 0

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedSize) {
      return // Must select size if variants exist
    }

    addItem({
      id: currentVariant?.id || product.id,
      name: product.name,
      price: price,
      image: activeImage,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    })

    showSuccess('Added to cart')
    onClose()
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-gray-100 transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative">
          <div className="relative w-full h-64 md:h-full min-h-[300px] max-h-[500px]">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
          <div className="flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-yellow-400">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-1 text-gray-700 font-medium">
                    {product.avgRating?.toFixed(1) || 'New'}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-2xl font-bold text-primary-600">
                  Rs {price.toLocaleString()}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Variants */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-6 mb-8">
                  {/* Colors */}
                  <div>
                    <span className="text-sm font-medium text-gray-900 block mb-3">Select Color</span>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`px-4 py-2 rounded-full text-sm border transition-all ${
                            selectedColor === color.name
                              ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  {currentColor && (
                    <div>
                      <span className="text-sm font-medium text-gray-900 block mb-3">Select Size</span>
                      <div className="flex flex-wrap gap-2">
                        {currentColor.variants?.map((variant) => {
                          const sizeLabel = getVariantSize(variant)
                          return (
                            <button
                              key={variant.id}
                              onClick={() => setSelectedSize(sizeLabel)}
                              disabled={variant.stock === 0}
                              className={`min-w-[3rem] h-10 flex items-center justify-center rounded-lg text-sm border transition-all px-3 ${
                                selectedSize === sizeLabel
                                  ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                                  : variant.stock === 0
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice'
                                  : 'border-gray-200 hover:border-primary-600 text-gray-700'
                              }`}
                            >
                              {sizeLabel}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || (!!product.colors?.length && !selectedSize)}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : !!product.colors?.length && !selectedSize
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <Link 
                href={`/products/${product.id}`}
                className="w-full py-3 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-2 font-semibold text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-all"
              >
                View Full Details
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
