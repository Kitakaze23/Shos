"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, TrendingUp, AlertCircle, Users, FolderOpen, FileText, Activity } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export const dynamic = "force-dynamic";

interface MetricsData {
  period: {
    hours: number
    startTime: string
    endTime: string
  }
  performance: {
    totalRequests: number
    averageResponseTime: number
    percentiles: {
      p50: number
      p95: number
      p99: number
    }
    requestsByEndpoint: Record<string, number>
  }
  errors: {
    totalErrors: number
    errorRate: number
    errorsByEndpoint: Record<string, { count: number; errors: any[] }>
  }
  stats: {
    users: {
      totalUsers: number
      activeUsers: number
      newUsers: number
    }
    projects: {
      totalProjects: number
      projectsWithEquipment: number
      recentProjects: number
    }
    reports: {
      reportGenerations: number
    }
    featureUsage: Array<{
      feature: string
      count: number
    }>
  }
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hours, setHours] = useState(24)
  const { toast } = useToast()

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/metrics?hours=${hours}`)
      if (!response.ok) {
        throw new Error("Failed to fetch metrics")
      }
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [hours, toast])

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [fetchMetrics])

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No metrics available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare chart data
  const endpointData = Object.entries(metrics.performance.requestsByEndpoint)
    .map(([endpoint, count]) => ({
      endpoint: endpoint.length > 30 ? endpoint.substring(0, 30) + "..." : endpoint,
      requests: count,
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10)

  const featureUsageData = metrics.stats.featureUsage.map((f) => ({
    feature: f.feature.replace(/_/g, " "),
    count: f.count,
  }))

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            System metrics and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last 7 Days</option>
            <option value={720}>Last 30 Days</option>
          </select>
          <Button onClick={fetchMetrics} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.period.hours}h period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics.performance.percentiles.p95}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errors.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.errors.totalErrors} errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stats.users.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.stats.users.totalUsers.toLocaleString()} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Percentiles</CardTitle>
              <CardDescription>P50, P95, P99 response times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">P50</p>
                  <p className="text-2xl font-bold">{metrics.performance.percentiles.p50}ms</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P95</p>
                  <p className="text-2xl font-bold">{metrics.performance.percentiles.p95}ms</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">P99</p>
                  <p className="text-2xl font-bold">{metrics.performance.percentiles.p99}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Endpoint</CardTitle>
              <CardDescription>Top 10 endpoints by request count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={endpointData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Endpoint</CardTitle>
              <CardDescription>Error breakdown by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics.errors.errorsByEndpoint).length === 0 ? (
                <p className="text-muted-foreground">No errors in this period</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(metrics.errors.errorsByEndpoint).map(([endpoint, data]) => (
                    <div key={endpoint} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{endpoint}</p>
                        <span className="text-sm text-muted-foreground">{data.count} errors</span>
                      </div>
                      <div className="space-y-1">
                        {data.errors.slice(0, 3).map((error, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {error.code}: {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{metrics.stats.users.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active (30d)</span>
                  <span className="font-bold">{metrics.stats.users.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New (30d)</span>
                  <span className="font-bold">{metrics.stats.users.newUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{metrics.stats.projects.totalProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Equipment</span>
                  <span className="font-bold">{metrics.stats.projects.projectsWithEquipment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New (30d)</span>
                  <span className="font-bold">{metrics.stats.projects.recentProjects}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated (30d)</span>
                  <span className="font-bold">{metrics.stats.reports.reportGenerations}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>Most used features in the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="feature" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
