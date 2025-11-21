import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')

        const where: any = { status: 'PUBLISHED' }

        if (category) {
            where.category = category
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ]
        }

        const posts = await prisma.blogPost.findMany({
            where,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { publishedAt: 'desc' },
        })

        return NextResponse.json(posts)
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession()

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { title, excerpt, content, featuredImage, metaTitle, metaDescription, keywords, category, slug } = data

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                excerpt,
                content,
                featuredImage,
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || excerpt,
                keywords: keywords || [],
                category,
                authorId: (session.user as any).id,
                status: 'DRAFT',
            },
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error creating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        )
    }
}
