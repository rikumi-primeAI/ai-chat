import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Message, MessagePart } from "@/lib/supabase/types"

// メッセージ一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const supabase = createAdminClient()

    // まず会話の所有者を確認
    const { data: conversation } = await supabase
      .from("conversations")
      .select("user_id")
      .eq("id", conversationId)
      .single()

    if (!conversation || conversation.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // メッセージを取得
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Failed to fetch messages:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // フロントエンド用の形式に変換
    const formattedMessages: Message[] = (messages || []).map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      parts: msg.content?.parts || [],
      createdAt: new Date(msg.created_at),
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error in GET /api/conversations/[id]/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// メッセージを保存
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: conversationId } = await params
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    const supabase = createAdminClient()

    // 会話の所有者を確認
    const { data: conversation } = await supabase
      .from("conversations")
      .select("user_id")
      .eq("id", conversationId)
      .single()

    if (!conversation || conversation.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // 既存のメッセージを削除して新しいメッセージを挿入（同期）
    await supabase.from("messages").delete().eq("conversation_id", conversationId)

    if (messages.length > 0) {
      const messagesToInsert = messages.map((msg: Message) => ({
        id: msg.id,
        conversation_id: conversationId,
        role: msg.role,
        content: { parts: msg.parts },
      }))

      const { error } = await supabase.from("messages").insert(messagesToInsert)

      if (error) {
        console.error("Failed to save messages:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // 会話のタイトルを最初のユーザーメッセージから更新
      const firstUserMessage = messages.find((m) => m.role === "user")
      if (firstUserMessage) {
        const textContent = firstUserMessage.parts?.find((p: MessagePart) => p.type === "text")?.text || ""
        if (textContent) {
          const title = textContent.slice(0, 30) + (textContent.length > 30 ? "..." : "")
          await supabase
            .from("conversations")
            .update({ title })
            .eq("id", conversationId)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/conversations/[id]/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
