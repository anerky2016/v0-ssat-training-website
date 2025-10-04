import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/'],
        crawlDelay: 0,
      },
      {
        // Specific rules for Bingbot
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/private/'],
        crawlDelay: 0,
      },
      {
        // Specific rules for msnbot (legacy Bing crawler)
        userAgent: 'msnbot',
        allow: '/',
        disallow: ['/api/', '/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
