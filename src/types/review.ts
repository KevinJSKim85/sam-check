export interface ReviewItem {
  id: string
  authorId: string
  authorName: string | null
  authorImage: string | null
  rating: number
  content: string
  createdAt: string
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}
