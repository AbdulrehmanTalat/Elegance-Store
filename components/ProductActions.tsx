'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { Product } from '@prisma/client'

interface ProductActionsProps {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    const price = (product as any).basePrice || (product as any).price || 0
    const image = (product as any).image || ''
    const stock = (product as any).stock || 0
    
    if (stock > 0 || price > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price,
        image,
        quantity,
        productId: product.id,
      })
      setQuantity(1)
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <label htmlFor="quantity" className="font-semibold">
          Quantity:
        </label>
        <input
          type="number"
          id="quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="border border-gray-300 rounded-lg px-4 py-2 w-20 text-center"
        />
      </div>
      <button
        onClick={handleAddToCart}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
      >
        <ShoppingCart size={24} />
        <span>Add to Cart</span>
      </button>
    </div>
  )
}

