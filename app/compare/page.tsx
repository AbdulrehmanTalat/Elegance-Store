import ProductComparison from '@/components/ProductComparison'

export const metadata = {
  title: 'Compare Products | Elegance Store',
  description: 'Compare products side-by-side to make the best choice',
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <a href="/" className="hover:text-primary-600 transition">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Compare Products</span>
        </nav>

        <ProductComparison />
      </div>
    </div>
  )
}
