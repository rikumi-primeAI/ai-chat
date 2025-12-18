"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Conversation, Message } from "@/lib/supabase/types"

interface UseSupabaseConversationsProps {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

export function useSupabaseConversations({ messages, setMessages }: UseSupabaseConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const isSavingRef = useRef(false)
  const lastSavedRef = useRef<string>("")

  // 会話一覧を取得
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations")
      if (!res.ok) throw new Error("Failed to fetch conversations")
      const data = await res.json()
      // Date オブジェクトに変換
      const formatted = data.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
      }))
      setConversations(formatted)
      return formatted
    } catch (error) {
      console.error("Error fetching conversations:", error)
      return []
    }
  }, [])

  // メッセージを取得
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    }
  }, [setMessages])

  // メッセージを保存
  const saveMessages = useCallback(async (conversationId: string, msgs: Message[]) => {
    if (isSavingRef.current) return

    // 同じデータは保存しない
    const key = `${conversationId}:${msgs.length}:${msgs[msgs.length - 1]?.id || ''}`
    if (lastSavedRef.current === key) return

    isSavingRef.current = true
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
      })
      lastSavedRef.current = key
    } catch (error) {
      console.error("Error saving messages:", error)
    } finally {
      isSavingRef.current = false
    }
  }, [])

  // 初期化
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const convs = await fetchConversations()

      if (convs.length > 0) {
        setCurrentConversationId(convs[0].id)
        await fetchMessages(convs[0].id)
      } else {
        // 会話がない場合は新しく作成
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "新しいチャット" }),
          })
          if (res.ok) {
            const newConv = await res.json()
            setConversations([{
              ...newConv,
              createdAt: new Date(newConv.createdAt),
              updatedAt: new Date(newConv.updatedAt),
            }])
            setCurrentConversationId(newConv.id)
            setMessages([])
          }
        } catch (error) {
          console.error("Error creating initial conversation:", error)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [fetchConversations, fetchMessages, setMessages])

  // 会話切り替え時にメッセージを取得
  useEffect(() => {
    if (currentConversationId && !isLoading) {
      fetchMessages(currentConversationId)
    }
  }, [currentConversationId, fetchMessages, isLoading])

  // メッセージが変更されたら保存（デバウンス）
  useEffect(() => {
    if (!currentConversationId || isLoading || messages.length === 0) return

    const timer = setTimeout(() => {
      saveMessages(currentConversationId, messages)
    }, 1000)

    return () => clearTimeout(timer)
  }, [messages, currentConversationId, isLoading, saveMessages])

  // 新しい会話を作成
  const handleNewChat = async () => {
    // 空の会話があればそこに切り替え
    const emptyConversation = conversations.find((c) => c.messageCount === 0)

    if (emptyConversation && emptyConversation.id !== currentConversationId) {
      setCurrentConversationId(emptyConversation.id)
      setMessages([])
      return
    }

    if (!emptyConversation) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "新しいチャット" }),
        })
        if (res.ok) {
          const newConv = await res.json()
          const formatted = {
            ...newConv,
            createdAt: new Date(newConv.createdAt),
            updatedAt: new Date(newConv.updatedAt),
          }
          setConversations((prev) => [formatted, ...prev])
          setCurrentConversationId(newConv.id)
          setMessages([])
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
      }
    }
  }

  // 会話を切り替え
  const handleSwitchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  // 会話を削除
  const handleDeleteConversation = async (conversationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setConversations((prev) => {
          const filtered = prev.filter((c) => c.id !== conversationId)

          if (conversationId === currentConversationId && filtered.length > 0) {
            setCurrentConversationId(filtered[0].id)
          } else if (filtered.length === 0) {
            // すべて削除した場合は新しい会話を作成
            handleNewChat()
          }

          return filtered
        })
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  // 会話リストを更新（タイトルなど）
  const refreshConversations = useCallback(async () => {
    await fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    currentConversationId,
    isLoading,
    handleNewChat,
    handleSwitchConversation,
    handleDeleteConversation,
    refreshConversations,
  }
}
