"use client"

import { useEffect } from "react"
import type { Conversation } from "@/lib/types"

interface UseConversationStorageProps {
  conversations: Conversation[]
  currentConversationId: string
}

/**
 * conversations と currentConversationId を localStorage に同期する
 */
export function useConversationStorage({
  conversations,
  currentConversationId,
}: UseConversationStorageProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chat-conversations', JSON.stringify(conversations))
        localStorage.setItem('chat-current-conversation-id', currentConversationId)
      } catch (error) {
        console.error('Failed to save conversations to localStorage:', error)
      }
    }
  }, [conversations, currentConversationId])
}

/**
 * localStorage から conversations を初期化する
 */
export function loadConversationsFromStorage(): Conversation[] {
  if (typeof window === 'undefined') {
    const initialId = `chat-${Date.now()}`
    return [{ id: initialId, title: "新しいチャット", createdAt: new Date(), messageCount: 0 }]
  }

  try {
    const stored = localStorage.getItem('chat-conversations')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Date オブジェクトを復元
      return parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
      }))
    }
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error)
  }

  // デフォルトの初期会話
  const initialId = `chat-${Date.now()}`
  return [{ id: initialId, title: "新しいチャット", createdAt: new Date(), messageCount: 0 }]
}

/**
 * localStorage から currentConversationId を初期化する
 */
export function loadCurrentConversationIdFromStorage(fallbackId: string): string {
  if (typeof window === 'undefined') {
    return fallbackId
  }

  try {
    const stored = localStorage.getItem('chat-current-conversation-id')
    if (stored) {
      return stored
    }
  } catch (error) {
    console.error('Failed to load current conversation ID:', error)
  }

  return fallbackId
}
