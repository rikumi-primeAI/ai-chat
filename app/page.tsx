"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Plus, Menu, Trash2, Copy, Check, Pencil } from "lucide-react"
import { SettingsDialog } from "@/components/SettingsDialog"
import { useEffect, useRef, useState, useCallback } from "react"
import { useSupabaseConversations } from "@/hooks/useSupabaseConversations"
import type { Message } from "@/lib/supabase/types"
import ReactMarkdown from "react-markdown"

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isEditComposing, setIsEditComposing] = useState(false)

  // メッセージをコピー
  const handleCopy = async (messageId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  })

  // メッセージを Message[] 型に変換するラッパー
  const setMessagesWrapper = useCallback((msgs: Message[]) => {
    setMessages(msgs as any)
  }, [setMessages])

  const {
    conversations,
    currentConversationId,
    isLoading: isLoadingConversations,
    handleNewChat,
    handleSwitchConversation: switchConversation,
    handleDeleteConversation,
    refreshConversations,
  } = useSupabaseConversations({
    messages: messages as unknown as Message[],
    setMessages: setMessagesWrapper,
  })

  // タイトル編集を開始
  const startEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(id)
    setEditingTitle(title)
  }

  // タイトル編集を保存
  const saveTitle = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null)
      return
    }
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle.trim() }),
      })
      await refreshConversations()
    } catch (error) {
      console.error("Failed to update title:", error)
    }
    setEditingId(null)
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isLoading = status === "streaming"

  // 会話を切り替え
  const handleSwitchConversation = (conversationId: string) => {
    switchConversation(conversationId)
    setInput("")
  }

  // メッセージが更新されたら会話リストを更新
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        refreshConversations()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [messages, refreshConversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (isLoadingConversations) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* サイドバー */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } h-full bg-sidebar border-r border-sidebar-border transition-[width] duration-300 overflow-hidden flex flex-col flex-shrink-0`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <Button
            onClick={handleNewChat}
            className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新しいチャット
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => editingId !== conversation.id && handleSwitchConversation(conversation.id)}
                className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 group relative cursor-pointer ${
                  currentConversationId === conversation.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                {editingId === conversation.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onCompositionStart={() => setIsEditComposing(true)}
                    onCompositionEnd={() => setIsEditComposing(false)}
                    onBlur={() => saveTitle(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isEditComposing) saveTitle(conversation.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm flex-1 bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm truncate flex-1">{conversation.title}</span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => startEditing(conversation.id, conversation.title, e)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-sidebar-accent/80 rounded transition-opacity"
                    title="編集"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-sidebar-accent/80 rounded transition-opacity"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <SettingsDialog />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ヘッダー */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {conversations.find((c) => c.id === currentConversationId)?.title || "AIチャット"}
          </h1>
        </div>
        {/* メッセージエリア */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold">今日は何をお手伝いしましょうか?</h2>
                  <p className="text-muted-foreground">メッセージを入力して会話を始めましょう</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary-foreground">AI</span>
                      </div>
                    )}
                    <div className="group relative max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        {(() => {
                          // @ts-ignore - UIMessage型のpartsプロパティにアクセス
                          const text = message.parts && Array.isArray(message.parts)
                            ? message.parts.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('')
                            : ''

                          if (message.role === "assistant") {
                            return (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2">
                                <ReactMarkdown>{text}</ReactMarkdown>
                              </div>
                            )
                          }
                          return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
                        })()}
                      </div>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => {
                            // @ts-ignore
                            const text = message.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''
                            handleCopy(message.id, text)
                          }}
                          className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              コピーしました
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              コピー
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary-foreground">AI</span>
                    </div>
                    <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted text-foreground">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 入力エリア */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const currentValue = input.trim()
                if (currentValue && !isLoading) {
                  sendMessage({ text: currentValue })
                  setInput("")
                }
              }}
              className="relative"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isComposing) {
                    e.preventDefault()
                    const form = e.currentTarget.form
                    if (form) {
                      form.requestSubmit()
                    }
                  }
                }}
                placeholder="メッセージを入力してください..."
                className="pr-12 bg-muted border-muted-foreground/20 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-px top-1/2 -translate-y-1/2 h-[calc(100%-2px)] aspect-square bg-primary hover:bg-primary/90 text-primary-foreground rounded-r-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">Enterで送信 • Shift+Enterで改行</p>
          </div>
        </div>
      </div>
    </div>
  )
}
