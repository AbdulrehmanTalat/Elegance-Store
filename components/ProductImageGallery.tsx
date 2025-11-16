'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const imageRef = useRef<HTMLDivElement>(null)

  // Reset selectedImage when images change (e.g., when switching colors)
  useEffect(() => {
    setSelectedImage(0)
    setImageErrors(new Set())
  }, [images?.length, images?.[0]]) // Reset when images array changes

  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showFullscreen])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  // Ensure selectedImage is within bounds
  const validSelectedImage = images && images.length > 0 
    ? Math.min(selectedImage, images.length - 1)
    : 0

  // Filter out images that have errored
  const availableImages = images.filter((_, index) => !imageErrors.has(index))
  
  if (!images || images.length === 0 || availableImages.length === 0) {
    return (
      <div className="relative h-[600px] w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    )
  }

  // Find the current valid image index
  const getCurrentImageIndex = () => {
    if (!imageErrors.has(validSelectedImage)) {
      return validSelectedImage
    }
    // Find next available image
    const nextIndex = images.findIndex((_, i) => i > validSelectedImage && !imageErrors.has(i))
    if (nextIndex !== -1) return nextIndex
    const prevIndex = images.findIndex((_, i) => i < validSelectedImage && !imageErrors.has(i))
    if (prevIndex !== -1) return prevIndex
    return availableImages.length > 0 ? images.indexOf(availableImages[0]) : 0
  }
  
  const currentImageIndex = getCurrentImageIndex()

  const handleImageError = (index: number) => {
    setImageErrors((prev) => {
      const newErrors = new Set(prev).add(index)
      // Skip to next available image if current one fails
      if (index === validSelectedImage) {
        const nextIndex = images.findIndex((_, i) => i > index && !newErrors.has(i))
        if (nextIndex !== -1) {
          setSelectedImage(nextIndex)
        } else {
          const prevIndex = images.findIndex((_, i) => i < index && !newErrors.has(i))
          if (prevIndex !== -1) {
            setSelectedImage(prevIndex)
          }
        }
      }
      return newErrors
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div
          ref={imageRef}
          className="relative h-[600px] w-full bg-gray-200 rounded-lg overflow-hidden cursor-zoom-in group"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setShowFullscreen(true)}
        >
          <div
            className={`absolute inset-0 transition-transform duration-300 ease-out ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          >
            {!imageErrors.has(currentImageIndex) && (
              <Image
                src={images[currentImageIndex]}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                onError={() => handleImageError(currentImageIndex)}
              />
            )}
          </div>
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={20} />
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => {
              if (imageErrors.has(index)) return null
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(Math.min(index, images.length - 1))}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentImageIndex === index
                      ? 'border-primary-600 ring-2 ring-primary-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${productName} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(index)}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10"
          >
            <X size={32} />
          </button>
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {!imageErrors.has(currentImageIndex) && (
              <Image
                src={images[currentImageIndex]}
                alt={`${productName} - Fullscreen Image ${currentImageIndex + 1}`}
                width={1200}
                height={1200}
                className="max-w-full max-h-full object-contain"
                onError={() => handleImageError(currentImageIndex)}
              />
            )}
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => {
                    const newIndex = prev > 0 ? prev - 1 : images.length - 1
                    return Math.min(newIndex, images.length - 1)
                  })
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition bg-black bg-opacity-50 p-3 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => {
                    const newIndex = prev < images.length - 1 ? prev + 1 : 0
                    return Math.min(newIndex, images.length - 1)
                  })
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition bg-black bg-opacity-50 p-3 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(Math.min(index, images.length - 1))
                    }}
                    className={`w-3 h-3 rounded-full transition ${
                      currentImageIndex === index
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

