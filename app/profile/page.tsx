'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ToastProvider'
import { RotateCcw, User, Mail, Phone, MapPin, Lock, Save, Edit2 } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Pass words don't match",
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items?: Array<{
    productId: string
    quantity: number
    product: {
      name: string
      image: string
      price: number
    }
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (session) {
      fetchOrders()
      fetchProfile()
    }
  }, [session, status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        reset(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (orderId: string) => {
    setReordering(orderId)
    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const result = await response.json()

      if (!response.ok) {
        showError(result.error || 'Failed to reorder')
        return
      }

      for (const item of result.items) {
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
          })
        }
      }

      showSuccess('Items added to cart!')
      router.push('/cart')
    } catch (error) {
      console.error('Error reordering:', error)
      showError('An error occurred while reordering')
    } finally {
      setReordering(null)
    }
  }

  const onSubmitProfile = async (data: ProfileFormData) => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      showSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      showSuccess('Password changed successfully!')
      resetPassword()
    } catch (err: any) {
      showError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto glass-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/profile')}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">My Profile</span>
          </h1>
          <p className="text-xl text-gray-600">Manage your account settings and orders</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-white p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('name')}
                        type="text"
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all disabled:bg-gray-50"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        disabled
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        disabled={!isEditing}
                        placeholder="+92 300 1234567"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      {...register('city')}
                      type="text"
                      disabled={!isEditing}
                      placeholder="Karachi"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-4 top-4 text-gray-400" />
                    <textarea
                      {...register('address')}
                      rows={2}
                      disabled={!isEditing}
                      placehold="123 Main Street..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input {...register('state')} type="text" disabled={!isEditing} placeholder="Sindh" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all disabled:bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Zip Code</label>
                    <input {...register('zipCode')} type="text" disabled={!isEditing} placeholder="75500" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all disabled:bg-gray-50" />
                  </div>
                </div>

                {isEditing && (
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><Save size={20} />Save Changes</>}
                  </button>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="glass-white p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password *</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input {...registerPassword('currentPassword')} type="password" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" />
                  </div>
                  {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password *</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input {...registerPassword('newPassword')} type="password" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" />
                  </div>
                  {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input {...registerPassword('confirmPassword')} type="password" className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all" />
                  </div>
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : <><Lock size={20} />Change Password</>}
                </button>
              </form>
            </div>
          </div>

          {/* Orders Sidebar */}
          <div className="glass-white p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="block p-4 border-2 border-gray-100 rounded-xl hover:border-pink-500 transition-all">
                    <p className="font-semibold text-sm mb-1">#{order.id.slice(0, 8)}</p>
                    <p className="text-pink-600 font-bold">Rs {order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.status}</p>
                  </Link>
                ))}
                {orders.length > 5 && (
                  <Link href="/orders" className="block text-center py-2 text-pink-600 hover:underline text-sm font-semibold">
                    View All Orders →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
