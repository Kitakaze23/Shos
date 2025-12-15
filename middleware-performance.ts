import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { recordPerformanceMetric, recordErrorMetric } from "@/lib/monitoring"

export function performanceMiddleware(request: NextRequest) {
  const startTime = Date.now()
  const endpoint = request.nextUrl.pathname
  const method = request.method

  return {
    recordSuccess: (response: NextResponse) => {
      const responseTime = Date.now() - startTime
      recordPerformanceMetric({
        endpoint,
        method,
        responseTime,
        statusCode: response.status,
        timestamp: new Date(),
      })
      response.headers.set("X-Response-Time", `${responseTime}ms`)
      return response
    },
    recordError: (statusCode: number, errorCode: string, errorMessage: string) => {
      const responseTime = Date.now() - startTime
      recordErrorMetric({
        endpoint,
        method,
        errorCode,
        errorMessage,
        timestamp: new Date(),
        userId: request.headers.get("x-user-id") || undefined,
      })
      recordPerformanceMetric({
        endpoint,
        method,
        responseTime,
        statusCode,
        timestamp: new Date(),
      })
    },
  }
}
