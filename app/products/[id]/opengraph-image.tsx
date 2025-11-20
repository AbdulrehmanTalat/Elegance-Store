import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      colors: {
        include: {
          variants: true,
        },
      },
    },
  })

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to right, #ec4899, #a855f7)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Product Not Found
        </div>
      ),
      {
        ...size,
      }
    )
  }

  const displayImage = product.colors?.[0]?.images?.[0] || product.image
  const price = product.basePrice || 0

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '30px',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '60px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Product Image */}
          {displayImage && (
            <div
              style={{
                width: '450px',
                height: '450px',
                borderRadius: '20px',
                overflow: 'hidden',
                marginRight: '60px',
                display: 'flex',
              }}
            >
              <img
                src={displayImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Product Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #ec4899, #a855f7)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '40px',
              }}
            >
              Rs {price.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 36,
                color: '#6b7280',
                fontWeight: '600',
              }}
            >
              Elegance Store
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
