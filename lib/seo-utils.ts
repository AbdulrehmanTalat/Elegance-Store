/**
 * SEO Utility Functions
 * Helper functions for generating canonical URLs, meta tags, and schema helpers
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://elegance-store.vercel.app'

/**
 * Generate a canonical URL for a given path
 */
export function getCanonicalUrl(path: string): string {
    // Remove trailing slashes and ensure path starts with /
    const cleanPath = path.replace(/\/$/, '').replace(/^([^/])/, '/$1')
    return `${SITE_URL}${cleanPath}`
}

/**
 * Generate a slug from a string (for blog posts, etc.)
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
}

/**
 * Generate alt text for product images
 */
export function generateProductAlt(
    productName: string,
    variant?: { colorName?: string; size?: string; bandSize?: string; cupSize?: string }
): string {
    let alt = productName

    if (variant) {
        const parts = [productName]
        if (variant.colorName) parts.push(variant.colorName)
        if (variant.bandSize && variant.cupSize) {
            parts.push(`${variant.bandSize}${variant.cupSize}`)
        } else if (variant.size) {
            parts.push(variant.size)
        }
        alt = parts.join(' - ')
    }

    return alt
}

/**
 * Get organization schema data
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Elegance Store',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'Premium lingerie, jewelry, and makeup for women in Pakistan',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'PK',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@elegance-store.com',
            availableLanguage: ['en', 'ur'],
        },
        sameAs: [
            'https://www.facebook.com/elegancestore',
            'https://www.instagram.com/elegancestore',
            'https://twitter.com/elegancestore',
        ],
    }
}

/**
 * Get website schema with search action
 */
export function getWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Elegance Store',
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

/**
 * Generate breadcrumb schema items
 */
export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }
}

/**
 * Format price for schema
 */
export function formatSchemaPrice(price: number): string {
    return price.toFixed(2)
}

/**
 * Get current timestamp for schema
 */
export function getSchemaTimestamp(date?: Date): string {
    return (date || new Date()).toISOString()
}

/**
 * Validate and sanitize meta description
 */
export function sanitizeMetaDescription(description: string): string {
    // Remove HTML tags
    const cleaned = description.replace(/<[^>]*>/g, '')
    // Truncate to recommended length (150-160 characters)
    return truncateText(cleaned, 160)
}

/**
 * Generate keywords string from array
 */
export function generateKeywords(keywords: string[]): string {
    return keywords.join(', ')
}
