import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetails from '@/components/ProductDetails'

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        colors: {
          include: {
            variants: true,
          },
        },
      },
    })
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product || !product.isActive) {
    notFound()
  }

  const hasVariants = product.colors && product.colors.length > 0
  const displayImage = hasVariants && product.colors[0]?.images?.[0]
    ? product.colors[0].images[0]
    : product.image || null

  // Flatten variants with color names
  const allVariants = product.colors?.flatMap((color) =>
    color.variants.map((v) => ({
      ...v,
      colorId: color.id,
      colorName: color.name,
    }))
  ) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails
        productId={product.id}
        productName={product.name}
        description={product.description}
        category={product.category}
        basePrice={product.basePrice}
        image={product.image}
        hasVariants={hasVariants}
        colors={product.colors || []}
        variants={allVariants}
        product={hasVariants ? undefined : product}
      />
    </div>
  )
}

