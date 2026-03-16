import { getTranslations } from 'next-intl/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/routing'

function getInitials(name: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default async function MessagesPage() {
  const session = await requireAuth()
  const tMessage = await getTranslations('message')

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  const threadMap = new Map<
    string,
    {
      partnerId: string
      partnerName: string | null
      partnerImage: string | null
      lastMessage: string
      lastMessageAt: Date
      unreadCount: number
    }
  >()

  for (const message of messages) {
    const isSent = message.senderId === session.user.id
    const partner = isSent ? message.receiver : message.sender

    const existing = threadMap.get(partner.id)
    if (!existing) {
      threadMap.set(partner.id, {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerImage: partner.image,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        unreadCount: !isSent && !message.isRead ? 1 : 0,
      })
      continue
    }

    if (!isSent && !message.isRead) {
      existing.unreadCount += 1
    }
  }

  const threads = Array.from(threadMap.values()).sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  )

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{tMessage('inbox')}</h1>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-body">
          {tMessage('noMessages')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {threads.map((thread) => (
            <Link
              key={thread.partnerId}
              href={`/messages/${thread.partnerId}`}
              className="block border-b border-slate-100 p-4 transition hover:bg-slate-50 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <Avatar size="lg" className="size-11">
                  <AvatarImage src={thread.partnerImage ?? undefined} alt={thread.partnerName ?? 'User'} />
                  <AvatarFallback>{getInitials(thread.partnerName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-slate-900">
                      {thread.partnerName ?? 'User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {thread.lastMessageAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-sm text-body">{thread.lastMessage}</p>
                    {thread.unreadCount > 0 ? (
                      <Badge className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                        {thread.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
