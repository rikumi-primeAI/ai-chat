"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
import type { Conversation } from "@/lib/types"

interface ChatSidebarProps {
  conversations: Conversation[]
  currentId: string
  onNew: () => void
  onSwitch: (id: string) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  isOpen: boolean
}

export function ChatSidebar({
  conversations,
  currentId,
  onNew,
  onSwitch,
  onDelete,
  isOpen,
}: ChatSidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={onNew}
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
              onClick={() => onSwitch(conversation.id)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 group relative cursor-pointer ${
                currentId === conversation.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate flex-1">{conversation.title}</span>
              <button
                onClick={(e) => onDelete(conversation.id, e)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-sidebar-accent/80 rounded transition-opacity"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
