'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  basePrice: z.string().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
    message: 'Price must be a positive number',
  }).optional(),
  image: z.string().optional(),
  category: z.enum(['UNDERGARMENTS', 'JEWELRY', 'MAKEUP']),
  subcategory: z.enum(['LINGERIE', 'BRA', 'PANTIES', 'BRA_PANTIES_SET', 'THONGS', 'BIKINI', 'LOUNGE_WEAR', 'PLUS_SIZE_LINGERIE']).optional().nullable(),
  isActive: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

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

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProductModal({
  product,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image || null
  )
  const [uploading, setUploading] = useState(false)
  
  // Variant management state
  const [colors, setColors] = useState<Array<{ name: string; images: string[] }>>([])
  const [variants, setVariants] = useState<Array<{
    colorName: string
    bandSize?: string
    cupSize?: string
    size?: string
    price: string
    stock: string
  }>>([])
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
        defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          basePrice: (product as any).basePrice?.toString() || '',
          image: (product as any).image || '',
          category: product.category as 'UNDERGARMENTS' | 'JEWELRY' | 'MAKEUP',
          subcategory: (product as any).subcategory as 'LINGERIE' | 'BRA' | 'PANTIES' | 'BRA_PANTIES_SET' | 'THONGS' | 'BIKINI' | 'LOUNGE_WEAR' | 'PLUS_SIZE_LINGERIE' | null || null,
          isActive: product.isActive,
        }
      : {
          isActive: true,
        },
  })

  // Size type selection - admin can choose between band/cup size or regular sizes
  const [sizeType, setSizeType] = useState<'bandCup' | 'regular'>('regular')
  
  // Determine size type based on subcategory (after watch is initialized)
  const selectedCategory = watch('category')
  const selectedSubcategory = watch('subcategory')
  
  // Auto-select size type based on subcategory, but allow manual override
  useEffect(() => {
    if (selectedSubcategory === 'BRA' || selectedSubcategory === 'BRA_PANTIES_SET') {
      setSizeType('bandCup')
    } else if (selectedCategory === 'UNDERGARMENTS') {
      setSizeType('regular')
    }
  }, [selectedSubcategory, selectedCategory])
  
  const useBandCupSize = sizeType === 'bandCup'
  const useRegularSize = sizeType === 'regular'

  useEffect(() => {
    if (product) {
      const productImage = (product as any).image || ''
      reset({
        name: product.name,
        description: product.description,
        basePrice: (product as any).basePrice?.toString() || '',
        image: productImage,
        category: product.category as 'UNDERGARMENTS' | 'JEWELRY' | 'MAKEUP',
        subcategory: (product as any).subcategory as 'LINGERIE' | 'BRA' | 'PANTIES' | 'BRA_PANTIES_SET' | 'THONGS' | 'BIKINI' | 'LOUNGE_WEAR' | 'PLUS_SIZE_LINGERIE' | null || null,
        isActive: product.isActive,
      })
      setImagePreview(productImage)
      
      // Load existing variants if product has colors
      if ((product as any).colors && Array.isArray((product as any).colors)) {
        const productColors = (product as any).colors.map((c: any) => ({
          name: c.name,
          images: c.images || [],
        }))
        setColors(productColors)
        
        // Load variants
        const productVariants = (product as any).colors.flatMap((color: any) =>
          (color.variants || []).map((v: any) => ({
            colorName: color.name,
            bandSize: v.bandSize || undefined,
            cupSize: v.cupSize || undefined,
            size: v.size || undefined,
            price: v.price?.toString() || '',
            stock: v.stock?.toString() || '0',
          }))
        )
        setVariants(productVariants)
        
        // Detect size type from existing variants
        if (productVariants.length > 0) {
          const hasBandCup = productVariants.some((v: any) => v.bandSize || v.cupSize)
          if (hasBandCup) {
            setSizeType('bandCup')
          } else {
            setSizeType('regular')
          }
        }
      }
    } else {
      // Reset variants when creating new product
      setColors([])
      setVariants([])
    }
  }, [product, reset])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setImageFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Failed to upload image')
    }

    const result = await response.json()
    return result.url
  }

  // Variant management functions
  const addColor = () => {
    setColors([...colors, { name: '', images: [] }])
  }

  const removeColor = (index: number) => {
    const colorToRemove = colors[index]
    setVariants(variants.filter(v => v.colorName !== colorToRemove.name))
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColorName = (index: number, name: string) => {
    const updated = [...colors]
    updated[index].name = name
    setColors(updated)
  }

  const handleColorImageUpload = async (colorIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    const uploadKey = `${colorIndex}-${Date.now()}`
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }))
    setError('')

    try {
      const imageUrl = await uploadImage(file)
      const updated = [...colors]
      updated[colorIndex].images.push(imageUrl)
      setColors(updated)
    } catch (uploadError: any) {
      setError(uploadError.message || 'Failed to upload image')
    } finally {
      setUploadingImages(prev => {
        const newState = { ...prev }
        delete newState[uploadKey]
        return newState
      })
    }
  }

  const removeImageFromColor = (colorIndex: number, imageIndex: number) => {
    const updated = [...colors]
    updated[colorIndex].images.splice(imageIndex, 1)
    setColors(updated)
  }

  const addVariant = (colorName: string) => {
    setVariants([
      ...variants,
      {
        colorName,
        bandSize: useBandCupSize ? '' : undefined,
        cupSize: useBandCupSize ? '' : undefined,
        size: useRegularSize ? '' : undefined,
        price: '',
        stock: '0',
      },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants]
    ;(updated[index] as any)[field] = value
    setVariants(updated)
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    setError('')

    try {
      let imageUrl = data.image || null

      // Upload new image if file is selected
      if (imageFile) {
        setUploading(true)
        try {
          imageUrl = await uploadImage(imageFile)
          // Update form value with the uploaded image URL
          setValue('image', imageUrl)
        } catch (uploadError: any) {
          setError(uploadError.message || 'Failed to upload image')
          setLoading(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      const url = product
        ? `/api/products/${product.id}`
        : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const payload: any = {
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.category === 'UNDERGARMENTS' ? (data.subcategory || null) : null,
        isActive: data.isActive,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : null,
        image: imageUrl || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Failed to save product')
        return
      }

      const result = await response.json()
      const productId = result.id || product?.id

      // Save variants if colors/variants are provided and category is UNDERGARMENTS
      if (productId && selectedCategory === 'UNDERGARMENTS' && colors.length > 0) {
        try {
          // Format variants for API
          const formattedVariants = variants.map((v) => ({
            ...v,
            price: parseFloat(v.price),
            stock: parseInt(v.stock),
          }))

          const variantResponse = await fetch(`/api/products/${productId}/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colors, variants: formattedVariants }),
          })

          if (!variantResponse.ok) {
            const variantResult = await variantResponse.json()
            setError(variantResult.error || 'Product saved but failed to save variants')
            return
          }
        } catch (variantError) {
          console.error('Error saving variants:', variantError)
          setError('Product saved but failed to save variants')
          return
        }
      }

      onSuccess()
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              rows={4}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base Price (Optional - for products without variants)</label>
            <input
              type="number"
              step="0.01"
              {...register('basePrice')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Leave empty if using variants"
            />
            {errors.basePrice && (
              <p className="text-red-600 text-sm mt-1">{errors.basePrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            {imagePreview && (
              <div className="mb-3 relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <Upload size={20} />
                <span>{imageFile ? 'Change Image' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setValue('image', '')
                  }}
                  className="text-red-600 hover:text-red-700 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload a product image (max 5MB). JPG, PNG, or WebP formats supported.
            </p>
            {errors.image && (
              <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              {...register('category')}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              onChange={(e) => {
                register('category').onChange(e)
                // Clear subcategory if category is not UNDERGARMENTS
                if (e.target.value !== 'UNDERGARMENTS') {
                  setValue('subcategory', null)
                }
              }}
            >
              <option value="UNDERGARMENTS">Undergarments</option>
              <option value="JEWELRY">Jewelry</option>
              <option value="MAKEUP">Makeup</option>
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {watch('category') === 'UNDERGARMENTS' && (
            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <select
                {...register('subcategory')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Select Subcategory</option>
                <option value="LINGERIE">Lingerie</option>
                <option value="BRA">Bra</option>
                <option value="PANTIES">Panties</option>
                <option value="BRA_PANTIES_SET">Bra Panties Set</option>
                <option value="THONGS">Thongs</option>
                <option value="BIKINI">Bikini</option>
                <option value="LOUNGE_WEAR">Lounge Wear</option>
                <option value="PLUS_SIZE_LINGERIE">Plus Size Lingerie</option>
              </select>
              {errors.subcategory && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.subcategory.message}
                </p>
              )}
            </div>
          )}

          {/* Colors and Variants Section - Only for UNDERGARMENTS */}
          {watch('category') === 'UNDERGARMENTS' && (
            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Colors & Sizes</h3>
                  <p className="text-sm text-gray-600">
                    Add colors with images and sizes for each color
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addColor}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Color
                </button>
              </div>

              {/* Size Type Selection */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold mb-3">Size Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sizeType"
                      value="regular"
                      checked={sizeType === 'regular'}
                      onChange={(e) => setSizeType(e.target.value as 'regular')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Regular Sizes (XS, S, M, L, XL, etc.)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sizeType"
                      value="bandCup"
                      checked={sizeType === 'bandCup'}
                      onChange={(e) => setSizeType(e.target.value as 'bandCup')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Band Size + Cup Size (34, 36, 38 + 75B, 75C, 80B, etc.)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {colors.map((color, colorIndex) => {
                  const colorVariants = variants.filter(v => v.colorName === color.name)
                  return (
                    <div key={colorIndex} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                      {/* Color Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold mb-2">Color Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Rose Madder, Black, Red"
                            value={color.name}
                            onChange={(e) => updateColorName(colorIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColor(colorIndex)}
                          className="ml-4 text-red-600 hover:text-red-800 p-2"
                          title="Remove Color"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Images Section */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Upload Images for this Color</label>
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition w-fit bg-white">
                          <Upload size={18} />
                          <span>Upload Images</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files
                              if (files) {
                                Array.from(files).forEach((file) => {
                                  handleColorImageUpload(colorIndex, file)
                                })
                              }
                              e.target.value = ''
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Upload multiple images for this color (max 5MB per image)
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {color.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <div className="relative w-20 h-20 border border-gray-300 rounded overflow-hidden bg-white">
                                <Image
                                  src={img}
                                  alt={`${color.name} ${imgIndex + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImageFromColor(colorIndex, imgIndex)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {Object.keys(uploadingImages).some(key => key.startsWith(`${colorIndex}-`)) && (
                            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-white">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Variants Section for this Color */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-semibold">
                            {useBandCupSize ? 'Band & Cup Sizes' : 'Sizes'} for {color.name || 'this color'}
                          </label>
                          <button
                            type="button"
                            onClick={() => addVariant(color.name)}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
                            disabled={!color.name.trim()}
                          >
                            <Plus size={16} />
                            Add Size
                          </button>
                        </div>

                        {colorVariants.length > 0 ? (
                          <div className="space-y-2">
                            {colorVariants.map((variant, variantIndex) => {
                              const globalVariantIndex = variants.findIndex(v => v === variant)
                              return (
                                <div
                                  key={globalVariantIndex}
                                  className={`border border-gray-300 rounded-lg p-3 bg-white grid gap-2 items-end ${
                                    useBandCupSize ? 'grid-cols-6' : 'grid-cols-5'
                                  }`}
                                >
                                  {useBandCupSize ? (
                                    <>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Band Size</label>
                                        <input
                                          type="text"
                                          placeholder="34, 36, 38"
                                          value={variant.bandSize || ''}
                                          onChange={(e) => updateVariant(globalVariantIndex, 'bandSize', e.target.value)}
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium mb-1">Cup Size</label>
                                        <input
                                          type="text"
                                          placeholder="75B, 75C, 80B"
                                          value={variant.cupSize || ''}
                                          onChange={(e) => updateVariant(globalVariantIndex, 'cupSize', e.target.value)}
                                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Size</label>
                                      <select
                                        value={variant.size || ''}
                                        onChange={(e) => updateVariant(globalVariantIndex, 'size', e.target.value)}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                      >
                                        <option value="">Select Size</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                        <option value="XXXL">XXXL</option>
                                      </select>
                                    </div>
                                  )}
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Price (Rs)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      placeholder="2400"
                                      value={variant.price}
                                      onChange={(e) => updateVariant(globalVariantIndex, 'price', e.target.value)}
                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Stock</label>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={variant.stock}
                                      onChange={(e) => updateVariant(globalVariantIndex, 'stock', e.target.value)}
                                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => removeVariant(globalVariantIndex)}
                                      className="w-full text-red-600 hover:text-red-800 p-1"
                                      title="Remove Variant"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No sizes added yet. Click "Add Size" to add size variants for this color.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                
                {colors.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">No colors added yet</p>
                    <button
                      type="button"
                      onClick={addColor}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 mx-auto"
                    >
                      <Plus size={18} />
                      Add First Color
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

