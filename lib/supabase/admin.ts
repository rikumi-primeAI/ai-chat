import { createClient } from "@supabase/supabase-js"

// サーバーサイドでservice_roleを使ってRLSをバイパス
// Clerk認証でユーザーIDを確認した上で使用
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
