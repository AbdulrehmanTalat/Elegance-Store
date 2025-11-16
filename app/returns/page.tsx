import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Returns & Exchanges - Elegance Store',
  description: 'Return and exchange policy for Elegance Store',
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Returns & Exchanges</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
            <p className="text-gray-600 mb-4">
              We want you to be completely satisfied with your purchase. If you're not happy with your order, 
              we're here to help.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Return Window</h3>
            <p className="text-gray-600">
              You have <strong className="text-gray-900">7 days</strong> from the date of delivery to initiate a return or exchange.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Return Conditions</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Items must be unused, unwashed, and in their original condition</li>
              <li>• Original tags and packaging must be intact</li>
              <li>• Items must be in their original packaging if applicable</li>
              <li>• Undergarments and intimate items are non-returnable for hygiene reasons</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">How to Return</h3>
            <ol className="space-y-2 text-gray-600 list-decimal list-inside">
              <li>Contact us via email with your order number and reason for return</li>
              <li>We'll provide you with return instructions and a return authorization</li>
              <li>Package the item securely and send it back to us</li>
              <li>Once we receive and inspect the item, we'll process your refund or exchange</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Refunds</h3>
            <p className="text-gray-600 mb-2">
              Refunds will be processed to the original payment method within 5-7 business days 
              after we receive and inspect the returned item.
            </p>
            <p className="text-gray-600">
              Shipping charges are non-refundable unless the return is due to our error.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Exchanges</h3>
            <p className="text-gray-600">
              Exchanges are subject to product availability. If the item you want is out of stock, 
              we'll process a refund instead. Please contact us to arrange an exchange.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

