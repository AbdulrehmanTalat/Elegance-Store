import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout | Elegance Store',
  description: 'Complete your purchase securely at Elegance Store.',
  robots: { index: false, follow: false }, // Never index checkout
  alternates: {
    canonical: 'https://elegance-store.vercel.app/checkout',
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
