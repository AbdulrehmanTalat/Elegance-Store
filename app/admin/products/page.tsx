'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProductsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /admin where products are actually managed
    router.replace('/admin')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-xl">Redirecting to admin panel...</p>
    </div>
  )
}
