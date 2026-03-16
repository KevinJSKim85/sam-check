export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN'

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: UserRole
  locale: string
}
