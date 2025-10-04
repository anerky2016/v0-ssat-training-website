import Script from 'next/script'

interface StructuredDataProps {
  data: object
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Website structured data - Bing favors detailed organization info
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'SSAT Math Prep',
  alternateName: 'midssat',
  url: 'https://www.midssat.com',
  description: 'Comprehensive SSAT middle level math training materials and practice tests for middle school students',
  educationalLevel: 'Middle School',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@midssat.com',
    contactType: 'Customer Support',
  },
  knowsAbout: [
    'SSAT Test Preparation',
    'Middle School Mathematics',
    'Mathematics Education',
    'Fractions',
    'Ratios and Proportions',
    'Geometry',
    'Standardized Test Prep',
  ],
}

// Course structured data generator - Enhanced for Bing
export function generateCourseStructuredData(params: {
  name: string
  description: string
  url: string
  provider?: string
  skillLevel?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      '@type': 'Organization',
      name: params.provider || 'SSAT Prep',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
    },
    educationalLevel: params.skillLevel || 'Middle School',
    inLanguage: 'en-US', // Bing prefers specific locale format
    coursePrerequisites: 'None',
    // Bing values free educational content
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT0H',
    },
    // Bing appreciates educational credentials
    about: {
      '@type': 'Thing',
      name: 'SSAT Test Preparation',
    },
  }
}

// Breadcrumb structured data generator
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

// FAQ structured data generator
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Learning resource structured data
export function generateLearningResourceStructuredData(params: {
  name: string
  description: string
  url: string
  educationalUse: string
  learningResourceType: string
  timeRequired?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: params.name,
    description: params.description,
    url: params.url,
    educationalLevel: 'Middle School',
    educationalUse: params.educationalUse,
    learningResourceType: params.learningResourceType,
    inLanguage: 'en',
    isAccessibleForFree: true,
    ...(params.timeRequired && { timeRequired: params.timeRequired }),
  }
}

// Practice Exercises structured data
export function generatePracticeExerciseStructuredData(params: {
  name: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: params.name,
    description: params.description,
    url: params.url,
    educationalLevel: 'Middle School',
    educationalUse: 'practice',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    provider: {
      '@type': 'Organization',
      name: 'SSAT Math Prep',
      url: 'https://www.midssat.com',
    },
    about: {
      '@type': 'Thing',
      name: 'SSAT Mathematics',
    },
  }
}

// Math Topic Collection structured data
export function generateMathTopicCollectionStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'SSAT Math Topics',
    description: 'Comprehensive collection of SSAT middle level math topics including fractions, ratios, geometry, decimals, and more',
    url: 'https://www.midssat.com/math',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'SSAT Math Prep',
      url: 'https://www.midssat.com',
    },
    about: {
      '@type': 'Thing',
      name: 'Middle School Mathematics',
    },
  }
}

// Contact Page structured data
export function generateContactPageStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact SSAT Math Prep',
    description: 'Get in touch with SSAT Math Prep for support, sales, or partnership inquiries',
    url: 'https://www.midssat.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'SSAT Math Prep',
      email: 'support@midssat.com',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          email: 'support@midssat.com',
          contactType: 'Customer Support',
          availableLanguage: 'English',
        },
        {
          '@type': 'ContactPoint',
          email: 'sales@midssat.com',
          contactType: 'Sales',
          availableLanguage: 'English',
        },
      ],
    },
  }
}
