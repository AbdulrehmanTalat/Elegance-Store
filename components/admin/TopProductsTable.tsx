interface TopProductsTableProps {
  products: Array<{
    id: string
    name: string
    quantity: number
    revenue: number
  }>
}

export default function TopProductsTable({ products }: TopProductsTableProps) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
        <p className="text-gray-500 text-center py-8">No product data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-3 text-sm font-medium text-gray-600">Product</th>
              <th className="pb-3 text-sm font-medium text-gray-600 text-right">Sold</th>
              <th className="pb-3 text-sm font-medium text-gray-600 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center">
                    <span className="mr-3 text-sm text-gray-500">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 text-right text-gray-900">{product.quantity}</td>
                <td className="py-3 text-right font-medium text-gray-900">
                  Rs {product.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
