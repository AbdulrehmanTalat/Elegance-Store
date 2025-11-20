import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { ProductCategory } from '@prisma/client'
import SearchBar from '@/components/products/SearchBar'
import FilterSidebar from '@/components/products/FilterSidebar'
import ActiveFilters from '@/components/products/ActiveFilters'
import ProductsHeader from '@/components/products/ProductsHeader'

interface ProductsPageProps {
  searchParams: {
    category?: string
    subcategory?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    minRating?: string
    inStock?: string
    sort?: string
  }
}

async function getProducts(filters: ProductsPageProps['searchParams']) {
  try {
    const where: any = { isActive: true }
    
    // Category filter
    if (filters.category && Object.values(ProductCategory).includes(filters.category as ProductCategory)) {
      where.category = filters.category
    }
    
    // Subcategory filter
    if (filters.subcategory) {
      where.subcategory = filters.subcategory
    }
    
    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Rating filter
    if (filters.minRating) {
      where.avgRating = { gte: parseFloat(filters.minRating) }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        colors: {
          include: {
            variants: true,
          },
        },
      },
    })

    // Client-side filtering for price and stock (since these are in variants)
    let filteredProducts = products

    // Price filter
    if (filters.minPrice || filters.maxPrice) {
      filteredProducts = filteredProducts.filter((product) => {
        const prices = product.colors.flatMap((color) =>
          color.variants.map((v) => v.price)
        )
        const minProductPrice = Math.min(...prices, product.basePrice || Infinity)
        const maxProductPrice = Math.max(...prices, product.basePrice || 0)

        const minFilter = filters.minPrice ? parseFloat(filters.minPrice) : 0
        const maxFilter = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity

        return maxProductPrice >= minFilter && minProductPrice <= maxFilter
      })
    }

    // Stock filter
    if (filters.inStock === 'true') {
      filteredProducts = filteredProducts.filter((product) => {
        const totalStock = product.colors.reduce((sum, color) =>
          sum + color.variants.reduce((vSum, v) => vSum + v.stock, 0),
          0
        )
        return totalStock > 0 || (product as any).stock > 0
      })
    }

    // Sorting
    const sortOption = filters.sort || 'newest'
    filteredProducts.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc': {
          const aMin = Math.min(
            ...a.colors.flatMap((c) => c.variants.map((v) => v.price)),
            a.basePrice || Infinity
          )
          const bMin = Math.min(
            ...b.colors.flatMap((c) => c.variants.map((v) => v.price)),
            b.basePrice || Infinity
          )
          return aMin - bMin
        }
        case 'price-desc': {
          const aMax = Math.max(
            ...a.colors.flatMap((c) => c.variants.map((v) => v.price)),
            a.basePrice || 0
          )
          const bMax = Math.max(
            ...b.colors.flatMap((c) => c.variants.map((v) => v.price)),
            b.basePrice || 0
          )
          return bMax - aMax
        }
        case 'rating':
          return (b.avgRating || 0) - (a.avgRating || 0)
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filteredProducts
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getPriceRange() {
  try {
    const variants = await prisma.productVariant.findMany({
      select: { price: true },
    })
    
    if (variants.length === 0) {
      return { min: 0, max: 10000 }
    }

    const prices = variants.map((v) => v.price)
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100,
    }
  } catch (error) {
    return { min: 0, max: 10000 }
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts(searchParams)
  const priceRange = await getPriceRange()
  
  const safeProducts = Array.isArray(products) ? products : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Our Products</span>
          </h1>
          <p className="text-xl text-gray-600">
            Discover our curated collection of premium products
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="sticky top-4">
              <FilterSidebar priceRange={priceRange} />
            </div>
          </aside>

          {/* Products */}
          <main className="flex-1">
            {/* Active Filters */}
            <div className="mb-6">
              <ActiveFilters />
            </div>

            {/* Products Header */}
            <ProductsHeader count={safeProducts.length} />

            {/* Products Grid */}
            {safeProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchParams.search
                    ? `We couldn't find any products matching "${searchParams.search}"`
                    : "Try adjusting your filters to see more results"}
                </p>
                <a
                  href="/products"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Browse All Products
                </a>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Button - Fixed at bottom */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <button className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {[searchParams.category, searchParams.search, searchParams.minPrice, searchParams.minRating, searchParams.inStock].filter(Boolean).length}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
