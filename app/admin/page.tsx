'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Key, Palette } from 'lucide-react'
import ProductModal from '@/components/ProductModal'
import ProductVariantModal from '@/components/ProductVariantModal'
import { useToast } from '@/components/ToastProvider'

interface Product {
  id: string
  name: string
  description: string
  basePrice?: number | null
  image?: string | null
  category: string
  subcategory?: string | null
  isActive: boolean
  colors?: any[]
  // Legacy fields for backward compatibility
  price?: number
  stock?: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showSuccess } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<string | null>(null)
  const [variantColors, setVariantColors] = useState<any[]>([])
  const [variantVariants, setVariantVariants] = useState<any[]>([])
  const [productSubcategory, setProductSubcategory] = useState<string | null>(null)

  useEffect(() => {
    // Middleware handles authentication - don't redirect here
    // Just wait for session to load and fetch products
    if (status === 'loading') return

    // If we have an admin session, fetch products
    if (session && session.user.role === 'ADMIN') {
      fetchProducts()
    }
    // If no session or not admin, middleware will handle redirect
  }, [session, status])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?admin=true')
      
      if (!response.ok) {
        console.error('Failed to fetch products:', response.statusText)
        setProducts([])
        return
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data)
      } else {
        console.error('Invalid products data:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleManageVariants = async (productId: string) => {
    setSelectedProductForVariants(productId)
    try {
      const response = await fetch(`/api/products/${productId}/variants`)
      const data = await response.json()
      setVariantColors(data.colors || [])
      setVariantVariants(data.variants || [])
      setProductSubcategory(data.product?.subcategory || null)
      setShowVariantModal(true)
    } catch (error) {
      console.error('Error fetching variants:', error)
      setVariantColors([])
      setVariantVariants([])
      setProductSubcategory(null)
      setShowVariantModal(true)
    }
  }

  const handleSaveVariants = async (colors: any[], variants: any[]) => {
    if (!selectedProductForVariants) return

    // Format variants: convert price and stock to numbers
    const formattedVariants = variants.map((v) => ({
      ...v,
      price: parseFloat(v.price),
      stock: parseInt(v.stock),
    }))

    const response = await fetch(`/api/products/${selectedProductForVariants}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colors, variants: formattedVariants }),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Failed to save variants')
    }

    setShowVariantModal(false)
    setSelectedProductForVariants(null)
    fetchProducts()
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords don't match")
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.error || 'Failed to change password')
        return
      }

      showSuccess('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Panel</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center space-x-2"
          >
            <Key size={20} />
            <span>Change Password</span>
          </button>
          <button
            onClick={handleAdd}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-primary-600 hover:underline"
        >
          View Orders →
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Subcategory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Base Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Variants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <img
                    src={product.image || (product.colors?.[0]?.images?.[0]) || 'https://via.placeholder.com/64'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 font-medium">{product.name}</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">
                  {product.subcategory 
                    ? product.subcategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  {product.basePrice ? `Rs ${product.basePrice.toFixed(2)}` : 'Variants'}
                </td>
                <td className="px-6 py-4">
                  {product.colors && product.colors.length > 0 ? (
                    <span className="text-blue-600">
                      {product.colors.length} color{product.colors.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">No variants</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleManageVariants(product.id)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Manage Variants"
                    >
                      <Palette size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Product"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-8 text-gray-500">No products found.</p>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setEditingProduct(null)
            fetchProducts()
          }}
        />
      )}

      {showVariantModal && selectedProductForVariants && (
        <ProductVariantModal
          productId={selectedProductForVariants}
          colors={variantColors}
          variants={variantVariants}
          productSubcategory={productSubcategory}
          onClose={() => {
            setShowVariantModal(false)
            setSelectedProductForVariants(null)
            setProductSubcategory(null)
          }}
          onSave={handleSaveVariants}
        />
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                  setPasswordError('')
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                    setPasswordError('')
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

