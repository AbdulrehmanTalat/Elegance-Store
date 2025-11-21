'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Reset selectedImage when images change
  useEffect(() => {
    setSelectedImage(0)
    setImageErrors(new Set())
  }, [images?.length, images?.[0]])

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
      // Skip to next available image logic handled by getCurrentImageIndex
      return newErrors
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative h-[600px] w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
          {!imageErrors.has(currentImageIndex) && (
            <div className="w-full h-full flex items-center justify-center">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={3}
                centerOnInit={true}
                wheel={{ step: 0.2 }}
              >
                {({ zoomIn, resetTransform }) => (
                  <div 
                    className="w-full h-full flex items-center justify-center cursor-zoom-in"
                    onMouseEnter={() => zoomIn(0.5)} // Slight zoom on hover
                    onMouseLeave={() => resetTransform()}
                    onClick={() => setShowFullscreen(true)}
                  >
                    <TransformComponent
                      wrapperClass="w-full h-full flex items-center justify-center"
                      contentClass="w-full h-full flex items-center justify-center"
                    >
                      <div className="relative w-full h-full min-w-[300px] min-h-[300px] flex items-center justify-center">
                        <Image
                          src={images[currentImageIndex]}
                          alt={`${productName} - Image ${currentImageIndex + 1}`}
                          fill
                          className="object-contain p-4"
                          priority
                          onError={() => handleImageError(currentImageIndex)}
                        />
                      </div>
                    </TransformComponent>
                  </div>
                )}
              </TransformWrapper>
            </div>
          )}
          
          <button 
            onClick={() => setShowFullscreen(true)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
            aria-label="Open fullscreen"
          >
            <ZoomIn size={20} className="text-gray-700" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, index) => {
              if (imageErrors.has(index)) return null
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(Math.min(index, images.length - 1))}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    currentImageIndex === index
                      ? 'border-primary-600 ring-2 ring-primary-100 scale-105'
                      : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
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
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-fade-in"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-50 p-2 rounded-full hover:bg-white/10"
          >
            <X size={32} />
          </button>

          <div 
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit={true}
            >
              <TransformComponent
                wrapperClass="w-full h-full flex items-center justify-center"
                contentClass="w-full h-full flex items-center justify-center"
              >
                <div className="relative w-[90vw] h-[90vh]">
                  {!imageErrors.has(currentImageIndex) && (
                    <Image
                      src={images[currentImageIndex]}
                      alt={`${productName} - Fullscreen Image ${currentImageIndex + 1}`}
                      fill
                      className="object-contain"
                      quality={100}
                      onError={() => handleImageError(currentImageIndex)}
                    />
                  )}
                </div>
              </TransformComponent>
            </TransformWrapper>
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all bg-black/20 hover:bg-black/40 p-4 rounded-full backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all bg-black/20 hover:bg-black/40 p-4 rounded-full backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(Math.min(index, images.length - 1))
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentImageIndex === index
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/60'
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
