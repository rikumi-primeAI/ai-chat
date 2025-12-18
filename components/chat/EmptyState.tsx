"use client"

import { MessageSquare } from "lucide-react"

export function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">今日は何をお手伝いしましょうか?</h2>
        <p className="text-muted-foreground">メッセージを入力して会話を始めましょう</p>
      </div>
    </div>
  )
}
