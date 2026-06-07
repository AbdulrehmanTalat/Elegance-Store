import Link from 'next/link'
import { ShoppingBag, Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        {/* Abstract 404 Design */}
        <div className="relative mb-8 flex justify-center items-center">
          <h1 className="text-[150px] md:text-[200px] font-black text-gray-100 select-none leading-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-2xl animate-bounce">
              <Search className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/products"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
          >
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
