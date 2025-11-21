import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminGuard from '@/components/admin/AdminGuard'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    redirect('/')
  }

  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/admin/dashboard" className="text-2xl font-bold text-primary-600">
                  Admin Panel
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {session.user.email}
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                    {isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>
                </span>
                <Link href="/" className="text-sm text-gray-600 hover:text-primary-600">
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <nav className="flex gap-4 flex-wrap">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
              >
                Orders
              </Link>
              <Link
                href="/admin/coupons"
                className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
              >
                Coupons
              </Link>
              {isSuperAdmin && (
                <>
                  <Link
                    href="/admin/manage-admins"
                    className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
                  >
                    Manage Admins
                  </Link>
                  <Link
                    href="/admin/audit-logs"
                    className="px-4 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition"
                  >
                    Audit Logs
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Main Content */}
          {children}
        </div>
      </div>
    </AdminGuard>
  )
}
