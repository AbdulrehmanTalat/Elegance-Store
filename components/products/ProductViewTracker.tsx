'use client'

import { useEffect } from 'react'
import { addRecentlyViewed } from '@/lib/recentlyViewed'

interface ProductViewTrackerProps {
  product: {
    id: string
    name: string
    image: string | null
    basePrice: number | null
  }
}

export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useEffect(() => {
    addRecentlyViewed({
      id: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.basePrice,
    })
  }, [product])

  return null
}
