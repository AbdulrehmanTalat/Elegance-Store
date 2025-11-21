import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ComparisonStore {
    productIds: string[]
    addProduct: (productId: string) => void
    removeProduct: (productId: string) => void
    clearAll: () => void
    isInComparison: (productId: string) => boolean
    canAddMore: () => boolean
}

const MAX_PRODUCTS = 4

export const useComparisonStore = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            productIds: [],

            addProduct: (productId: string) => {
                const { productIds } = get()
                if (productIds.length >= MAX_PRODUCTS) {
                    return
                }
                if (!productIds.includes(productId)) {
                    set({ productIds: [...productIds, productId] })
                }
            },

            removeProduct: (productId: string) => {
                set({ productIds: get().productIds.filter(id => id !== productId) })
            },

            clearAll: () => {
                set({ productIds: [] })
            },

            isInComparison: (productId: string) => {
                return get().productIds.includes(productId)
            },

            canAddMore: () => {
                return get().productIds.length < MAX_PRODUCTS
            },
        }),
        {
            name: 'product-comparison',
        }
    )
)
