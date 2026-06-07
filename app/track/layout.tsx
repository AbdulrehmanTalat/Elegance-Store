import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order | Elegance Store',
  description: 'Track the status of your Elegance Store order in real-time.',
  alternates: {
    canonical: 'https://elegance-store.vercel.app/track',
  },
}

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
