'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquarePlus } from 'lucide-react'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'
import ReviewSummary from './ReviewSummary'

interface ProductReviewsProps {
  productId: string
  avgRating: number
  reviewCount: number
}

export default function ProductReviews({ productId, avgRating, reviewCount }: ProductReviewsProps) {
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/user/can-review?productId=${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.canReview) setCanReview(true)
        })
        .catch(err => console.error('Error checking review eligibility:', err))
    }
  }, [session, productId, refreshTrigger])

  const handleSuccess = () => {
    setShowForm(false)
    setRefreshTrigger(prev => prev + 1)
    setCanReview(false) // Hide button after successful submission
  }

  return (
    <div className="py-12 border-t border-gray-200 mt-16" id="reviews">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Summary & Action */}
        <div className="w-full md:w-1/3 space-y-6 sticky top-24">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          
          <ReviewSummary avgRating={avgRating} reviewCount={reviewCount} />
          
          {canReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <MessageSquarePlus size={20} />
              Write a Review
            </button>
          )}
          
          {!session && (
            <div className="text-center p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
              Please <a href={`/auth/signin?callbackUrl=/products/${productId}`} className="text-primary-600 font-semibold hover:underline">sign in</a> to leave a review.
            </div>
          )}
        </div>

        {/* Right Column: List or Form */}
        <div className="w-full md:w-2/3">
          {showForm ? (
            <ReviewForm
              productId={productId}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <ReviewList productId={productId} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  )
}
