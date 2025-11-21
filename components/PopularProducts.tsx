import { prisma } from '@/lib/prisma'
import ProductCard from './ProductCard'
import Link from 'next/link'

async function getPopularProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      colors: {
        include: {
          variants: true,
        },
      },
    },
    orderBy: [
      { reviewCount: 'desc' },
      { avgRating: 'desc' },
    ],
    take: 8,
  })

  return products
}

export default async function PopularProducts() {
  const products = await getPopularProducts()

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Popular Products</span>
            </h2>
            <p className="text-gray-600">
              Customer favorites and best-sellers
            </p>
          </div>
          
          <Link
            href="/products?sort=popular"
            className="hidden md:inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/products?sort=popular"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            View All Popular Products
          </Link>
        </div>
      </div>
    </section>
  )
}
