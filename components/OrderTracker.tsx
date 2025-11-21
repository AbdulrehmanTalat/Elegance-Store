'use client'

import { Check, Clock, Package, Truck } from 'lucide-react'

interface OrderTrackerProps {
  status: string
  createdAt: Date
}

export default function OrderTracker({ status, createdAt }: OrderTrackerProps) {
  const steps = [
    { id: 'PENDING', label: 'Order Placed', icon: Clock },
    { id: 'PROCESSING', label: 'Processing', icon: Package },
    { id: 'SHIPPED', label: 'Shipped', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: Check },
  ]

  const getCurrentStepIndex = () => {
    switch (status) {
      case 'PENDING': return 0
      case 'PROCESSING': return 1
      case 'SHIPPED': return 2
      case 'DELIVERED': return 3
      case 'CANCELLED': return -1
      default: return 0
    }
  }

  const currentStepIndex = getCurrentStepIndex()

  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✕</span>
        </div>
        <h3 className="text-xl font-bold text-red-700 mb-2">Order Cancelled</h3>
        <p className="text-red-600">This order has been cancelled.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 bg-white ${
                    isCompleted
                      ? 'border-primary-600 text-primary-600'
                      : 'border-gray-200 text-gray-300'
                  } ${isCurrent ? 'scale-110 ring-4 ring-primary-100' : ''}`}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span 
                  className={`mt-3 text-sm font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-primary-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {index === 0 && (
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
