import { prisma } from '@/lib/prisma'
import ProductCard from './ProductCard'

interface RelatedProductsProps {
  category: string
  currentProductId: string
  subcategory?: string | null
}

async function getRelatedProducts(category: string, currentProductId: string, subcategory?: string | null) {
  const where: any = {
    isActive: true,
    category,
    id: { not: currentProductId },
  }

  if (subcategory) {
    where.subcategory = subcategory
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
    take: 4,
    orderBy: { avgRating: 'desc' },
  })

  return products
}

export default async function RelatedProducts({
  category,
  currentProductId,
  subcategory,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(category, currentProductId, subcategory)

  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          <span className="text-gradient">You May Also Like</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
