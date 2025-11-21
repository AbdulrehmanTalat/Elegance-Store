import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetails from '@/components/ProductDetails'
import ProductReviews from '@/components/reviews/ProductReviews'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import RelatedProducts from '@/components/RelatedProducts'
import ProductViewTracker from '@/components/products/ProductViewTracker'
import RecentlyViewed from '@/components/RecentlyViewed'

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

async function getReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 10, // Limit to top 10 reviews
      orderBy: { createdAt: 'desc' },
    })
    return reviews
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
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
  const productUrl = `https://elegance-store.vercel.app/products/${params.id}`
  
  // Get all product images for OG tags
  const allImages = product.colors?.flatMap(color => color.images) || [product.image].filter(Boolean)
  const ogImages = allImages.slice(0, 4).map(img => ({
    url: img,
    width: 800,
    height: 600,
    alt: product.name,
  }))

  return {
    title: `${product.name} | Elegance Store`,
    description: product.description.substring(0, 160),
    keywords: [
      product.name,
      product.category.toLowerCase(),
      product.subcategory?.toLowerCase(),
      'pakistan',
      'online shopping',
      'premium quality',
    ].filter((k): k is string => Boolean(k)),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      url: productUrl,
      type: 'website',
      images: ogImages.length > 0 ? ogImages : [
        {
          url: displayImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.substring(0, 160),
      images: [displayImage],
    },
    alternates: {
      canonical: productUrl,
    },
  }
}
export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)
  const reviews = await getReviews(params.id)

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

  // Calculate stock status
  const totalStock = hasVariants 
    ? product.colors?.flatMap(c => c.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0) || 0
    : (product as any).stock || 0

  const stockAvailability = totalStock > 0 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/OutOfStock'

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: displayImage,
    brand: {
      '@type': 'Brand',
      name: 'Elegance Store',
    },
    offers: {
      '@type': 'Offer',
      url: `https://elegance-store.vercel.app/products/${product.id}`,
      priceCurrency: 'PKR',
      price: product.basePrice || 0,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: stockAvailability,
      seller: {
        '@type': 'Organization',
        name: 'Elegance Store',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: (product.avgRating || 0) > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is your shipping policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer free shipping on all orders across Pakistan. Orders are processed within 1-2 business days and typically arrive within 3-7 business days.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your return policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a 30-day return policy on all products. Returns are free and hassle-free. Items must be unused and in their original packaging.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I choose the right size?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Please refer to our size guide available on each product page. If you need assistance, our customer support team is available 24/7 to help you find the perfect fit.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I care for this product?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For best results, hand wash in cold water with mild detergent and air dry. Avoid bleach and ironing. Detailed care instructions are included with each product.',
        },
      },
    ],
  }

  // Individual review schema
  const reviewSchemas = reviews.map((review) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Person',
      name: review.user.name || 'Anonymous',
    },
    reviewBody: review.comment || '',
    datePublished: review.createdAt.toISOString(),
    itemReviewed: {
      '@type': 'Product',
      name: product.name,
    },
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      {reviewSchemas.map((reviewSchema, index) => (
        <JsonLd key={index} data={reviewSchema} />
      ))}
      
      <Breadcrumbs
        items={[
          {
            name: product.category.charAt(0) + product.category.slice(1).toLowerCase(),
            href: `/products?category=${product.category}`,
          },
          {
            name: product.name,
            href: `/products/${product.id}`,
          },
        ]}
      />
      
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
      
      <RelatedProducts
        category={product.category}
        currentProductId={product.id}
        subcategory={product.subcategory}
      />

      <RecentlyViewed />

      <ProductViewTracker 
        product={{
          id: product.id,
          name: product.name,
          image: product.image || (product.colors?.[0]?.images?.[0] ?? null),
          basePrice: product.basePrice
        }}
      />
    </div>
  )
}

