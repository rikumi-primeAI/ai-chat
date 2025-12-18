"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "¥0",
    period: "月",
    description: "個人利用に最適",
    features: [
      "1日50メッセージまで",
      "基本的なAIモデル",
      "会話履歴7日間保存",
      "1つのワークスペース",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "¥1,980",
    period: "月",
    description: "プロフェッショナル向け",
    features: [
      "無制限メッセージ",
      "高性能AIモデル",
      "会話履歴無制限保存",
      "5つのワークスペース",
      "優先サポート",
      "APIアクセス",
    ],
  },
  {
    id: "max",
    name: "Max",
    price: "¥4,980",
    period: "月",
    description: "チーム・企業向け",
    features: [
      "Proの全機能",
      "最新AIモデル優先アクセス",
      "無制限ワークスペース",
      "チームメンバー招待",
      "管理者ダッシュボード",
      "カスタムインテグレーション",
      "専任サポート",
    ],
  },
]

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCanceled, setShowCanceled] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // URLパラメータをチェックしてメッセージを表示、その後URLをクリア
  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")
    if (success) {
      setShowSuccess(true)
      router.replace("/pricing", { scroll: false })
    }
    if (canceled) {
      setShowCanceled(true)
      router.replace("/pricing", { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/subscription")
        if (res.ok) {
          const data = await res.json()
          setCurrentPlan(data.plan)
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === "free" || planId === currentPlan) return

    setProcessingPlan(planId)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })

      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        console.error("Checkout failed")
      }
    } catch (error) {
      console.error("Checkout error:", error)
    } finally {
      setProcessingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    setProcessingPlan("manage")
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      }
    } catch (error) {
      console.error("Portal error:", error)
    } finally {
      setProcessingPlan(null)
    }
  }

  const getButtonProps = (planId: string) => {
    const isCurrent = planId === currentPlan
    const isDowngrade = plans.findIndex(p => p.id === planId) < plans.findIndex(p => p.id === currentPlan)

    if (isCurrent) {
      return {
        text: "現在のプラン",
        variant: "outline" as const,
        disabled: true,
        action: "none" as const,
      }
    }

    if (isDowngrade) {
      return {
        text: "プラン変更",
        variant: "outline" as const,
        disabled: false,
        action: "manage" as const,
      }
    }

    return {
      text: "アップグレード",
      variant: "default" as const,
      disabled: false,
      action: "upgrade" as const,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              チャットに戻る
            </Button>
          </Link>
        </div>

        {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-green-600 dark:text-green-400 font-medium">
              アップグレードが完了しました！
            </p>
          </div>
        )}

        {showCanceled && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <p className="text-yellow-600 dark:text-yellow-400 font-medium">
              決済がキャンセルされました
            </p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">プランを選択</h1>
          <p className="text-muted-foreground text-lg">
            あなたのニーズに合ったプランをお選びください
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan
              const buttonProps = getButtonProps(plan.id)
              const isProcessing = processingPlan === plan.id

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                    isCurrent ? "border-primary" : "border-border"
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                        現在のプラン
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={buttonProps.variant}
                    className="w-full mt-8"
                    disabled={buttonProps.disabled || isProcessing}
                    onClick={() => {
                      if (buttonProps.action === "upgrade") {
                        handleUpgrade(plan.id)
                      } else if (buttonProps.action === "manage") {
                        handleManageSubscription()
                      }
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      buttonProps.text
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>すべてのプランに14日間の返金保証が付いています</p>
        </div>
      </div>
    </div>
  )
}
