import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import HeroSection from '@/components/home/HeroSection'
import CategoryCard from '@/components/home/CategoryCard'
import FeatureCard from '@/components/home/FeatureCard'
import NewsletterSection from '@/components/home/NewsletterSection'
import PopularProducts from '@/components/PopularProducts'
import JsonLd from '@/components/JsonLd'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        colors: {
          include: {
            variants: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCategoryImages() {
  try {
    // Get one product from each category to use as background
    const undergarments = await prisma.product.findFirst({
      where: { category: 'UNDERGARMENTS', isActive: true },
      include: { colors: { include: { variants: true } } },
    })
    
    const jewelry = await prisma.product.findFirst({
      where: { category: 'JEWELRY', isActive: true },
      include: { colors: { include: { variants: true } } },
    })
    
    const makeup = await prisma.product.findFirst({
      where: { category: 'MAKEUP', isActive: true },
      include: { colors: { include: { variants: true } } },
    })

    return {
      undergarments: undergarments?.image || undergarments?.colors?.[0]?.images?.[0] || '',
      jewelry: jewelry?.image || jewelry?.colors?.[0]?.images?.[0] || '',
      makeup: makeup?.image || makeup?.colors?.[0]?.images?.[0] || '',
    }
  } catch (error) {
    console.error('Error fetching category images:', error)
    return { undergarments: '', jewelry: '', makeup: '' }
  }
}

export default async function Home() {
  const products = await getFeaturedProducts()
  const categoryImages = await getCategoryImages()
  
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  const categories = [
    {
      title: 'Undergarments',
      description: 'Comfort meets elegance in our premium collection',
      href: '/products?category=UNDERGARMENTS',
      iconName: 'heart' as const,
      image: categoryImages.undergarments,
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Jewelry',
      description: 'Exquisite pieces to complement your style',
      href: '/products?category=JEWELRY',
      iconName: 'gem' as const,
      image: categoryImages.jewelry,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Makeup',
      description: 'Enhance your natural beauty with premium cosmetics',
      href: '/products?category=MAKEUP',
      iconName: 'palette' as const,
      image: categoryImages.makeup,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ]

  const features = [
    {
      iconName: 'truck' as const,
      title: 'Free Shipping',
      description: 'Free delivery on all orders. No minimum purchase required.',
      color: 'from-green-400 to-emerald-500',
    },
    {
      iconName: 'shield' as const,
      title: 'Secure Payment',
      description: '100% secure checkout with encrypted payment processing.',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      iconName: 'rotate' as const,
      title: 'Easy Returns',
      description: '30-day hassle-free returns. We make it simple.',
      color: 'from-orange-400 to-red-500',
    },
    {
      iconName: 'headphones' as const,
      title: '24/7 Support',
      description: 'Our team is here to help you anytime, anywhere.',
      color: 'from-purple-400 to-pink-500',
    },
  ]

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Elegance Store',
    url: 'https://elegance-store.vercel.app',
    logo: 'https://elegance-store.vercel.app/logo.png',
    description: 'Premium lingerie, jewelry, and makeup store in Pakistan',
    sameAs: [
      'https://facebook.com/elegancestore',
      'https://instagram.com/elegancestore',
      'https://twitter.com/elegancestore',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Elegance Store',
    url: 'https://elegance-store.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://elegance-store.vercel.app/products?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="bg-gray-50">
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      {/* Hero Section */}
      <HeroSection />

      {/* Category Highlights */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Shop by Category</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections designed to make you feel confident and beautiful
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={category.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Trending This Week</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our most popular items loved by customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {safeProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {safeProducts.length === 0 && (
            <p className="text-center text-gray-500 text-lg">No products available yet.</p>
          )}

          {safeProducts.length > 0 && (
            <div className="text-center">
              <a
                href="/products"
                className="inline-block px-10 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                View All Products
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Popular Products */}
      <PopularProducts />

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Why Choose Elegance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  )
}
