'use client'

import StarRating from './StarRating'

interface ReviewSummaryProps {
  avgRating: number
  reviewCount: number
  ratingDistribution?: { [key: number]: number } // Optional: pass distribution if available
}

export default function ReviewSummary({ avgRating, reviewCount }: ReviewSummaryProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <div className="text-center">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {avgRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          <StarRating rating={Math.round(avgRating)} readonly size={24} />
        </div>
        <p className="text-gray-500 text-sm">
          Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </p>
      </div>
      
      {/* Note: To implement the distribution bars properly, we'd need to fetch that data from the API.
          For now, we'll keep it simple with just the average. 
          Future improvement: Add distribution query to the API. */}
    </div>
  )
}
