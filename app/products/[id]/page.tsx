import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetails from '@/components/ProductDetails'
import ProductReviews from '@/components/reviews/ProductReviews'
import JsonLd from '@/components/JsonLd'

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Product Not Found | Elegance Store',
    }
  }

  const displayImage = product.colors?.[0]?.images?.[0] || product.image || '/og-image.jpg'

  return {
    title: `${product.name} | Elegance Store`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [
        {
          url: displayImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: displayImage,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: (product.avgRating || 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
    } : undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://elegance-store.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category.charAt(0) + product.category.slice(1).toLowerCase(),
        item: `https://elegance-store.vercel.app/products?category=${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://elegance-store.vercel.app/products/${product.id}`,
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
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
      
      <ProductReviews 
        productId={product.id}
        avgRating={product.avgRating || 0}
        reviewCount={product.reviewCount || 0}
      />
    </div>
  )
}

