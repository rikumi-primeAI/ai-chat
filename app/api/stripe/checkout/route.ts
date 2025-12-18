import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stripe, PLANS, PlanType } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: PlanType }

    if (!plan || !PLANS[plan] || !PLANS[plan].priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ユーザーのStripe顧客IDを取得または作成
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // 新しい顧客を作成
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      })
      customerId = customer.id

      // サブスクリプションレコードを作成
      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan: "free",
        status: "active",
      })
    }

    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
