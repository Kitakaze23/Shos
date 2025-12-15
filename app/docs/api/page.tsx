"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// Dynamically import Swagger UI (client-side only)
// @ts-ignore - swagger-ui-react types may not be available
const SwaggerUI = dynamic(
  () => import("swagger-ui-react").then((mod) => mod.default || mod),
  { ssr: false }
)
// @ts-ignore
import "swagger-ui-react/swagger-ui.css"

export default function APIDocsPage() {
  const [spec, setSpec] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => {
        setSpec(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load API docs:", error)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Failed to load API documentation</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete API reference with interactive examples
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* @ts-ignore - swagger-ui-react types may not be available */}
          <SwaggerUI spec={spec} />
        </CardContent>
      </Card>
    </div>
  )
}
