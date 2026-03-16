import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { StarDisplay } from '@/components/features/reviews/star-display'

type ReviewCardProps = {
  review: {
    id: string
    authorName: string | null
    authorImage: string | null
    rating: number
    content: string
    createdAt: string
  }
  locale: string
}

function getInitials(name: string | null) {
  if (!name) return 'S'
  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ReviewCard({ review, locale }: ReviewCardProps) {
  return (
    <Card key={review.id} className="border border-slate-200 bg-slate-50 py-0">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={review.authorImage ?? undefined} alt={review.authorName ?? 'Reviewer'} />
              <AvatarFallback>{getInitials(review.authorName)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-slate-800">{review.authorName ?? 'Student'}</p>
          </div>
          <div className="flex items-center gap-2">
            <StarDisplay rating={review.rating} sizeClassName="size-3.5" />
            <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString(locale)}</p>
          </div>
        </div>
        <p className="text-sm text-body">{review.content}</p>
      </CardContent>
    </Card>
  )
}
