'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/format'

type ThreadSummary = {
  threadId: string
  userA: {
    id: string
    name: string | null
  }
  userB: {
    id: string
    name: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
}

type ThreadListResponse = {
  threads: ThreadSummary[]
  totalThreads: number
}

type ThreadDetailResponse = {
  threadId: string
  participants: Array<{
    id: string
    name: string | null
  }>
  messages: Array<{
    id: string
    senderId: string
    receiverId: string
    senderName: string | null
    receiverName: string | null
    content: string
    isRead: boolean
    createdAt: string
  }>
}

export default function AdminMessagesPage() {
  const locale = useLocale()
  const tAdmin = useTranslations('admin')
  const tErrors = useTranslations('errors')

  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ThreadDetailResponse | null>(null)
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadThreads = async () => {
      setLoadingThreads(true)
      setError('')

      try {
        const response = await fetch('/api/admin/messages')
        const data = (await response.json()) as ThreadListResponse & { error?: string }

        if (!response.ok) {
          throw new Error(data.error ?? tErrors('failedLoadThreads'))
        }

        setThreads(data.threads)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : tErrors('failedLoadThreads'))
      } finally {
        setLoadingThreads(false)
      }
    }

    void loadThreads()
  }, [tErrors])

  const filteredThreads = useMemo(() => {
    if (searchKeyword.trim().length === 0) {
      return threads
    }

    const lowered = searchKeyword.trim().toLowerCase()
    return threads.filter((thread) => {
      const names = `${thread.userA.name ?? ''} ${thread.userB.name ?? ''}`.toLowerCase()
      return names.includes(lowered)
    })
  }, [searchKeyword, threads])

  const loadConversation = async (threadId: string) => {
    setActiveThreadId(threadId)
    setLoadingConversation(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/messages/${threadId}`)
      const data = (await response.json()) as ThreadDetailResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedLoadThread'))
      }

      setConversation(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tErrors('failedLoadThread'))
    } finally {
      setLoadingConversation(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">{tAdmin('messagesTitle')}</CardTitle>
          <p className="text-sm text-body">{tAdmin('messagesSubtitle')}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="font-medium text-slate-900">{tAdmin('totalThreads', { count: threads.length })}</p>
          <Badge className="bg-slate-100 text-slate-700">{tAdmin('readOnly')}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('threadList')}</CardTitle>
            <Input
              placeholder={tAdmin('searchByName')}
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="h-11"
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingThreads ? <p className="text-sm text-body">{tAdmin('loadingThreads')}</p> : null}
            {!loadingThreads && filteredThreads.length === 0 ? (
              <p className="text-sm text-body">{tAdmin('noThreads')}</p>
            ) : null}

            {filteredThreads.map((thread) => {
              const isSelected = thread.threadId === activeThreadId

              return (
					<button
						key={thread.threadId}
						className={`w-full min-h-11 rounded-lg border p-3 text-left transition ${
							isSelected
								? 'border-primary bg-primary-50'
								: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  type="button"
                  onClick={() => {
                    void loadConversation(thread.threadId)
                  }}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {thread.userA.name ?? tAdmin('noName')} / {thread.userB.name ?? tAdmin('noName')}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-body">{thread.lastMessage.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateTime(thread.lastMessage.createdAt, locale)}
                  </p>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('conversationTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingConversation ? <p className="text-sm text-body">{tAdmin('loadingConversation')}</p> : null}
            {!loadingConversation && !conversation ? <p className="text-sm text-body">{tAdmin('selectThread')}</p> : null}

            {!loadingConversation && conversation ? (
              <div className="space-y-3">
                {conversation.messages.length === 0 ? (
                  <p className="text-sm text-body">{tAdmin('noMessages')}</p>
                ) : (
                  conversation.messages.map((message) => (
                    <div key={message.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        {message.senderName ?? tAdmin('noName')} → {message.receiverName ?? tAdmin('noName')}
                      </p>
                      <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{message.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(message.createdAt, locale)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
