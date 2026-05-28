import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: [
          '/api/',
          '/dashboard',
          '/agenda',
          '/clients',
          '/settings',
          '/whatsapp',
          '/onboarding',
          '/first-access',
          '/forgot-password',
          '/preview-',
        ],
      },
    ],
    sitemap: 'https://getpetflow.com/sitemap.xml',
  }
}
