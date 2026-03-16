import { CredentialDisplay } from './credential'
import { ReviewItem } from './review'

export type TeachingMode = 'ONLINE' | 'OFFLINE' | 'BOTH'

export interface TutorCard {
  id: string
  userId: string
  name: string | null
  image: string | null
  university: string | null
  degree: string | null
  headline: string | null
  subjects: string[]
  curricula: string[]
  hourlyRate: number | null
  teachingMode: TeachingMode
  averageRating: number
  totalReviews: number
  verifiedCredentials: CredentialDisplay[]
}

export interface TutorDetail extends TutorCard {
  bio: string | null
  reviews: ReviewItem[]
  allCredentials: CredentialDisplay[]
}
