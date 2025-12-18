"use client"

import { useThemeContext } from "@/components/ThemeProvider"

export function useTheme() {
  const context = useThemeContext()
  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
    mounted: true, // ThemeProvider内では常にmounted
  }
}
