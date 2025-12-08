'use client'

import React from 'react'

type Product = {
  _id: string
  sku: string
  name?: string
  productName?: string
  category: string
  price: number
  description?: string
  images?: string[]
  productImages?: string[]
}

type ProductStructuredDataProps = {
  products: Product[]
}

export default function ProductStructuredData({ products }: ProductStructuredDataProps) {
  // Create structured data for product catalog
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': products.slice(0, 50).map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        '@id': `https://quotation.qrpixeldesign.com/products#${product._id}`,
        'name': product.name || product.productName || product.sku,
        'sku': product.sku,
        'category': product.category,
        'description': product.description || `${product.category} - ${product.sku}`,
        'offers': {
          '@type': 'Offer',
          'price': product.price,
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': `https://quotation.qrpixeldesign.com/products`,
        },
        ...(product.images?.[0] || product.productImages?.[0] ? {
          'image': product.images?.[0] || product.productImages?.[0]
        } : {}),
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
