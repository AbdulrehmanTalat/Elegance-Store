import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/profile/', '/checkout/', '/cart/'],
        },
        sitemap: 'https://elegance-store.vercel.app/sitemap.xml',
    }
}
