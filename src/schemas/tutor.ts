import { z } from 'zod'

export const tutorProfileSchema = z.object({
  headline: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  curricula: z.array(z.string()).min(1, 'At least one curriculum is required'),
  hourlyRate: z.number().int().min(10000, 'Minimum rate is ₩10,000').max(500000, 'Maximum rate is ₩500,000'),
  teachingMode: z.enum(['ONLINE', 'OFFLINE', 'BOTH']),
  university: z.string().max(100).optional(),
  degree: z.string().max(100).optional(),
})

export type TutorProfileInput = z.infer<typeof tutorProfileSchema>

export const tutorSearchSchema = z.object({
  keyword: z.string().optional(),
  curricula: z.array(z.string()).optional(),
  subjects: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  teachingMode: z.enum(['ONLINE', 'OFFLINE', 'BOTH']).optional(),
  minRating: z.number().min(1).max(5).optional(),
  verifiedOnly: z.boolean().optional(),
  sort: z.enum(['newest', 'rating', 'priceLow', 'priceHigh']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export type TutorSearchInput = z.infer<typeof tutorSearchSchema>
