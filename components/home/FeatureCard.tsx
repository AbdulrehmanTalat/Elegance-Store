'use client'

import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react'

interface FeatureCardProps {
  iconName: 'truck' | 'shield' | 'rotate' | 'headphones'
  title: string
  description: string
  color: string
}

export default function FeatureCard({
  iconName,
  title,
  description,
  color,
}: FeatureCardProps) {
  // Map icon names to components
  const iconMap = {
    truck: Truck,
    shield: Shield,
    rotate: RotateCcw,
    headphones: Headphones,
  }
  
  const Icon = iconMap[iconName]
  return (
    <div className="group relative p-8 rounded-2xl glass-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
      {/* Icon Container */}
      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${color} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon size={32} className="text-white" strokeWidth={2} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
    </div>
  )
}
