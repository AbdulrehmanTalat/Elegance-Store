import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Info - Elegance Store',
  description: 'Shipping information and delivery details for Elegance Store',
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Shipping Information</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Delivery Options</h2>
            <p className="text-gray-600 mb-4">
              We offer shipping throughout Pakistan with reliable delivery partners.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Shipping Methods</h3>
            <ul className="space-y-3 text-gray-600">
              <li>
                <strong className="text-gray-900">Standard Shipping:</strong> 5-7 business days
              </li>
              <li>
                <strong className="text-gray-900">Express Shipping:</strong> 2-3 business days (available in major cities)
              </li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Shipping Costs</h3>
            <p className="text-gray-600 mb-2">
              Shipping charges are calculated at checkout based on your location and order size.
            </p>
            <p className="text-gray-600">
              Free shipping may be available for orders above a certain amount. Check your cart for details.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Order Tracking</h3>
            <p className="text-gray-600">
              Once your order is shipped, you will receive a tracking number via email. 
              You can use this to track your package's journey to your doorstep.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Delivery Areas</h3>
            <p className="text-gray-600">
              We currently deliver to all major cities and towns across Pakistan. 
              If you're unsure about delivery to your area, please contact us before placing your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

