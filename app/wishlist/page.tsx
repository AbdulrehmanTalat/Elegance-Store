'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'
import { useRouter } from 'next/navigation'

interface WishlistItem {
  id: string
  productId: string
  variantId: string | null
  product: {
    id: string
    name: string
    basePrice: number | null
    image: string | null
    colors: any[]
  }
  variant: {
    id: string
    price: number
    color: {
      name: string
      images: string[]
    }
    size: string | null
    bandSize: string | null
    cupSize: string | null
  } | null
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/wishlist')
      return
    }

    if (status === 'authenticated') {
      fetchWishlist()
    }
  }, [status, router])

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string, variantId: string | null) => {
    try {
      const params = new URLSearchParams({ productId })
      if (variantId) params.append('variantId', variantId)

      const res = await fetch(`/api/wishlist?${params.toString()}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems((prev) => prev.filter((item) => 
          !(item.productId === productId && item.variantId === variantId)
        ))
        showSuccess('Removed from wishlist')
      } else {
        throw new Error('Failed to remove')
      }
    } catch (error) {
      showError('Failed to remove item')
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    const price = item.variant ? item.variant.price : (item.product.basePrice || 0)
    const image = item.variant?.color?.images?.[0] || item.product.image || '/placeholder.png'
    
    // Construct variant name if applicable
    let variantName = ''
    if (item.variant) {
       const parts = []
       if (item.variant.color?.name) parts.push(item.variant.color.name)
       if (item.variant.size) parts.push(item.variant.size)
       if (item.variant.bandSize && item.variant.cupSize) parts.push(`${item.variant.bandSize}${item.variant.cupSize}`)
       variantName = parts.join(' - ')
    }

    addItem({
      id: item.product.id,
      name: item.product.name,
      price: price,
      image: image,
      quantity: 1,
      variantId: item.variantId || undefined,
      color: item.variant?.color?.name,
      size: item.variant?.size || (item.variant?.bandSize && item.variant?.cupSize ? `${item.variant.bandSize}${item.variant.cupSize}` : undefined)
    })
    showSuccess('Added to cart')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-primary-600 fill-primary-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-gray-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Browse our collection and save your favorite items to find them easily later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
          >
            Start Shopping
            <ArrowRight size={20} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const price = item.variant ? item.variant.price : item.product.basePrice
            const image = item.variant?.color?.images?.[0] || item.product.image || '/placeholder.png'
            
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                <div className="relative aspect-[4/5] bg-gray-100">
                  <Image
                    src={image}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.productId, item.variantId)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="p-4">
                  <Link href={`/products/${item.productId}`} className="block group-hover:text-primary-600 transition">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  {item.variant && (
                    <p className="text-sm text-gray-500 mb-2">
                      {item.variant.color.name}
                      {item.variant.size && ` • ${item.variant.size}`}
                      {item.variant.bandSize && ` • ${item.variant.bandSize}${item.variant.cupSize}`}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {price?.toLocaleString()}
                    </span>
                    
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="p-2 bg-gray-900 text-white rounded-xl hover:bg-primary-600 transition shadow-lg shadow-gray-900/20 hover:shadow-primary-600/20"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
