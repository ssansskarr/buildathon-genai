"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, getSystemTheme, setThemeClass } from './utils'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const initialTheme = savedTheme || getSystemTheme()
    
    setThemeState(initialTheme)
    setThemeClass(initialTheme)
  }, [])
  
  // Update theme class when theme changes
  useEffect(() => {
    setThemeClass(theme)
  }, [theme])
  
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
} 