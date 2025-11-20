import type { Metadata } from 'next'
import { Truck, Package, MapPin, Clock, DollarSign, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Info - Elegance Store',
  description: 'Shipping information and delivery details for Elegance Store - Fast delivery across Pakistan',
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We deliver across Pakistan with reliable courier services. Track your order every step of the way!
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">2-7 days delivery nationwide</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Packaging</h3>
              <p className="text-gray-600 text-sm">Protected & discrete delivery</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Order Tracking</h3>
              <p className="text-gray-600 text-sm">Real-time tracking updates</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Shipping Methods */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Truck className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Delivery Options</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="text-blue-600" size={20} />
                    <h3 className="text-xl font-bold text-blue-900">Standard Shipping</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    <strong className="text-blue-900">5-7 Business Days</strong>
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    Available to all cities across Pakistan via TCS, Leopards, or PostEx courier services.
                  </p>
                  <p className="text-blue-900 font-semibold">
                    Rs 150 - 250 <span className="text-sm font-normal text-gray-600">(based on location)</span>
                  </p>
                </div>

                <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="text-green-600" size={20} />
                    <h3 className="text-xl font-bold text-green-900">Express Shipping</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    <strong className="text-green-900">2-3 Business Days</strong>
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    Available in major cities: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, and more.
                  </p>
                  <p className="text-green-900 font-semibold">
                    Rs 300 - 400 <span className="text-sm font-normal text-gray-600">(based on location)</span>
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Free Shipping */}
            <section>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={32} />
                  <h2 className="text-2xl font-bold">Free Shipping Offer! 🎉</h2>
                </div>
                <p className="text-lg opacity-95 mb-2">
                  Get <strong>FREE Standard Shipping</strong> on all orders over <strong>Rs 3,000</strong>
                </p>
                <p className="text-sm opacity-90">
                  Automatically applied at checkout! No coupon code needed.
                </p>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Delivery Areas */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <MapPin className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Delivery Coverage</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2 text-green-700">✅ Major Cities (Express Available)</h3>
                  <p className="text-gray-700">
                    Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Hyderabad, Peshawar, 
                    Quetta, Sialkot, Gujranwala, and more.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2 text-blue-700">📦 All Pakistan (Standard Shipping)</h3>
                  <p className="text-gray-700">
                    We deliver to all cities, towns, and accessible areas across Pakistan. If you're unsure 
                    about delivery to your area, please contact us before placing your order.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Order Processing */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Clock className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Order Processing Time</h2>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-gray-700 mb-3">
                  <strong>Processing:</strong> Orders are typically processed and dispatched within <strong>1-2 business days</strong> 
                  after payment confirmation.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Weekends:</strong> Orders placed on weekends or public holidays will be processed on the next working day.
                </p>
                <p className="text-gray-700">
                  <strong>Stock Availability:</strong> If an item is out of stock, we'll notify you immediately with options 
                  to wait, substitute, or cancel.
                </p>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Order Tracking */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Package className="text-primary-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Track Your Order</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Order Confirmation</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive an email confirmation immediately after placing your order.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Dispatch Notification</h3>
                    <p className="text-gray-600 text-sm">
                      Once your order is shipped, we'll send you a tracking number via email and SMS.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-Time Tracking</h3>
                    <p className="text-gray-600 text-sm">
                      Use the tracking number on the courier's website to track your package in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Delivery</h3>
                    <p className="text-gray-600 text-sm">
                      Our courier partner will contact you before delivery. Please ensure someone is available to receive the package.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t"></div>

            {/* Important Notes */}
            <section>
              <h2 className="text-2xl font-bold mb-4">📌 Important Information</h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <p>
                    <strong>Delivery Delays:</strong> During peak seasons (Eid, sales, etc.), deliveries may take 1-2 extra days.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <p>
                    <strong>Remote Areas:</strong> Delivery to remote or hard-to-reach areas may incur additional charges and time.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <p>
                    <strong>Address Accuracy:</strong> Please ensure your delivery address and contact number are correct to avoid delays.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <p>
                    <strong>Customs/Duties:</strong> Not applicable for domestic Pakistan orders.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <p>
                    <strong>Discrete Packaging:</strong> All orders are packaged discretely with no indication of contents on the outside.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact for Shipping Questions */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Questions About Shipping?</h3>
              <p className="mb-4 opacity-90">Need help with delivery or have special requirements?</p>
              <a 
                href="/contact" 
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Contact Our Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
