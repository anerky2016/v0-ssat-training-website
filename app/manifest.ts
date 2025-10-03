import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SSAT Prep - Middle Level Training Materials',
    short_name: 'SSAT Prep',
    description: 'Comprehensive SSAT training materials and practice tests for middle school students',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/placeholder-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
