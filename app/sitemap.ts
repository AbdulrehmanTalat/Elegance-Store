import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://elegance-store.vercel.app'

    // Get all products
    const products = await prisma.product.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
    })

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    // Get all published blog posts
    let blogUrls: any[] = []
    try {
        const blogPosts = await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            select: {
                slug: true,
                updatedAt: true,
            },
        })

        blogUrls = blogPosts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    } catch (error) {
        // Blog table might not exist yet
        console.log('Blog posts not available for sitemap')
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...productUrls,
        ...blogUrls,
    ]
}

