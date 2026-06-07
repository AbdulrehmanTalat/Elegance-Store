import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Elegance Store',
  description: 'Get in touch with Elegance Store. We are here to answer your questions about our premium fashion and beauty products.',
  alternates: {
    canonical: 'https://elegance-store.vercel.app/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
