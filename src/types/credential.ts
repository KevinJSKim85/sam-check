export type CredentialType = 'SAT' | 'ACT' | 'AP' | 'IB' | 'LANGUAGE_TEST' | 'SCHOOL_CERT' | 'EXPERIENCE'

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export interface CredentialDisplay {
  id: string
  type: CredentialType
  label: string
  scoreValue: string | null
  status: VerificationStatus
  verificationNote: string | null
  rejectionReason: string | null
  submissionCount: number
  createdAt: string
}

export interface CredentialSubmission {
  type: CredentialType
  label: string
  scoreValue?: string
  description?: string
  file?: File
}

export interface AdminCredentialItem extends CredentialDisplay {
  tutorName: string | null
  tutorImage: string | null
  tutorProfileId: string
  documentPath: string | null
  documentName: string | null
  mimeType: string | null
}
