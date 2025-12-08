import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LED Products & Lighting Controls | QLite Global Quotation',
  description: 'Browse our complete catalog of LED lights, LED displays, lighting controls, and drivers. Get instant quotations for commercial and industrial lighting solutions.',
  keywords: [
    'LED lights',
    'LED displays',
    'lighting controls',
    'LED drivers',
    'commercial lighting',
    'industrial lighting',
    'LED quotation',
    'lighting solutions',
    'LED products catalog',
    'smart lighting controls',
  ],
  openGraph: {
    title: 'LED Products & Lighting Controls | QLite Global',
    description: 'Browse our complete catalog of LED lights, LED displays, lighting controls, and drivers. Get instant quotations.',
    type: 'website',
  },
  alternates: {
    canonical: '/products',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
