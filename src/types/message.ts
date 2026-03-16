export interface MessageThread {
  partnerId: string
  partnerName: string | null
  partnerImage: string | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface MessageItem {
  id: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
}
