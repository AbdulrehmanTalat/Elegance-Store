'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'

interface Color {
  id?: string
  name: string
  images: string[]
}

interface Variant {
  id?: string
  colorId?: string
  colorName: string
  bandSize?: string
  cupSize?: string
  size?: string
  price: string
  stock: string
  sku?: string
}

interface ProductVariantModalProps {
  productId: string
  colors: Color[]
  variants: Variant[]
  productSubcategory?: string | null
  onClose: () => void
  onSave: (colors: Color[], variants: Variant[]) => Promise<void>
}

export default function ProductVariantModal({
  productId,
  colors: initialColors,
  variants: initialVariants,
  productSubcategory,
  onClose,
  onSave,
}: ProductVariantModalProps) {
  const [colors, setColors] = useState<Color[]>(initialColors || [])
  const [variants, setVariants] = useState<Variant[]>(initialVariants || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({})
  
  // Determine if we should use band/cup size (for bras) or regular size (for nighties, etc.)
  const useBandCupSize = productSubcategory === 'BRA' || productSubcategory === 'BRA_PANTIES_SET'
  const useRegularSize = !useBandCupSize && (productSubcategory === 'LINGERIE' || productSubcategory === 'LOUNGE_WEAR' || productSubcategory === 'PLUS_SIZE_LINGERIE' || !productSubcategory)

  const addColor = () => {
    setColors([...colors, { name: '', images: [] }])
  }

  const removeColor = (index: number) => {
    const colorToRemove = colors[index]
    // Remove variants for this color
    const colorId = colorToRemove.id
    if (colorId) {
      setVariants(variants.filter(v => v.colorId !== colorId))
    } else {
      setVariants(variants.filter(v => v.colorName !== colorToRemove.name))
    }
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, field: 'name' | 'images', value: string | string[]) => {
    const updated = [...colors]
    if (field === 'images') {
      updated[index].images = value as string[]
    } else {
      updated[index].name = value as string
    }
    setColors(updated)
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

  const handleImageUpload = async (colorIndex: number, file: File) => {
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

  const addImageToColor = (colorIndex: number, imageUrl: string) => {
    if (!imageUrl.trim()) return
    const updated = [...colors]
    updated[colorIndex].images.push(imageUrl.trim())
    setColors(updated)
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

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants]
    ;(updated[index] as any)[field] = value
    setVariants(updated)
  }

  const handleSave = async () => {
    setError('')
    
    // Validate colors
    for (const color of colors) {
      if (!color.name.trim()) {
        setError('All colors must have a name')
        return
      }
      if (color.images.length === 0) {
        setError('Each color must have at least one image')
        return
      }
    }

    // Validate variants
    for (const variant of variants) {
      if (!variant.colorName) {
        setError('All variants must have a color')
        return
      }
      if (useBandCupSize) {
        if (!variant.bandSize || !variant.cupSize) {
          setError('All variants must have band size and cup size')
          return
        }
      } else {
        if (!variant.size) {
          setError('All variants must have a size')
          return
        }
      }
      if (!variant.price || parseFloat(variant.price) <= 0) {
        setError('All variants must have a valid price')
        return
      }
      if (variant.stock === '' || parseInt(variant.stock) < 0) {
        setError('All variants must have valid stock')
        return
      }
    }

    setLoading(true)
    try {
      await onSave(colors, variants)
    } catch (err: any) {
      setError(err.message || 'Failed to save variants')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Manage Product Variants</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Colors and Variants Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Add Colors & Sizes</h3>
                <p className="text-sm text-gray-600">
                  For each color: upload images and add {useBandCupSize ? 'band & cup sizes' : 'sizes'} with prices and stock
                </p>
              </div>
              <button
                onClick={addColor}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Add Color
              </button>
            </div>

            <div className="space-y-6">
              {colors.map((color, colorIndex) => {
                // Get variants for this color
                const colorVariants = variants.filter(v => v.colorName === color.name)
                
                return (
                  <div key={colorIndex} className="border-2 border-gray-300 rounded-lg p-5 bg-gray-50">
                    {/* Color Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-2">Color Name</label>
                        <input
                          type="text"
                          placeholder="Color name (e.g., Rose Madder, Black, Red)"
                          value={color.name}
                          onChange={(e) => updateColor(colorIndex, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                      </div>
                      <button
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
                      <div className="space-y-2">
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
                                  handleImageUpload(colorIndex, file)
                                })
                              }
                              e.target.value = '' // Reset input
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500">
                          Upload multiple images for this color (max 5MB per image). You can select multiple files at once.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {color.images.map((img, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <div className="relative w-20 h-20 border border-gray-300 rounded overflow-hidden bg-white">
                              <Image
                                src={img}
                                alt={`${color.name} ${imgIndex + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/80?text=Invalid'
                                }}
                              />
                            </div>
                            <button
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
                          onClick={() => addVariant(color.name)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition flex items-center gap-1 text-sm"
                          disabled={!color.name.trim()}
                        >
                          <Plus size={16} />
                          Add {useBandCupSize ? 'Size' : 'Size'}
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
                                    placeholder="6.40"
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

          <div className="flex space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Variants'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

