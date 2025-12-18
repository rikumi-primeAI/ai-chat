"use client"

import { useClerk, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, LogOut, Sun, Moon, Sparkles } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"

export function SettingsDialog() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Settings className="w-4 h-4" />
          設定
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            アカウント設定とアプリケーションの管理
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.fullName || user.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">テーマ</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === "dark" ? "ライト" : "ダーク"}に切替
            </Button>
          </div>

          <Link href="/pricing">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-sm font-medium">プランをアップグレード</span>
                  <p className="text-xs text-muted-foreground">より多くの機能をアンロック</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
