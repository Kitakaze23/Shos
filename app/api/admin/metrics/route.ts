import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Errors, handleError } from "@/lib/errors"
import {
  getPerformanceMetrics,
  getErrorMetrics,
  calculatePercentiles,
  getUserStats,
  getProjectStats,
  getReportStats,
  getFeatureUsageStats,
} from "@/lib/monitoring"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return handleError(Errors.unauthorized())
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
    if (!adminEmails.includes(session.user.email || "")) {
      return handleError(Errors.forbidden("Admin access required"))
    }

    const searchParams = request.nextUrl.searchParams
    const hours = parseInt(searchParams.get("hours") || "24")
    const endpoint = searchParams.get("endpoint") || undefined

    // Get performance metrics
    const performanceMetrics = getPerformanceMetrics(endpoint, hours)
    const percentiles = calculatePercentiles(performanceMetrics)

    // Get error metrics
    const errorMetrics = getErrorMetrics(endpoint, hours)
    const errorRate = performanceMetrics.length > 0
      ? (errorMetrics.length / performanceMetrics.length) * 100
      : 0

    // Get stats
    const userStats = await getUserStats()
    const projectStats = await getProjectStats()
    const reportStats = await getReportStats()
    const featureUsage = await getFeatureUsageStats()

    // Calculate average response time
    const avgResponseTime =
      performanceMetrics.length > 0
        ? performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) /
          performanceMetrics.length
        : 0

    // Group errors by endpoint
    const errorsByEndpoint = errorMetrics.reduce((acc, error) => {
      const key = `${error.method} ${error.endpoint}`
      if (!acc[key]) {
        acc[key] = { count: 0, errors: [] }
      }
      acc[key].count++
      acc[key].errors.push({
        code: error.errorCode,
        message: error.errorMessage,
        timestamp: error.timestamp,
      })
      return acc
    }, {} as Record<string, { count: number; errors: any[] }>)

    return NextResponse.json({
      period: {
        hours,
        startTime: new Date(Date.now() - hours * 60 * 60 * 1000),
        endTime: new Date(),
      },
      performance: {
        totalRequests: performanceMetrics.length,
        averageResponseTime: Math.round(avgResponseTime),
        percentiles: {
          p50: Math.round(percentiles[50] || 0),
          p95: Math.round(percentiles[95] || 0),
          p99: Math.round(percentiles[99] || 0),
        },
        requestsByEndpoint: performanceMetrics.reduce((acc, m) => {
          const key = `${m.method} ${m.endpoint}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>),
      },
      errors: {
        totalErrors: errorMetrics.length,
        errorRate: Math.round(errorRate * 100) / 100,
        errorsByEndpoint,
      },
      stats: {
        users: userStats,
        projects: projectStats,
        reports: reportStats,
        featureUsage,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
