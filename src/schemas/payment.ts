import { z } from 'zod'

export const lessonRequestSchema = z.object({
  tutorProfileId: z.string().min(1),
  subject: z.string().min(1).max(100),
  curriculum: z.string().max(100).optional().or(z.literal('')),
  startsAt: z.string().datetime(),
  durationMinutes: z.union([z.literal(60), z.literal(90), z.literal(120)]),
  requestedMessage: z.string().max(1000).optional().or(z.literal('')),
})

export const lessonRequestActionSchema = z.object({
  action: z.enum(['accept', 'decline', 'cancel', 'complete']),
  reason: z.string().max(300).optional(),
})

export const paymentConfirmSchema = z.object({
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().int().positive(),
})

export const tossWebhookSchema = z.object({
  eventType: z.string(),
  data: z.unknown().optional(),
})

export type LessonRequestInput = z.infer<typeof lessonRequestSchema>
export type LessonRequestActionInput = z.infer<typeof lessonRequestActionSchema>
export type PaymentConfirmInput = z.infer<typeof paymentConfirmSchema>
