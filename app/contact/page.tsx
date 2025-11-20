'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, User } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      setIsSuccess(true)
      reset()
      
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactEmail = 'htesting22@gmail.com'
  const whatsappNumber = '+923001234567'
  const phone = '+92 300 1234567'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Get In Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="glass-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            {isSuccess && (
              <div className="bg-green-50 border-2 border-green-500 text-green-800 px-4 py-3 rounded-xl mb-6 animate-fade-in-up">
                ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  {...register('subject')}
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact Cards */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <a href={`mailto:${contactEmail}`} className="hover:underline">
                      {contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/${whatsappNumber.replace(/\+|\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-white/90">
                      Karachi, Pakistan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-white/90">
                      Mon - Fri: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">⏱️ Response Time</h3>
              <p className="text-gray-600">
                We typically respond to all inquiries within <strong className="text-gray-900">24-48 hours</strong> during business days. 
                For urgent matters, please call us directly or reach out via WhatsApp.
              </p>
            </div>

            {/* FAQ Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Quick Tip</h3>
              <p className="text-blue-800">
                Before contacting us, check out our Returns & Shipping pages for answers to common questions!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
