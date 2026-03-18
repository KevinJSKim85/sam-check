import type { MetadataRoute } from 'next'

const SITE_URL = 'https://sam-check.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/', '/messages/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
