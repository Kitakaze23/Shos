import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fleet Cost Tracker - Financial Modeling Platform",
  description: "Modern collaborative financial modeling platform for equipment/fleet cost tracking",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fleet Tracker",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
