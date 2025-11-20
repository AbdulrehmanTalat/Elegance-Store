import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import OrderDetails from '@/components/OrderDetails'

async function getOrder(id: string, userId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                colors: {
                  include: {
                    variants: true,
                  },
                },
              },
            },
            variant: {
              include: {
                color: true,
              },
            },
          },
        },
      },
    })

    if (!order || order.userId !== userId) {
      return null
    }

    return order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { success?: string; new?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const order = await getOrder(params.id, session.user.id)

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package size={64} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">
            We couldn't find the order you're looking for.
          </p>
          <Link
            href="/orders"
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition"
          >
            View All Orders
          </Link>
        </div>
      </div>
    )
  }

  const isNew = searchParams.success === 'true' || searchParams.new === 'true'

  // Pass the order object to the client component
  // Note: Next.js automatically serializes Date objects in props passed from Server to Client components in recent versions.
  // If issues arise, we might need to convert dates to strings here.
  return <OrderDetails order={order} isNew={isNew} />
}
