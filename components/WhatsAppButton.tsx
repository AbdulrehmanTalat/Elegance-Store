'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)
  
  // Replace with your actual WhatsApp business number
  const whatsappNumber = '923398884625' // Format: country code + number (no + or spaces)
  const message = encodeURIComponent('Hi! I have a question about your products.')
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 md:bottom-6 right-6 z-[60] flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group sm:bottom-24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Chat on WhatsApp"
    >
      <div className="p-4">
        <MessageCircle size={28} className="animate-pulse" />
      </div>
      
      {/* Expandable Text */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isHovered ? 'max-w-xs pr-4' : 'max-w-0'
        }`}
      >
        <span className="font-semibold whitespace-nowrap">Chat with us!</span>
      </div>

      {/* Notification Badge */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
    </a>
  )
}
