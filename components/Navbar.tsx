'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Menu, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    if (session?.user) {
      fetch('/api/wishlist')
        .then(res => res.ok ? res.json() : [])
        .then(data => setWishlistCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setWishlistCount(0))
    } else {
      setWishlistCount(0)
    }
  }, [session])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Elegance Store
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="hover:text-primary-600 transition">
              Products
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="hover:text-primary-600 transition">
                Admin
              </Link>
            )}
            {session && (
              <Link
                href="/wishlist"
                className="relative hover:text-primary-600 transition"
                title="Wishlist"
              >
                <Heart size={24} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              href="/cart"
              className="relative hover:text-primary-600 transition"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={session.user?.role === 'ADMIN' ? '/admin' : '/profile'}
                  className="flex items-center space-x-1 hover:text-primary-600 transition cursor-pointer"
                >
                  <User size={20} />
                  <span>{session.user?.name || session.user?.email}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/products"
              className="block hover:text-primary-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="block hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {session && (
              <Link
                href="/wishlist"
                className="flex items-center space-x-2 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={20} />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            )}
            <Link
              href="/cart"
              className="flex items-center space-x-2 hover:text-primary-600 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart size={20} />
              <span>Cart ({itemCount})</span>
            </Link>
            {session ? (
              <div className="space-y-2">
                <Link
                  href={session.user?.role === 'ADMIN' ? '/admin' : '/profile'}
                  className="flex items-center space-x-2 hover:text-primary-600 transition cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>{session.user?.name || session.user?.email}</span>
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-600 hover:text-primary-600 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

