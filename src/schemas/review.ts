import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be under 1000 characters'),
})

export type ReviewInput = z.infer<typeof reviewSchema>
