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

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'SSAT Prep',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  description: 'Comprehensive SSAT training materials and practice tests for middle school students',
  educationalLevel: 'Middle School',
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
  },
}

// Course structured data generator
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
    inLanguage: 'en',
    coursePrerequisites: 'None',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT0H',
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
