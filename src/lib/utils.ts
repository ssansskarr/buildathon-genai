import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Theme utilities
export type Theme = 'dark' | 'light'

export function getSystemTheme(): Theme {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark' // Default to dark theme on server
}

export function setThemeClass(theme: Theme) {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      document.body.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      document.body.style.colorScheme = 'light'
    }
    
    // Store theme preference
    localStorage.setItem('theme', theme)
  }
}
