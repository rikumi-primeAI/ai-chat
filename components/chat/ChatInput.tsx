"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  value: string
  isLoading: boolean
  onValueChange: (value: string) => void
  onSubmit: (text: string) => void
}

export function ChatInput({ value, isLoading, onValueChange, onSubmit }: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentValue = value.trim()
    if (currentValue && !isLoading) {
      onSubmit(currentValue)
      onValueChange("")
    }
  }

  return (
    <div className="border-t border-border p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
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
            disabled={!value.trim() || isLoading}
            size="icon"
            className="absolute right-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enterで送信 • Shift+Enterで改行
        </p>
      </div>
    </div>
  )
}
