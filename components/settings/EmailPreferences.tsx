'use client'

import { useState, useEffect } from 'react'
import { Mail, Bell, Package, TrendingUp, Shield, Check } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface EmailPreferences {
  emailOrderConfirmation: boolean
  emailShippingUpdates: boolean
  emailOrderStatus: boolean
  emailMarketing: boolean
  emailAccountUpdates: boolean
}

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    emailOrderConfirmation: true,
    emailShippingUpdates: true,
    emailOrderStatus: true,
    emailMarketing: false,
    emailAccountUpdates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/user/email-preferences')
      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/email-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (res.ok) {
        showSuccess('Email preferences updated successfully!')
      } else {
        throw new Error('Failed to update preferences')
      }
    } catch (error) {
      showError('Failed to update email preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const preferenceConfig = [
    {
      key: 'emailOrderConfirmation' as keyof EmailPreferences,
      icon: Check,
      title: 'Order Confirmations',
      description: 'Receive confirmation emails when you place an order',
      recommended: true,
    },
    {
      key: 'emailShippingUpdates' as keyof EmailPreferences,
      icon: Package,
      title: 'Shipping Updates',
      description: 'Get notified when your order ships and arrives',
      recommended: true,
    },
    {
      key: 'emailOrderStatus' as keyof EmailPreferences,
      icon: Bell,
      title: 'Order Status Updates',
      description: 'Receive updates about order processing and status changes',
      recommended: true,
    },
    {
      key: 'emailMarketing' as keyof EmailPreferences,
      icon: TrendingUp,
      title: 'Promotional Emails',
      description: 'Stay updated on sales, new arrivals, and special offers',
      recommended: false,
    },
    {
      key: 'emailAccountUpdates' as keyof EmailPreferences,
      icon: Shield,
      title: 'Account Notifications',
      description: 'Important updates about your account and security',
      recommended: true,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Preferences</h2>
            <p className="text-gray-600">Manage how we communicate with you</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {preferenceConfig.map((config) => {
            const Icon = config.icon
            const isEnabled = preferences[config.key]
            
            return (
              <div
                key={config.key}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary-200 hover:bg-primary-25/50 transition-all"
              >
                <div className={`p-2.5 rounded-lg ${isEnabled ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{config.title}</h3>
                    {config.recommended && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>

                <button
                  onClick={() => handleToggle(config.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isEnabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            You can update these preferences anytime
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
