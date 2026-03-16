import { type Prisma, type TeachingMode, VerificationStatus } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tutorSearchSchema } from '@/schemas/tutor'

function parseArrayParam(searchParams: URLSearchParams, key: string) {
  const values = searchParams.getAll(key)
  if (values.length === 0) return undefined

  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

function parseBooleanParam(value: string | null) {
  if (value === null) return undefined
  return value === 'true'
}

function parseNumberParam(value: string | null) {
  if (value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const rawInput = {
    keyword: searchParams.get('keyword')?.trim() || undefined,
    curricula: parseArrayParam(searchParams, 'curricula'),
    subjects: parseArrayParam(searchParams, 'subjects'),
    minPrice: parseNumberParam(searchParams.get('minPrice')),
    maxPrice: parseNumberParam(searchParams.get('maxPrice')),
    teachingMode: (searchParams.get('teachingMode') as TeachingMode | null) || undefined,
    minRating: parseNumberParam(searchParams.get('minRating')),
    verifiedOnly: parseBooleanParam(searchParams.get('verifiedOnly')),
    sort: searchParams.get('sort') || undefined,
    page: parseNumberParam(searchParams.get('page')),
    limit: parseNumberParam(searchParams.get('limit')),
  }

  const parsed = tutorSearchSchema.safeParse(rawInput)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const {
    keyword,
    curricula,
    subjects,
    minPrice,
    maxPrice,
    teachingMode,
    minRating,
    verifiedOnly,
    sort,
    page = 1,
    limit = 12,
  } = parsed.data

  const where: Prisma.TutorProfileWhereInput = {
    isPublished: true,
    ...(curricula?.length
      ? {
          curricula: {
            hasSome: curricula,
          },
        }
      : {}),
    ...(subjects?.length
      ? {
          subjects: {
            hasSome: subjects,
          },
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          hourlyRate: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(teachingMode ? { teachingMode } : {}),
    ...(minRating !== undefined ? { averageRating: { gte: minRating } } : {}),
    ...(verifiedOnly
      ? {
          credentials: {
            some: {
              status: VerificationStatus.APPROVED,
            },
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            },
            {
              subjects: {
                has: keyword,
              },
            },
            {
              university: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {}),
  }

  const orderBy: Prisma.TutorProfileOrderByWithRelationInput =
    sort === 'rating'
      ? { averageRating: 'desc' }
      : sort === 'priceLow'
        ? { hourlyRate: 'asc' }
        : sort === 'priceHigh'
          ? { hourlyRate: 'desc' }
          : { createdAt: 'desc' }

  const skip = (page - 1) * limit

  const [total, tutors] = await Promise.all([
    prisma.tutorProfile.count({ where }),
    prisma.tutorProfile.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        credentials: {
          where: { status: VerificationStatus.APPROVED },
          select: {
            id: true,
            type: true,
            label: true,
            scoreValue: true,
            status: true,
            verificationNote: true,
            rejectionReason: true,
            submissionCount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }),
  ])

  const items = tutors.map((tutor) => ({
    id: tutor.id,
    userId: tutor.userId,
    name: tutor.user.name,
    image: tutor.user.image,
    university: tutor.university,
    degree: tutor.degree,
    headline: tutor.headline,
    subjects: tutor.subjects,
    curricula: tutor.curricula,
    hourlyRate: tutor.hourlyRate,
    teachingMode: tutor.teachingMode,
    averageRating: tutor.averageRating,
    totalReviews: tutor.totalReviews,
    verifiedCredentials: tutor.credentials.map((credential) => ({
      ...credential,
      createdAt: credential.createdAt.toISOString(),
    })),
    verifiedCredentialCount: tutor.credentials.length,
  }))

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
