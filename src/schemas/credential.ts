import { z } from 'zod'

export const credentialSubmitSchema = z.object({
  type: z.enum(['SAT', 'ACT', 'AP', 'IB', 'LANGUAGE_TEST', 'SCHOOL_CERT', 'EXPERIENCE']),
  label: z.string().min(1).max(100),
  scoreValue: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
})

export type CredentialSubmitInput = z.infer<typeof credentialSubmitSchema>

export const credentialReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  verificationNote: z.string().max(200).optional(),
  rejectionReason: z.string().min(1).max(500).optional(),
}).refine(
  (data) => data.status !== 'REJECTED' || data.rejectionReason,
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] }
)

export type CredentialReviewInput = z.infer<typeof credentialReviewSchema>
