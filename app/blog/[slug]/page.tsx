import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, User, Tag } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import OptimizedImage from '@/components/OptimizedImage'

async function getPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
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
    return null
  }
  
  return post
}

async function getRelatedPosts(category: string, currentSlug: string) {
  return await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      category,
      slug: { not: currentSlug },
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Elegance Store Blog',
    }
  }
  
  return {
    title: post.metaTitle || `${post.title} | Elegance Store Blog`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || 'Elegance Store'],
      images: post.featuredImage ? [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `https://elegance-store.vercel.app/blog/${params.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = await getRelatedPosts(post.category, post.slug)
  const publishDate = post.publishedAt || post.createdAt

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage || undefined,
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name || 'Elegance Store',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Elegance Store',
      logo: {
        '@type': 'ImageObject',
        url: 'https://elegance-store.vercel.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://elegance-store.vercel.app/blog/${post.slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs
          items={[
            { name: 'Blog', href: '/blog' },
            { name: post.category, href: `/blog?category=${post.category}` },
            { name: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-96 w-full">
              <OptimizedImage
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                loading="eager"
                priority
              />
            </div>
          )}

          <div className="p-8 lg:p-12">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-600 text-sm font-semibold rounded-full">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>{format(publishDate, 'MMMM d, yyyy')}</span>
              </div>
              
              {post.author.name && (
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <span>{post.author.name}</span>
                </div>
              )}
              
              {post.keywords.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={20} />
                  <div className="flex flex-wrap gap-2">
                    {post.keywords.slice(0, 3).map((keyword) => (
                      <span key={keyword} className="text-sm text-gray-500">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="text-xl text-gray-700 mb-8 italic border-l-4 border-primary-600 pl-4">
              {post.excerpt}
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />

            {/* Share Buttons */}
            <div className="flex items-center gap-4 pt-8 border-t">
              <span className="font-semibold text-gray-700">Share:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://elegance-store.vercel.app/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=https://elegance-store.vercel.app/blog/${post.slug}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 transition"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://elegance-store.vercel.app/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800 transition"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => {
                const BlogCard = require('@/components/blog/BlogCard').default
                return <BlogCard key={relatedPost.id} post={relatedPost} />
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
