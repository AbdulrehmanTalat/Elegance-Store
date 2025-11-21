import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import BlogCard from '@/components/blog/BlogCard'
import { Search } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Style Guide & Beauty Tips | Elegance Store Blog',
  description: 'Discover fashion tips, lingerie care guides, jewelry trends, and makeup tutorials. Expert advice for elegant women in Pakistan.',
  keywords: ['fashion blog', 'beauty tips', 'lingerie care', 'jewelry trends', 'makeup tutorials', 'style guide'],
  alternates: {
    canonical: 'https://elegance-store.vercel.app/blog',
  },
}

async function getBlogPosts(category?: string) {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category && { category }),
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  return posts
}

async function getCategories() {
  const categories = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { category: true },
    distinct: ['category'],
  })
  return categories.map((c: { category: string }) => c.category)
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const posts = await getBlogPosts(searchParams.category)
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Breadcrumbs
          items={[
            { name: 'Blog', href: '/blog' },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Style Guide & Beauty Tips</span>
          </h1>
          <p className="text-xl text-gray-600">
            Expert advice on fashion, lingerie care, and beauty
          </p>
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              <a
                href="/blog"
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  !searchParams.category
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Posts
              </a>
              {categories.map((category: string) => (
                <a
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    searchParams.category === category
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for expert tips and style guides!
            </p>
          </div>
        )}
      </div>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Elegance Store Blog',
            description: 'Fashion tips, lingerie care guides, and beauty tutorials',
            url: 'https://elegance-store.vercel.app/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Elegance Store',
              logo: {
                '@type': 'ImageObject',
                url: 'https://elegance-store.vercel.app/logo.png',
              },
            },
          }),
        }}
      />
    </div>
  )
}
