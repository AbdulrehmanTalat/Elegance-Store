import type { Metadata } from 'next'
import { Package, RotateCcw, CheckCircle, XCircle, AlertCircle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Exchanges - Elegance Store',
  description: 'Return and exchange policy for Elegance Store - Easy returns within 7 days',
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Exchanges</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your satisfaction is our priority. We offer hassle-free returns and exchanges within 7 days.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">7 Days Return</h3>
              <p className="text-gray-600 text-sm">Easy returns within 7 days of delivery</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Free Exchanges</h3>
              <p className="text-gray-600 text-sm">Subject to availability of products</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Quick Refunds</h3>
              <p className="text-gray-600 text-sm">Processed within 5-7 business days</p>
            </div>
          </div>

          {/* Return Policy Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Return Window */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <AlertCircle className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Return Window</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You have <span className="font-bold text-primary-600">7 days</span> from the date of delivery 
                to initiate a return or exchange. Items must be returned in their original condition to qualify 
                for a refund or exchange.
              </p>
            </section>

            <div className="border-t"></div>

            {/* Eligible Items */}
            <section>
              <h2 className="text-2xl font-bold mb-4">✅ Eligible for Return</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Items with original tags and packaging intact</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Unused, unwashed, and unworn items</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Jewelry and makeup in sealed, unopened condition</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Items ordered in wrong size/color (with proof)</span>
                </li>
              </ul>
            </section>

            <div className="border-t"></div>

            {/* Non-Returnable Items */}
            <section>
              <h2 className="text-2xl font-bold mb-4">❌ Non-Returnable Items</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">
                      <strong>Undergarments and intimate apparel</strong> - For hygiene and health reasons
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">
                      <strong>Opened makeup or beauty products</strong> - Once seal is broken
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">
                      <strong>Items without tags</strong> - Original tags must be attached
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">
                      <strong>Sale/Clearance items</strong> - Unless defective
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t"></div>

            {/* How to Return */}
            <section>
              <h2 className="text-2xl font-bold mb-4">📦 How to Return an Item</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Contact Us</h3>
                    <p className="text-gray-700">
                      Email us at <a href="mailto:htesting22@gmail.com" className="text-primary-600 hover:underline">htesting22@gmail.com</a> with 
                      your order number and reason for return. Include photos if the item is damaged or defective.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Get Authorization</h3>
                    <p className="text-gray-700">
                      We'll review your request and send you a Return Authorization (RA) number along with 
                      return shipping instructions within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Pack & Ship</h3>
                    <p className="text-gray-700">
                      Securely package the item with all original tags and packaging. Include your RA number 
                      inside the package and ship to the provided address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Get Your Refund</h3>
                    <p className="text-gray-700">
                      Once we receive and inspect your return, we'll process your refund or exchange within 
                      5-7 business days. You'll receive a confirmation email.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Refund Information */}
            <section>
              <h2 className="text-2xl font-bold mb-4">💰 Refund Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <p className="text-gray-700">
                  <strong>Refund Method:</strong> Refunds will be processed to your original payment method 
                  (bank account for COD orders, original card for online payments).
                </p>
                <p className="text-gray-700">
                  <strong>Processing Time:</strong> 5-7 business days after we receive your return.
                </p>
                <p className="text-gray-700">
                  <strong>Shipping Costs:</strong> Original shipping charges are non-refundable unless the 
                  return is due to our error (wrong item, defective product).
                </p>
                <p className="text-gray-700">
                  <strong>Return Shipping:</strong> Customer is responsible for return shipping costs unless 
                  the item is defective or we sent the wrong item.
                </p>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Exchanges */}
            <section>
              <h2 className="text-2xl font-bold mb-4">🔄 Exchanges</h2>
              <p className="text-gray-700 mb-4">
                We're happy to exchange items for a different size, color, or style, subject to availability.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Exchanges follow the same process as returns</li>
                <li>• If your desired item is unavailable, we'll process a refund</li>
                <li>• Exchange shipping is free if the error was ours</li>
                <li>• One free exchange per order (additional exchanges may incur shipping fees)</li>
              </ul>
            </section>

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-6 text-center">
              <Mail className="mx-auto mb-3" size={40} />
              <h3 className="text-xl font-bold mb-2">Need Help with a Return?</h3>
              <p className="mb-4 opacity-90">Our customer service team is here to assist you</p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
