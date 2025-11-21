'use client'

import { useState, useEffect } from 'react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Ayesha Khan',
      location: 'Karachi',
      rating: 5,
      text: 'Absolutely love the quality! The lingerie fits perfectly and the jewelry is stunning. Fast delivery and great customer service.',
      avatar: 'AK',
      date: 'November 2024',
    },
    {
      name: 'Fatima Ahmed',
      location: 'Lahore',
      rating: 5,
      text: 'Best online shopping experience in Pakistan! The products are exactly as shown and the packaging is beautiful.',
      avatar: 'FA',
      date: 'November 2024',
    },
    {
      name: 'Sara Malik',
      location: 'Islamabad',
      rating: 5,
      text: 'The size guide was so helpful! I ordered the perfect fit on my first try. Highly recommend to all Pakistani women!',
      avatar: 'SM',
      date: 'October 2024',
    },
    {
      name: 'Zainab Ali',
      location: 'Multan',
      rating: 5,
      text: 'Gorgeous makeup products that actually match Pakistani skin tones. Finally found my perfect shade!',
      avatar: 'ZA',
      date: 'October 2024',
    },
    {
      name: 'Hira Siddiqui',
      location: 'Peshawar',
      rating: 5,
      text: 'The jewelry collection is exquisite! Got so many compliments at my friend\'s wedding. Worth every rupee!',
      avatar: 'HS',
      date: 'September 2024',
    },
    {
      name: 'Maryam Hassan',
      location: 'Faisalabad',
      rating: 5,
      text: 'Free shipping nationwide is amazing! Products arrived safely and quickly. Customer service responded to my questions immediately.',
      avatar: 'MH',
      date: 'September 2024',
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const testimonialsPerPage = 3
  const start = currentIndex * testimonialsPerPage
  const visibleTestimonials = testimonials.slice(start, start + testimonialsPerPage)

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-gradient">What Our Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy customers who trust Elegance Store for their fashion and beauty needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={start + index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location} • {testimonial.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-3">
          {[...Array(Math.ceil(testimonials.length / testimonialsPerPage))].map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View testimonials ${index + 1}`}
            />
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-5xl font-bold text-primary-600">4.8</span>
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-6 h-6 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Based on 500+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
