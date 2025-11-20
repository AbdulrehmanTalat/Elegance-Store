'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  onRatingChange,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isFilled = (hoverRating || rating) >= starValue
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => onRatingChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-100 text-gray-300'
              } transition-colors`}
            />
          </button>
        )
      })}
    </div>
  )
}
