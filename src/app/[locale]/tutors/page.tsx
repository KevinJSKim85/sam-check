import { use } from 'react'
import { TutorsListingClient } from '@/components/features/tutors/tutors-listing-client'
import { TutorFinderFlow } from '@/components/features/tutors/tutor-finder-flow'

export default function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = use(searchParams)
  const hasFilters = Object.keys(params).length > 0

  if (hasFilters) {
    return <TutorsListingClient initialSearchParams={params} />
  }

  return <TutorFinderFlow />
}
