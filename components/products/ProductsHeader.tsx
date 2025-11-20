'use client'

import SortDropdown from './SortDropdown'

interface ProductsHeaderProps {
  count: number
}

export default function ProductsHeader({ count }: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {count} {count === 1 ? 'Product' : 'Products'} Found
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Discover our curated collection
        </p>
      </div>

      <SortDropdown />
    </div>
  )
}
