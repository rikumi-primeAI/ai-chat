"use client"

interface Message {
  id: string
  role: string
  content: string
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary-foreground">AI</span>
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
