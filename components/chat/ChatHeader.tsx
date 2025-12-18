"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

interface ChatHeaderProps {
  title: string
  onMenuClick: () => void
}

export function ChatHeader({ title, onMenuClick }: ChatHeaderProps) {
  return (
    <div className="h-14 border-b border-border flex items-center px-4 gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground"
      >
        <Menu className="w-5 h-5" />
      </Button>
      <h1 className="text-lg font-semibold flex-1">{title}</h1>

      {/* ユーザーボタンを追加 */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-8 h-8",
          }
        }}
        afterSignOutUrl="/sign-in"
      />
    </div>
  )
}
