import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { ProductCategory } from '@prisma/client'

interface ProductsPageProps {
  searchParams: { category?: string; subcategory?: string; search?: string }
}

async function getProducts(category?: string, subcategory?: string, search?: string) {
  try {
    const where: any = { isActive: true }
    
    if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
      where.category = category
    }
    
    if (subcategory) {
      where.subcategory = subcategory
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
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
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

const subcategoryLabels: { [key: string]: string } = {
  LINGERIE: 'Lingerie',
  BRA: 'Bra',
  PANTIES: 'Panties',
  BRA_PANTIES_SET: 'Bra Panties Set',
  THONGS: 'Thongs',
  BIKINI: 'Bikini',
  LOUNGE_WEAR: 'Lounge Wear',
  PLUS_SIZE_LINGERIE: 'Plus Size Lingerie',
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts(searchParams.category, searchParams.subcategory, searchParams.search)
  
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : []
  const isUndergarments = searchParams.category === 'UNDERGARMENTS'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Products</h1>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <a
            href="/products"
            className={`px-4 py-2 rounded-lg ${
              !searchParams.category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </a>
          <a
            href="/products?category=UNDERGARMENTS"
            className={`px-4 py-2 rounded-lg ${
              searchParams.category === 'UNDERGARMENTS'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Undergarments
          </a>
          <a
            href="/products?category=JEWELRY"
            className={`px-4 py-2 rounded-lg ${
              searchParams.category === 'JEWELRY'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Jewelry
          </a>
          <a
            href="/products?category=MAKEUP"
            className={`px-4 py-2 rounded-lg ${
              searchParams.category === 'MAKEUP'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Makeup
          </a>
        </div>
        
        {isUndergarments && (
          <div className="flex flex-wrap gap-2 mt-4">
            <a
              href="/products?category=UNDERGARMENTS"
              className={`px-3 py-1.5 rounded-lg text-sm ${
                !searchParams.subcategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Undergarments
            </a>
            {Object.entries(subcategoryLabels).map(([key, label]) => (
              <a
                key={key}
                href={`/products?category=UNDERGARMENTS&subcategory=${key}`}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  searchParams.subcategory === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      {safeProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-12">
          No products found.
        </p>
      )}
    </div>
  )
}

