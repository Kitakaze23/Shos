"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export function SignOutButton() {
  return (
    <DropdownMenuItem
      onClick={async () => {
        await signOut({ callbackUrl: "/" })
      }}
      className="text-destructive"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  )
}
