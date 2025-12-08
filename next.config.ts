import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO optimizations
  trailingSlash: false, // Prevents duplicate content issues
  compress: true, // Enable gzip compression for better performance
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS image sources (adjust for your S3 bucket)
      },
    ],
  },
  
  // Enable experimental features for better SEO
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
