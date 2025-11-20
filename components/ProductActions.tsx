'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'
import { Product } from '@prisma/client'

interface ProductActionsProps {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { showSuccess, showError } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/wishlist/check?productId=${product.id}`)
        .then(res => res.json())
        .then(data => setIsInWishlist(data.isInWishlist))
        .catch(console.error)
    }
  }, [session, product.id])

  const toggleWishlist = async () => {
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
        category: product.category,
      })
      setQuantity(1)
      showSuccess('Item added to cart!')
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
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
        >
          <ShoppingCart size={24} />
          <span>Add to Cart</span>
        </button>
        
        <button
          onClick={toggleWishlist}
          className={`px-4 py-3 rounded-lg border-2 transition flex items-center justify-center ${
            isInWishlist 
              ? 'border-red-200 bg-red-50 text-red-500' 
              : 'border-gray-300 hover:border-gray-400 text-gray-600'
          }`}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={24} className={isInWishlist ? "fill-current" : ""} />
        </button>
      </div>
    </div>
  )
}

