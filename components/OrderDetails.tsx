'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Calendar,
  Phone,
  ShoppingBag,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react'
import OrderTracker from './OrderTracker'

export default function OrderDetails({
  order,
  isNew
}: {
  order: any
  isNew: boolean
}) {
  const [showSuccess, setShowSuccess] = useState(isNew)
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Clear cart after component mounts if this is a new order
    if (isNew) {
      clearCart()
      // Hide success animation after 5 seconds
      const timer = setTimeout(() => {
        handleCloseSuccess()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isNew, clearCart])

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    // Remove query params from URL to prevent modal from reappearing on refresh
    router.replace(pathname, { scroll: false })
  }

  const handleDownload = () => {
    // Trigger print dialog for downloading/printing the order
    window.print()
  }

  const handleShare = async () => {
    const orderUrl = window.location.href.split('?')[0] // Remove query params
    
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${order.id.slice(0, 8)}`,
          text: `Check out my order from Elegance Store`,
          url: orderUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(orderUrl)
        alert('Order link copied to clipboard!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        alert('Failed to copy link')
      }
    }
  }

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Confirmed' },
    PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Processing' },
    SHIPPED: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelled' },
  }

  const paymentStatusConfig = {
    PENDING: 'Payment Pending',
    COMPLETED: 'Paid',
    FAILED: 'Payment Failed',
  }

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
  const paymentStatus = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig] || 'Pending'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-3xl p-12 max-w-md mx-4 text-center shadow-2xl transform animate-slideUp">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="text-green-600" size={56} />
            </div>
            <h2 className="text-3xl font-bold mb-3">Order Placed!</h2>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-xl font-bold text-primary-600">{order.id.slice(0, 12)}...</p>
            </div>
            <button
              onClick={handleCloseSuccess}
              type="button"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View Order Details →
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4 inline-flex"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Order Confirmation</h1>
              <p className="text-gray-600">
                Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleDownload}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition flex items-center gap-2"
                title="Download/Print Order"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button 
                onClick={handleShare}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition flex items-center gap-2"
                title="Share Order"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Status</h2>
                  <p className="text-gray-600">Order #{order.id.slice(0, 12)}...</p>
                </div>
                <div className={`px-6 py-3 rounded-full border-2 font-bold ${currentStatus.color}`}>
                  {currentStatus.label}
                </div>
              </div>

              {/* Progress Timeline */}
              <OrderTracker status={order.status} createdAt={order.createdAt} />
            </div>

            {/*  Order Items Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any) => {
                  const imageUrl = item.variant?.color?.images?.[0] || 
                                  item.product.image || 
                                  item.product.colors?.[0]?.images?.[0]
                  
                  return (
                    <div key={item.id} className="flex gap-6 pb-6 border-b last:border-0">
                      <div className="relative w-28 h-28 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.product.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.colorName && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Color:</span> {item.colorName}
                            </span>
                          )}
                          {item.bandSize && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Band:</span> {item.bandSize}
                            </span>
                          )}
                          {item.cupSize && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Cup:</span> {item.cupSize}
                            </span>
                          )}
                          {!item.bandSize && !item.cupSize && item.variant?.size && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                              <span className="text-gray-500">Size:</span> {item.variant.size}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-2xl font-bold text-primary-600">
                            Rs {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t-2 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">Rs {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-3 border-t-2">
                  <span>Total</span>
                  <span className="text-primary-600">Rs {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <MapPin className="text-primary-600" size={20} />
                </div>
                <h3 className="font-bold text-lg">Delivery Address</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{order.shippingAddress}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Phone size={16} className="text-gray-500" />
                <span className="text-gray-700">{order.phone}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <CreditCard className="text-primary-600" size={20} />
                </div>
                <h3 className="font-bold text-lg">Payment</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Method</p>
                  <p className="font-semibold">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.paymentStatus === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800' 
                      : order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Date */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-6 border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="text-primary-600" size={20} />
                <h3 className="font-bold">Order Date</h3>
              </div>
              <p className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(order.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Have questions about your order? We're here to help!
              </p>
              <Link
                href="/contact"
                className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        @media print {
          /* Hide elements that shouldn't be printed */
          button,
          .no-print,
          [title="Download/Print Order"],
          [title="Share Order"] {
            display: none !important;
          }
          
          /* Optimize layout for printing */
          body {
            background: white !important;
          }
          
          /* Remove shadows and make cards flat */
          .shadow-lg,
          .shadow-md,
          .shadow-xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          
          /* Single column for print */
          .grid {
            display: block !important;
            width: 100% !important;
          }
          
          .lg\:col-span-2,
          .lg\:col-span-1 {
            width: 100% !important;
            margin-bottom: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
