"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        toggleTheme()
        // Force immediate visual feedback
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        console.log(`Theme toggled to: ${newTheme}`)
      }}
      className="h-9 w-9 rounded-full bg-background/10 backdrop-blur-sm hover:bg-background/20 transition-colors relative"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] text-blue-300 transition-all absolute ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] text-blue-700 transition-all absolute ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 