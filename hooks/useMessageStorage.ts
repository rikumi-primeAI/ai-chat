"use client"

import { useEffect } from "react"

interface UseMessageStorageProps {
  messages: any[]
  currentConversationId: string
  setMessages: (messages: any) => void
}

/**
 * 会話ごとのメッセージを localStorage に同期し、
 * 会話切り替え時にメッセージを復元する
 */
export function useMessageStorage({
  messages,
  currentConversationId,
  setMessages,
}: UseMessageStorageProps) {
  // 会話を切り替えたときにメッセージを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`chat-messages-${currentConversationId}`)
        if (stored) {
          const restoredMessages = JSON.parse(stored)
          setMessages(restoredMessages)
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error)
        setMessages([])
      }
    }
  }, [currentConversationId, setMessages])

  // メッセージを localStorage に保存
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(`chat-messages-${currentConversationId}`, JSON.stringify(messages))
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error)
      }
    }
  }, [messages, currentConversationId])
}
