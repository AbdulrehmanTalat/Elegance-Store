import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const post = await prisma.blogPost.findUnique({
            where: { slug: params.slug },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!post || post.status !== 'PUBLISHED') {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error fetching blog post:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession()

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        const post = await prisma.blogPost.update({
            where: { slug: params.slug },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error updating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession()

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.blogPost.delete({
            where: { slug: params.slug },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting blog post:', error)
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        )
    }
}
