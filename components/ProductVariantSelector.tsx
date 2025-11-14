'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import Image from 'next/image'

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

interface ProductVariantSelectorProps {
  productId: string
  productName: string
  colors: Color[]
  variants: Variant[]
  basePrice?: number | null
  onColorChange?: (color: Color) => void
}

export default function ProductVariantSelector({
  productId,
  productName,
  colors,
  variants,
  basePrice,
  onColorChange,
}: ProductVariantSelectorProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [selectedColor, setSelectedColor] = useState<Color | null>(colors[0] || null)
  const [selectedBandSize, setSelectedBandSize] = useState<string>('')
  const [selectedCupSize, setSelectedCupSize] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Determine which sizing system is being used
  const usesBandCupSize = variants.some(v => v.bandSize || v.cupSize)
  const usesRegularSize = variants.some(v => v.size)

  // Get available band sizes for selected color
  const availableBandSizes = usesBandCupSize
    ? Array.from(
        new Set(
          variants
            .filter((v) => v.colorId === selectedColor?.id)
            .map((v) => v.bandSize)
            .filter((size): size is string => Boolean(size))
        )
      ).sort()
    : []

  // Get available cup sizes for selected color and band size
  const availableCupSizes = selectedBandSize && usesBandCupSize
    ? Array.from(
        new Set(
          variants
            .filter(
              (v) =>
                v.colorId === selectedColor?.id && v.bandSize === selectedBandSize
            )
            .map((v) => v.cupSize)
            .filter((size): size is string => Boolean(size))
        )
      ).sort()
    : []

  // Get available regular sizes for selected color
  const availableSizes = usesRegularSize
    ? Array.from(
        new Set(
          variants
            .filter((v) => v.colorId === selectedColor?.id)
            .map((v) => v.size)
            .filter((size): size is string => Boolean(size))
        )
      ).sort()
    : []

  // Get variants for selected color, band, cup size, or regular size
  const availableVariants = variants.filter(
    (v) =>
      v.colorId === selectedColor?.id &&
      (usesBandCupSize
        ? (!selectedBandSize || v.bandSize === selectedBandSize) &&
          (!selectedCupSize || v.cupSize === selectedCupSize)
        : (!selectedSize || v.size === selectedSize))
  )

  // Reset selections when color changes
  useEffect(() => {
    if (selectedColor) {
      setSelectedBandSize('')
      setSelectedCupSize('')
      setSelectedSize('')
      setQuantities({})
    }
  }, [selectedColor])

  // Reset cup size when band size changes
  useEffect(() => {
    setSelectedCupSize('')
    setQuantities({})
  }, [selectedBandSize])

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity < 0) return
    const variant = variants.find((v) => v.id === variantId)
    if (variant && quantity > variant.stock) return

    setQuantities((prev) => ({
      ...prev,
      [variantId]: quantity,
    }))
  }

  const handleAddToCart = () => {
    let added = false
    for (const [variantId, quantity] of Object.entries(quantities)) {
      if (quantity > 0) {
        const variant = variants.find((v) => v.id === variantId)
        if (variant && variant.stock >= quantity) {
          const sizeLabel = usesBandCupSize
            ? `${variant.bandSize || ''} ${variant.cupSize || ''}`.trim()
            : variant.size || ''
          
          addItem({
            id: `${productId}-${variantId}`,
            name: `${productName} - ${variant.colorName} ${sizeLabel}`.trim(),
            price: variant.price,
            image: selectedColor?.images[0] || '',
            quantity,
            variantId: variant.id,
            productId: productId,
          })
          added = true
        }
      }
    }

    if (added) {
      setQuantities({})
      alert('Items added to cart!')
    } else {
      alert('Please select at least one size and quantity')
    }
  }

  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  const hasSelection = totalQuantity > 0

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">
            Color: {selectedColor?.name || 'Select a color'}
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  setSelectedColor(color)
                  onColorChange?.(color)
                }}
                className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition ${
                  selectedColor?.id === color.id
                    ? 'border-black ring-2 ring-primary-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {color.images[0] ? (
                  <Image
                    src={color.images[0]}
                    alt={color.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/64?text=' + color.name
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs bg-gray-200">
                    {color.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Band Size Selection */}
      {availableBandSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">
            Band Size: {selectedBandSize || 'Select band size'}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableBandSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  if (size) {
                    setSelectedBandSize(size)
                  }
                }}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  selectedBandSize === size
                    ? 'border-black bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cup Size Selection with Quantity (for Band/Cup sizing) */}
      {usesBandCupSize && selectedBandSize && availableCupSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">Cup Size</label>
          <div className="space-y-3">
            {availableCupSizes.map((cupSize) => {
              const variant = variants.find(
                (v) =>
                  v.colorId === selectedColor?.id &&
                  v.bandSize === selectedBandSize &&
                  v.cupSize === cupSize
              )

              if (!variant) return null

              const quantity = quantities[variant.id] || 0
              const isOutOfStock = variant.stock === 0

              return (
                <div
                  key={cupSize}
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (cupSize) {
                          setSelectedCupSize(cupSize)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedCupSize === cupSize
                          ? 'border-black bg-primary-50 text-primary-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {cupSize}
                    </button>
                    <span className="font-semibold">Rs {variant.price.toFixed(2)}</span>
                    {isOutOfStock && (
                      <span className="text-red-600 text-sm">Out of Stock</span>
                    )}
                    {!isOutOfStock && variant.stock < 10 && (
                      <span className="text-orange-600 text-sm">
                        Only {variant.stock} left
                      </span>
                    )}
                  </div>
                  {!isOutOfStock && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(variant.id, quantity - 1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={variant.stock}
                        value={quantity}
                        onChange={(e) =>
                          updateQuantity(variant.id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateQuantity(variant.id, quantity + 1)}
                        disabled={quantity >= variant.stock}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regular Size Selection with Quantity (for XS, S, M, L sizing) */}
      {usesRegularSize && availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">
            Size: {selectedSize || 'Select size'}
          </label>
          <div className="space-y-3">
            {availableSizes.map((size) => {
              const variant = variants.find(
                (v) =>
                  v.colorId === selectedColor?.id &&
                  v.size === size
              )

              if (!variant) return null

              const quantity = quantities[variant.id] || 0
              const isOutOfStock = variant.stock === 0

              return (
                <div
                  key={size}
                  className="flex items-center justify-between p-3 border border-gray-300 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (size) {
                          setSelectedSize(size)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        selectedSize === size
                          ? 'border-black bg-primary-50 text-primary-700 font-semibold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                    <span className="font-semibold">Rs {variant.price.toFixed(2)}</span>
                    {isOutOfStock && (
                      <span className="text-red-600 text-sm">Out of Stock</span>
                    )}
                    {!isOutOfStock && variant.stock < 10 && (
                      <span className="text-orange-600 text-sm">
                        Only {variant.stock} left
                      </span>
                    )}
                  </div>
                  {!isOutOfStock && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(variant.id, quantity - 1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={variant.stock}
                        value={quantity}
                        onChange={(e) =>
                          updateQuantity(variant.id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateQuantity(variant.id, quantity + 1)}
                        disabled={quantity >= variant.stock}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!hasSelection}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
      >
        <ShoppingCart size={24} />
        <span>
          {hasSelection
            ? `Add ${totalQuantity} item${totalQuantity > 1 ? 's' : ''} to Cart`
            : 'Select sizes and quantities'}
        </span>
      </button>
    </div>
  )
}

