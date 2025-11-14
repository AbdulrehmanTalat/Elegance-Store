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
  const imageRef = useRef<HTMLDivElement>(null)

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

  if (!images || images.length === 0) {
    return (
      <div className="relative h-[600px] w-full bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="text-gray-400">No Image</span>
      </div>
    )
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
            <Image
              src={images[selectedImage]}
              alt={`${productName} - Image ${selectedImage + 1}`}
              fill
              className="object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400?text=Invalid+Image'
              }}
            />
          </div>
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn size={20} />
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                  selectedImage === index
                    ? 'border-primary-600 ring-2 ring-primary-300'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80?text=Invalid'
                  }}
                />
              </button>
            ))}
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
            <Image
              src={images[selectedImage]}
              alt={`${productName} - Fullscreen Image ${selectedImage + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400?text=Invalid+Image'
              }}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
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
                  setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
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
                      setSelectedImage(index)
                    }}
                    className={`w-3 h-3 rounded-full transition ${
                      selectedImage === index
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

