import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const SITE_URL = 'https://sam-check.vercel.app'
const LOCALES = ['ko', 'en'] as const
const STATIC_PATHS = ['', '/tutors', '/terms', '/privacy', '/auth/login', '/auth/signup'] as const

function buildLocalizedUrl(locale: (typeof LOCALES)[number], path: string) {
  return `${SITE_URL}/${locale}${path}`
}

function buildLanguageAlternates(path: string): NonNullable<MetadataRoute.Sitemap[number]['alternates']>['languages'] {
  return {
    ko: buildLocalizedUrl('ko', path),
    en: buildLocalizedUrl('en', path),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tutorProfiles = await prisma.tutorProfile.findMany({
    where: {
      isPublished: true,
    },
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: buildLocalizedUrl(locale, path),
      lastModified: now,
      alternates: {
        languages: buildLanguageAlternates(path),
      },
    }))
  )

  const tutorEntries: MetadataRoute.Sitemap = tutorProfiles.flatMap((tutor) => {
    const tutorPath = `/tutors/${tutor.id}`
    const lastModified = tutor.updatedAt ?? tutor.createdAt

    return LOCALES.map((locale) => ({
      url: buildLocalizedUrl(locale, tutorPath),
      lastModified,
      alternates: {
        languages: buildLanguageAlternates(tutorPath),
      },
    }))
  })

  return [...staticEntries, ...tutorEntries]
}
