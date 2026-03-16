import { use } from 'react'
import { TutorsListingClient } from '@/components/features/tutors/tutors-listing-client'

export default function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <TutorsListingClient initialSearchParams={use(searchParams)} />
}
