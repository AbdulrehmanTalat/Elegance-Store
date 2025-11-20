'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import StarRating from './StarRating'
import { useToast } from '@/components/ToastProvider'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating'),
  title: z.string().optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  productId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { showSuccess, showError } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  const handleRatingChange = (value: number) => {
    setRating(value)
    setValue('rating', value, { shouldValidate: true })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 3) {
      showError('You can only upload up to 3 images')
      return
    }

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!res.ok) throw new Error('Upload failed')
        
        const data = await res.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages([...images, ...uploadedUrls])
    } catch (error) {
      showError('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit review')
      }

      showSuccess('Review submitted successfully!')
      onSuccess()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4">Write a Review</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating rating={rating} onRatingChange={handleRatingChange} size={32} />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title (Optional)
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Summarize your experience"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Review
        </label>
        <textarea
          {...register('comment')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="What did you like or dislike?"
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional)
        </label>
        <div className="flex items-center gap-4">
          <label className={`flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 transition ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="text-gray-400" size={24} />
            <span className="text-xs text-gray-500 mt-1">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
          
          {images.map((url, index) => (
            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={url}
                alt="Review upload"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {isUploading && (
            <div className="flex items-center justify-center w-24 h-24">
              <Loader2 className="animate-spin text-primary-600" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
