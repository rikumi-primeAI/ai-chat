"use client"

export function LoadingIndicator() {
  return (
    <div className="flex gap-4 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-primary-foreground">AI</span>
      </div>
      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted text-foreground">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  )
}
