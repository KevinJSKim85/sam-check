import { z } from 'zod'

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message must be under 2000 characters'),
})

export type MessageInput = z.infer<typeof messageSchema>
