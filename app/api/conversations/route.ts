import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DbConversation, Conversation } from "@/lib/supabase/types"

// 会話一覧を取得
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 会話とメッセージ数を取得
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        messages:messages(count)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch conversations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // フロントエンド用の形式に変換
    const formattedConversations: Conversation[] = (conversations || []).map((conv: any) => ({
      id: conv.id,
      title: conv.title,
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
      messageCount: conv.messages?.[0]?.count || 0,
    }))

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error("Error in GET /api/conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 新しい会話を作成
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title = "新しいチャット" } = body

    const supabase = createAdminClient()

    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedConversation: Conversation = {
      id: conversation.id,
      title: conversation.title,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      messageCount: 0,
    }

    return NextResponse.json(formattedConversation)
  } catch (error) {
    console.error("Error in POST /api/conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
