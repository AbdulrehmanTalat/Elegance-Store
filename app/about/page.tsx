import { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { CheckCircle, Heart, Shield, Users, Award, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | Elegance Store - Premium Fashion & Beauty in Pakistan',
  description: 'Discover Elegance Store - Pakistan\'s trusted destination for premium lingerie, jewelry, and makeup. Quality products, exceptional service, and customer satisfaction guaranteed.',
  keywords: ['about elegance store', 'lingerie store pakistan', 'jewelry store pakistan', 'makeup store pakistan', 'online shopping pakistan'],
  alternates: {
    canonical: 'https://elegance-store.vercel.app/about',
  },
}

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Every product is carefully selected and inspected to ensure it meets our high standards of quality and craftsmanship.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We provide exceptional service and support at every step of your shopping journey.',
    },
    {
      icon: CheckCircle,
      title: 'Authenticity Guaranteed',
      description: '100% authentic products sourced directly from trusted manufacturers and authorized distributors.',
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'We listen to our customers and continuously improve based on your feedback and needs.',
    },
  ]

  const milestones = [
    {
      year: '2023',
      title: 'Store Launch',
      description: 'Elegance Store was founded with a vision to bring premium fashion and beauty products to Pakistani women.',
    },
    {
      year: '2024',
      title: '10,000+ Happy Customers',
      description: 'Reached a milestone of serving over 10,000 satisfied customers across Pakistan.',
    },
    {
      year: '2024',
      title: 'Expanded Collection',
      description: 'Grew our product range to include curated selections of lingerie, jewelry, and premium makeup.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Breadcrumbs
          items={[
            { name: 'About Us', href: '/about' },
          ]}
        />

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-gradient">About Elegance Store</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your trusted destination for premium lingerie, exquisite jewelry, and quality makeup in Pakistan
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-gray-700 font-semibold">Happy Customers</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
            <div className="text-gray-700 font-semibold">Premium Products</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">4.8/5</div>
            <div className="text-gray-700 font-semibold">Customer Rating</div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-primary-600" size={32} />
            <h2 className="text-3xl font-bold">Our Story</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Elegance Store was born from a simple yet powerful vision: to provide Pakistani women with access to premium fashion and beauty products that make them feel confident, beautiful, and empowered.
            </p>
            
            <p>
              We understand that shopping for lingerie, jewelry, and makeup is deeply personal. That's why we've created a safe, discreet, and convenient online shopping experience where you can browse our carefully curated collections from the comfort of your home.
            </p>
            
            <p>
              Every product in our store is handpicked with care, ensuring it meets our strict standards for quality, comfort, and style. From delicate lace lingerie to stunning jewelry pieces and premium cosmetics, we offer only the best for our valued customers.
            </p>

            <p>
              Our commitment goes beyond just selling products. We provide expert advice through our blog, offer personalized customer support, and continuously listen to your feedback to improve our offerings. Your satisfaction and trust are what drive us every single day.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                      <Icon className="text-primary-600" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Our Journey */}
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-6 border-l-4 border-primary-600 pl-6 pb-6 last:pb-0">
                <div className="bg-primary-600 text-white rounded-full px-4 py-2 font-bold whitespace-nowrap">
                  {milestone.year}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Elegance Store?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Free Nationwide Shipping</h3>
                <p className="text-pink-100">Deliver to your doorstep across Pakistan at no extra cost</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">30-Day Returns</h3>
                <p className="text-pink-100">Shop with confidence with our hassle-free return policy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Secure Payments</h3>
                <p className="text-pink-100">100% secure checkout with encrypted payment processing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1">Expert Support</h3>
                <p className="text-pink-100">Our team is here to help you find the perfect products</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Elegance?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who trust us for their fashion and beauty needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              Shop Now
            </a>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
