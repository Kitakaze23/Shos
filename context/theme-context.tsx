"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Get initial theme from localStorage or system preference
    const stored = localStorage.getItem("theme") as Theme | null
    const initialTheme = stored || "system"
    setThemeState(initialTheme)

    // Resolve system theme
    const resolveTheme = (t: Theme): "light" | "dark" => {
      if (t === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      return t
    }

    const resolved = resolveTheme(initialTheme)
    setResolvedTheme(resolved)

    // Apply theme class
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(resolved)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        const newResolved = mediaQuery.matches ? "dark" : "light"
        setResolvedTheme(newResolved)
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(newResolved)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    const resolved = newTheme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : newTheme

    setResolvedTheme(resolved)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(resolved)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
