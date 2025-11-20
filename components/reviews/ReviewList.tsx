'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, User } from 'lucide-react'
import StarRating from './StarRating'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  images: string[]
  verified: boolean
  createdAt: string
  user: {
    name: string | null
    image?: string | null
  }
}

interface ReviewListProps {
  productId: string
  refreshTrigger: number // Used to trigger re-fetch
}

export default function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId, refreshTrigger])

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading reviews...</div>
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-2">No reviews yet</p>
        <p className="text-sm text-gray-400">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name || 'User'}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <User className="text-gray-400" size={20} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {review.user.name || 'Anonymous'}
                  </p>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={12} />
                      Verified Buyer
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size={16} />
          </div>

          {review.title && (
            <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
          )}
          
          <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

          {review.images.length > 0 && (
            <div className="flex gap-2 mt-4">
              {review.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
                  <Image
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
