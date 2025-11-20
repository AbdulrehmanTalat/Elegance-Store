'use client'

import { useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setStatus('loading')
    
    // Simulate API call (replace with actual newsletter API later)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStatus('success')
    setEmail('')
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-secondary animate-gradient opacity-90" />
      
      {/* Decorative Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-float">
            <Sparkles size={32} className="text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and style tips
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
            <div className="flex-1 relative">
              <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/30 bg-white/95 backdrop-blur-sm focus:border-white focus:ring-2 focus:ring-white/50 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </form>

          {/* Status Messages */}
          {status === 'error' && (
            <p className="text-red-200 text-sm animate-fade-in-up">
              Please enter a valid email address
            </p>
          )}
          {status === 'success' && (
            <p className="text-green-200 text-sm animate-fade-in-up">
              Welcome! Check your inbox for your discount code 🎉
            </p>
          )}

          {/* Privacy Text */}
          <p className="text-white/70 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}
