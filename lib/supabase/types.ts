export interface DbConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: MessageContent
  created_at: string
}

export interface MessageContent {
  parts: MessagePart[]
}

export interface MessagePart {
  type: "text"
  text: string
}

// フロントエンド用の型
export interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount?: number
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  parts: MessagePart[]
  createdAt?: Date
}
