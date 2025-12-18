"use client"

import { useState, useEffect } from "react"
import type { Conversation } from "@/lib/types"
import {
  loadConversationsFromStorage,
  loadCurrentConversationIdFromStorage,
} from "./useConversationStorage"

interface Message {
  id: string
  role: string
  content: string
}

interface UseConversationsProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export function useConversations({ messages, setMessages }: UseConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  // 初期化時に localStorage から読み込む（クライアント側のみ）
  useEffect(() => {
    if (!isInitialized) {
      const loadedConversations = loadConversationsFromStorage()
      setConversations(loadedConversations)
      setCurrentConversationId(
        loadCurrentConversationIdFromStorage(loadedConversations[0]?.id || `chat-${Date.now()}`)
      )
      setIsInitialized(true)
    }
  }, [isInitialized])

  // 初期会話IDをconversationsの最初のIDと一致させる
  useEffect(() => {
    if (isInitialized && conversations.length > 0 && !conversations.find((c) => c.id === currentConversationId)) {
      setCurrentConversationId(conversations[0].id)
    }
  }, [isInitialized, conversations, currentConversationId])

  // 会話のタイトルとメッセージ数を更新
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === currentConversationId) {
          const messageCount = messages.length
          let title = conv.title

          // メッセージがある場合、最初のユーザーメッセージからタイトルを生成
          if (messages.length > 0) {
            const firstUserMessage = messages.find((m) => m.role === "user")
            if (firstUserMessage && firstUserMessage.content) {
              const textContent = firstUserMessage.content
              if (textContent) {
                title = textContent.slice(0, 30) + (textContent.length > 30 ? "..." : "")
              }
            }
          }

          return { ...conv, title, messageCount }
        }
        return conv
      })
    )
  }, [messages, currentConversationId])

  // 新しい会話を作成
  const handleNewChat = () => {
    // 空の会話（メッセージ数が0）を探す
    const emptyConversation = conversations.find((c) => c.messageCount === 0)

    if (emptyConversation && emptyConversation.id !== currentConversationId) {
      // 既存の空の会話に切り替え
      setCurrentConversationId(emptyConversation.id)
      setMessages([])
    } else if (!emptyConversation) {
      // 空の会話がない場合のみ新しい会話を作成
      const newId = `chat-${Date.now()}`
      const newConversation: Conversation = {
        id: newId,
        title: "新しいチャット",
        createdAt: new Date(),
        messageCount: 0,
      }
      setConversations((prev) => [newConversation, ...prev])
      setCurrentConversationId(newId)
      setMessages([])
    }
    // 既に空の会話にいる場合は何もしない
  }

  // 会話を切り替え
  const handleSwitchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  // 会話を削除
  const handleDeleteConversation = (conversationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setConversations((prev) => {
      const filtered = prev.filter((conv) => conv.id !== conversationId)
      // 削除した会話が現在の会話の場合、最初の会話に切り替え
      if (conversationId === currentConversationId && filtered.length > 0) {
        setCurrentConversationId(filtered[0].id)
        setMessages([])
      } else if (filtered.length === 0) {
        // すべての会話を削除した場合、新しい会話を作成
        const newId = `chat-${Date.now()}`
        const newConversation: Conversation = {
          id: newId,
          title: "新しいチャット",
          createdAt: new Date(),
          messageCount: 0,
        }
        setConversations([newConversation])
        setCurrentConversationId(newId)
        setMessages([])
      }
      return filtered
    })
  }

  return {
    conversations,
    currentConversationId,
    handleNewChat,
    handleSwitchConversation,
    handleDeleteConversation,
  }
}
