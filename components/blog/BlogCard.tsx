import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import OptimizedImage from '../OptimizedImage'

interface BlogCardProps {
  post: {
    slug: string
    title: string
    excerpt: string
    featuredImage?: string | null
    category: string
    publishedAt: Date | string
    author: {
      name: string | null
    }
  }
}

export default function BlogCard({ post }: BlogCardProps) {
  const publishDate = typeof post.publishedAt === 'string' 
    ? new Date(post.publishedAt) 
    : post.publishedAt

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 w-full bg-gradient-to-br from-pink-100 to-purple-100">
          {post.featuredImage ? (
            <OptimizedImage
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-semibold rounded-full">
            {post.category}
          </span>
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{format(publishDate, 'MMM d, yyyy')}</span>
          </div>
          
          {post.author.name && (
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{post.author.name}</span>
            </div>
          )}
        </div>
        
        <Link
          href={`/blog/${post.slug}`}
          className="inline-block mt-4 text-primary-600 font-semibold hover:text-primary-700 transition"
        >
          Read More →
        </Link>
      </div>
    </article>
  )
}
