'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())
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

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/products' },
    { 
      icon: Heart, 
      label: 'Wishlist', 
      href: '/wishlist',
      badge: wishlistCount > 0 ? wishlistCount : null
    },
    { 
      icon: ShoppingCart, 
      label: 'Cart', 
      href: '/cart',
      badge: itemCount > 0 ? itemCount : null
    },
    { icon: User, label: 'Profile', href: session ? '/profile' : '/auth/signin' },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
