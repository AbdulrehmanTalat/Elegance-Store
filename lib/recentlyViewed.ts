// Utility functions for recently viewed products using localStorage

const STORAGE_KEY = 'elegance_recently_viewed'
const MAX_ITEMS = 10

export interface RecentlyViewedProduct {
    id: string
    name: string
    image: string | null
    basePrice: number | null
    timestamp: number
}

export const addRecentlyViewed = (product: Omit<RecentlyViewedProduct, 'timestamp'>) => {
    if (typeof window === 'undefined') return

    try {
        const existing = getRecentlyViewed()

        // Remove if already exists
        const filtered = existing.filter(p => p.id !== product.id)

        // Add to beginning with timestamp
        const updated = [
            { ...product, timestamp: Date.now() },
            ...filtered
        ].slice(0, MAX_ITEMS) // Keep only last 10

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
        console.error('Error saving recently viewed:', error)
    }
}

export const getRecentlyViewed = (): RecentlyViewedProduct[] => {
    if (typeof window === 'undefined') return []

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []

        const items: RecentlyViewedProduct[] = JSON.parse(stored)

        // Clean up old items (older than 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        const filtered = items.filter(item => item.timestamp > thirtyDaysAgo)

        // Update storage if we filtered any
        if (filtered.length !== items.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
        }

        return filtered
    } catch (error) {
        console.error('Error loading recently viewed:', error)
        return []
    }
}

export const clearRecentlyViewed = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}
