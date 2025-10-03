import { Metadata } from 'next'

interface SEOParams {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
  noIndex?: boolean
  author?: string
  publishDate?: string
  fbAppId?: string
  articleSection?: string
  articleTag?: string[]
}

export function generateMetadata(params: SEOParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
  const url = `${baseUrl}${params.path}`

  return {
    title: params.title,
    description: params.description,
    keywords: params.keywords,
    // Bing prefers explicit author information
    authors: params.author ? [{ name: params.author }] : [{ name: 'SSAT Prep' }],
    // Bing uses publish date for ranking freshness
    ...(params.publishDate && {
      other: {
        'article:published_time': params.publishDate,
      }
    }),
    robots: params.noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          // Google-specific
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
          // Bing-specific (BingBot)
          'bingbot': {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    // Open Graph tags - critical for Facebook sharing
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: 'SSAT Prep',
      type: params.articleSection ? 'article' : 'website',
      locale: 'en_US',
      // Facebook recommends 1200x630 or 1.91:1 ratio
      ...(params.ogImage && {
        images: [{
          url: params.ogImage,
          width: 1200,
          height: 630,
          alt: params.title,
        }]
      }),
      ...(params.publishDate && { publishedTime: params.publishDate }),
      // Facebook-specific article metadata
      ...(params.articleSection && {
        article: {
          publishedTime: params.publishDate,
          section: params.articleSection,
          tags: params.articleTag,
          authors: [params.author || 'SSAT Prep'],
        }
      }),
    },
    // Bing indexes Twitter cards
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      ...(params.ogImage && { images: [params.ogImage] }),
    },
    alternates: {
      canonical: url,
    },
    // Search engine & social media verification tags
    verification: {
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
      },
    },
    // Facebook-specific metadata
    ...(params.fbAppId && {
      other: {
        ...((params as any).other || {}),
        'fb:app_id': params.fbAppId,
      }
    }),
  }
}

// Common keyword sets
export const seoKeywords = {
  math: [
    'SSAT math',
    'SSAT quantitative',
    'middle level math',
    'SSAT math practice',
    'math test prep',
    'SSAT math questions',
  ],
  fractions: [
    'SSAT fractions',
    'fraction practice',
    'mixed numbers',
    'simplifying fractions',
    'adding fractions',
    'multiplying fractions',
  ],
  verbal: [
    'SSAT verbal',
    'verbal reasoning',
    'SSAT vocabulary',
    'analogies practice',
    'synonyms practice',
  ],
  general: [
    'SSAT prep',
    'SSAT practice',
    'middle level SSAT',
    'SSAT study guide',
    'SSAT test preparation',
  ],
}
