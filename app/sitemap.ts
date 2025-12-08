import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://quotation.qrpixeldesign.com'
  
  // Fetch all products from your API
  let products: any[] = []
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    if (response.ok) {
      products = await response.json()
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Dynamic product pages - if you have individual product detail pages
  // Uncomment and modify this section when you create product detail pages
  /*
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product._id}`,
    lastModified: new Date(product.updatedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  */

  return [
    ...staticPages,
    // ...productPages, // Uncomment when you have individual product pages
  ]
}
