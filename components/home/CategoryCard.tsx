'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Gem, Palette } from 'lucide-react'

interface CategoryCardProps {
  title: string
  description: string
  href: string
  iconName: 'heart' | 'gem' | 'palette'
  image?: string
  gradient: string
}

export default function CategoryCard({
  title,
  description,
  href,
  iconName,
  image,
  gradient,
}: CategoryCardProps) {
  // Map icon names to components
  const iconMap = {
    heart: Heart,
    gem: Gem,
    palette: Palette,
  }
  
  const Icon = iconMap[iconName]
  return (
    <Link href={href}>
      <div className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
        {/* Background Image */}
        {image && (
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div 
          className={`absolute inset-0 ${gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-8 text-white">
          {/* Icon */}
          <div className="mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Icon size={40} strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <h3 className="text-3xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-white/90 text-lg mb-4 group-hover:translate-x-2 transition-transform duration-300 delay-75">
            {description}
          </p>

          {/* Hover Indicator */}
          <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <span>Explore Collection</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      </div>
    </Link>
  )
}
