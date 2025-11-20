import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://elegance-store.vercel.app'),
  title: {
    default: 'Elegance Store - Ladies Fashion & Beauty',
    template: '%s | Elegance Store',
  },
  description: 'Discover premium lingerie, jewelry, and makeup at Elegance Store. Shop our latest collection of bras, panties, sleepwear, and accessories.',
  keywords: ['lingerie', 'bras', 'panties', 'sleepwear', 'jewelry', 'makeup', 'ladies fashion', 'pakistan'],
  authors: [{ name: 'Elegance Store' }],
  creator: 'Elegance Store',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elegance-store.vercel.app',
    title: 'Elegance Store - Ladies Fashion & Beauty',
    description: 'Discover premium lingerie, jewelry, and makeup at Elegance Store.',
    siteName: 'Elegance Store',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Elegance Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elegance Store - Ladies Fashion & Beauty',
    description: 'Discover premium lingerie, jewelry, and makeup at Elegance Store.',
    images: ['/og-image.jpg'],
    creator: '@elegancestore',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

