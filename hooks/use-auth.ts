"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"
  const user = session?.user

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("/auth/signin")
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
  }
}
