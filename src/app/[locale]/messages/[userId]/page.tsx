'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorFallback } from '@/components/ui/error-fallback'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@/i18n/routing'

type MessageItem = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

type ConversationResponse = {
  partner: {
    id: string
    name: string | null
    image: string | null
    tutorProfileId: string | null
  }
  messages: MessageItem[]
  currentUserId: string
}

function getInitials(name: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function ConversationPage() {
  const params = useParams<{ userId: string }>()
  const userId = useMemo(() => String(params.userId), [params.userId])
  const locale = useLocale()
  const tMessage = useTranslations('message')
  const tErrors = useTranslations('errors')

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<ConversationResponse | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const loadConversation = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages/${userId}`)
      const data = (await response.json()) as ConversationResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedLoadConversation'))
      }

      setConversation(data)
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tErrors('failedLoadConversation'))
    } finally {
      setLoading(false)
    }
  }, [tErrors, userId])

  useEffect(() => {
    void loadConversation()
    void fetch(`/api/messages/read/${userId}`, {
      method: 'PUT',
    })
  }, [loadConversation, userId])

  useEffect(() => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = message.trim()
    if (!trimmed) return

    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: userId, content: trimmed }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedSendMessage'))
      }

      setMessage('')
      await loadConversation()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : tErrors('failedSendMessage'))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <LoadingSkeleton variant="list" count={4} />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorFallback message={error || tErrors('failedLoadConversation')} onRetry={() => void loadConversation()} />
      </div>
    )
  }

  const partnerProfileHref = conversation.partner.tutorProfileId
    ? `/tutors/${conversation.partner.tutorProfileId}`
    : '/tutors'

  return (
    <div className="mx-auto flex h-[calc(100vh-10rem)] min-h-[32rem] w-full max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between rounded-t-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
            <Avatar className="size-10" size="lg">
            <AvatarImage src={conversation.partner.image ?? undefined} alt={conversation.partner.name ?? tMessage('unknownUser')} />
            <AvatarFallback>{getInitials(conversation.partner.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900">{conversation.partner.name ?? tMessage('unknownUser')}</p>
            <Link href={partnerProfileHref} className="text-xs text-primary hover:underline">
              {tMessage('viewProfile')}
            </Link>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-3 overflow-y-auto border-x border-slate-200 bg-white px-4 py-4"
      >
        {conversation.messages.length === 0 ? (
          <div className="pt-10">
            <EmptyState message={tMessage('emptyConversation')} />
          </div>
        ) : (
          conversation.messages.map((item) => {
            const isMine = item.senderId === conversation.currentUserId
            return (
              <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm sm:max-w-[75%] ${
                    isMine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{item.content}</p>
                  <p className={`mt-1 text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-500'}`}>
                    {new Date(item.createdAt).toLocaleString(locale)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={onSubmit} className="rounded-b-2xl border border-slate-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={tMessage('messagePlaceholder')}
            className="min-h-12 resize-none"
            rows={2}
            maxLength={2000}
          />
          <Button type="submit" className="min-h-11" disabled={sending || message.trim().length === 0}>
            {sending ? tMessage('sendPending') : tMessage('send')}
          </Button>
        </div>
        {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
      </form>
    </div>
  )
}
