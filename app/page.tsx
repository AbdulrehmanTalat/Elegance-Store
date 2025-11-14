import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

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
      take: 6,
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function Home() {
  const products = await getFeaturedProducts()
  
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary-600 mb-4">
          Welcome to Elegance Store
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover our collection of undergarments, jewelry, and makeup
        </p>
        <Link
          href="/products"
          className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          Shop Now
        </Link>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {safeProducts.length === 0 && (
          <p className="text-center text-gray-500">No products available yet.</p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
          <p className="text-gray-600">On orders over Rs 5000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
          <p className="text-gray-600">100% secure checkout</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
          <p className="text-gray-600">30-day return policy</p>
        </div>
      </section>
    </div>
  )
}

