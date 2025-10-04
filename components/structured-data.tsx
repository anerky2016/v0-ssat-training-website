// Structured data for SEO (JSON-LD format)
// Optimized for both Google and Bing search engines

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'SSAT Math Prep',
    alternateName: 'midssat.com',
    url: 'https://www.midssat.com',
    logo: 'https://www.midssat.com/android-chrome-512x512.png',
    description: 'Master SSAT middle level math with comprehensive training materials and practice problems. Interactive lessons covering fractions, ratios, geometry, decimals, integers, and more.',
    sameAs: [
      // Add your social media profiles here when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@midssat.com',
      availableLanguage: 'English',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SSAT Math Prep',
    alternateName: 'midssat.com',
    url: 'https://www.midssat.com',
    description: 'Comprehensive SSAT middle level math preparation with interactive lessons and practice problems',
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'SSAT Math Prep',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.midssat.com/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const educationalSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://www.midssat.com',
    name: 'SSAT Math Prep for Middle School',
    description: 'Master SSAT middle level math with comprehensive training materials and practice problems',
    url: 'https://www.midssat.com',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      url: 'https://www.midssat.com',
      name: 'SSAT Math Prep',
    },
    about: {
      '@type': 'Course',
      name: 'SSAT Middle Level Math Preparation',
      description: 'Comprehensive SSAT math training covering all 11 essential math chapters',
      provider: {
        '@type': 'EducationalOrganization',
        name: 'SSAT Math Prep',
        url: 'https://www.midssat.com',
      },
      educationalLevel: 'Middle School',
      teaches: [
        'Fractions',
        'Decimals',
        'Integers',
        'Percentages',
        'Ratios and Proportions',
        'Geometry',
        'Statistics and Probability',
        'Equations',
        'Algebraic Expressions',
        'Exponents',
        'Factoring',
      ],
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.midssat.com',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
