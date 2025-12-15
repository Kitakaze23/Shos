import { prisma } from "./db"

export interface PerformanceMetric {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: Date
}

export interface ErrorMetric {
  endpoint: string
  method: string
  errorCode: string
  errorMessage: string
  timestamp: Date
  userId?: string
}

// In-memory metrics store (use Redis in production)
const performanceMetrics: PerformanceMetric[] = []
const errorMetrics: ErrorMetric[] = []

// Keep only last 1000 metrics
const MAX_METRICS = 1000

export function recordPerformanceMetric(metric: PerformanceMetric) {
  performanceMetrics.push(metric)
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift()
  }
}

export function recordErrorMetric(metric: ErrorMetric) {
  errorMetrics.push(metric)
  if (errorMetrics.length > MAX_METRICS) {
    errorMetrics.shift()
  }
}

export function getPerformanceMetrics(
  endpoint?: string,
  hours: number = 24
): PerformanceMetric[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
  let metrics = performanceMetrics.filter((m) => m.timestamp >= cutoff)
  
  if (endpoint) {
    metrics = metrics.filter((m) => m.endpoint === endpoint)
  }
  
  return metrics
}

export function getErrorMetrics(
  endpoint?: string,
  hours: number = 24
): ErrorMetric[] {
  const cutoff = new Date(Date.now() - hours * 60 * 1000)
  let metrics = errorMetrics.filter((m) => m.timestamp >= cutoff)
  
  if (endpoint) {
    metrics = metrics.filter((m) => m.endpoint === endpoint)
  }
  
  return metrics
}

export function calculatePercentiles(
  metrics: PerformanceMetric[],
  percentiles: number[] = [50, 95, 99]
): Record<number, number> {
  if (metrics.length === 0) {
    return {}
  }
  
  const sorted = [...metrics].sort((a, b) => a.responseTime - b.responseTime)
  const result: Record<number, number> = {}
  
  percentiles.forEach((p) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1
    result[p] = sorted[Math.max(0, index)]?.responseTime || 0
  })
  
  return result
}

export async function getUserStats() {
  const totalUsers = await prisma.user.count({
    where: { deletedAt: null },
  })
  
  const activeUsers = await prisma.user.count({
    where: {
      deletedAt: null,
      lastLogin: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  })
  
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
  
  return {
    totalUsers,
    activeUsers,
    newUsers,
  }
}

export async function getProjectStats() {
  const totalProjects = await prisma.project.count({
    where: { archivedAt: null },
  })
  
  const projectsWithEquipment = await prisma.project.count({
    where: {
      archivedAt: null,
      equipment: {
        some: {
          archived: false,
        },
      },
    },
  })
  
  const recentProjects = await prisma.project.count({
    where: {
      archivedAt: null,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
  
  return {
    totalProjects,
    projectsWithEquipment,
    recentProjects,
  }
}

export async function getReportStats() {
  // Count report generations from activity logs
  const reportGenerations = await prisma.activityLog.count({
    where: {
      action: {
        contains: "report",
      },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  })
  
  return {
    reportGenerations,
  }
}

export async function getFeatureUsageStats() {
  // Count feature usage from activity logs
  const features = await prisma.activityLog.groupBy({
    by: ["action"],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    _count: {
      action: true,
    },
    orderBy: {
      _count: {
        action: "desc",
      },
    },
    take: 10,
  })
  
  return features.map((f) => ({
    feature: f.action,
    count: f._count.action,
  }))
}
