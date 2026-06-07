import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Shopping Cart | Elegance Store',
  description: 'View the items in your shopping cart at Elegance Store.',
  robots: { index: false, follow: true }, // Don't index cart pages usually
  alternates: {
    canonical: 'https://elegance-store.vercel.app/cart',
  },
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
