import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/register', '/change-password'],
      },
    ],
    sitemap: 'https://quotation.qrpixeldesign.com/sitemap.xml',
  }
}
