"use client"

import { useState, useEffect, useCallback } from "react"
import Decimal from "decimal.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, TrendingUp } from "lucide-react"
import { EmailReportDialog } from "@/components/email-report-dialog"
import { formatCurrency } from "@/lib/calculations"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AnnualForecastReportProps {
  projectId: string
  currency: string
}

export function AnnualForecastReport({ projectId, currency }: AnnualForecastReportProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [forecastData, setForecastData] = useState<any[]>([])
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1)
  const [startYear, setStartYear] = useState(new Date().getFullYear())

  const fetchForecast = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/reports/annual?startMonth=${startMonth}&startYear=${startYear}`
      )
      if (response.ok) {
        const data = await response.json()
        setForecastData(data.forecast)
      } else {
        toast({
          title: "Error",
          description: "Failed to load annual forecast",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, startMonth, startYear, toast])

  useEffect(() => {
    fetchForecast()
  }, [fetchForecast])

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/reports/export/${format}?type=annual&startMonth=${startMonth}&startYear=${startYear}`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = response.headers.get("Content-Disposition")?.split('filename="')[1]?.replace(/"/g, "") || `forecast.${format === "excel" ? "xlsx" : format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export successful",
          description: `Forecast exported as ${format.toUpperCase()}`,
        })
      } else {
        toast({
          title: "Export failed",
          description: "Failed to generate export",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Prepare chart data
  const chartData = forecastData.map((f) => ({
    month: f.monthName,
    cost: f.projectedCost.toNumber(),
    cumulative: f.cumulativeCost.toNumber(),
    hours: f.operatingHours.toNumber(),
    costPerHour: f.costPerHour.toNumber(),
  }))

  const totalAnnual = forecastData.length > 0
    ? forecastData[forecastData.length - 1].cumulativeCost
    : new Decimal(0)

  const averageMonthly = forecastData.length > 0
    ? totalAnnual.div(12)
    : new Decimal(0)

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Annual Forecast</h2>
          <p className="text-muted-foreground">
            12-month projection based on current parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(startMonth)}
            onValueChange={(value) => setStartMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => {
                const date = new Date(2024, month - 1, 1)
                return (
                  <SelectItem key={month} value={String(month)}>
                    {date.toLocaleString("default", { month: "long" })}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Select
            value={String(startYear)}
            onValueChange={(value) => setStartYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => handleExport("pdf")} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button onClick={() => handleExport("excel")} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button onClick={() => handleExport("csv")} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <EmailReportDialog projectId={projectId} reportType="annual" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAnnual, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageMonthly, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projection Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData.length > 0 && (
                <>
                  {forecastData[0].monthName} {forecastData[0].year} -{" "}
                  {forecastData[forecastData.length - 1].monthName}{" "}
                  {forecastData[forecastData.length - 1].year}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Projected Costs</CardTitle>
            <CardDescription>Cost per month over 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => {
                    const num = Math.abs(value)
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
                    return num.toString()
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#3b82f6"
                  name="Monthly Cost"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Cost</CardTitle>
            <CardDescription>Running total over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => {
                    const num = Math.abs(value)
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
                    return num.toString()
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Cumulative Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Month-by-Month Breakdown</CardTitle>
          <CardDescription>Detailed projection for each month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Projected Cost</th>
                  <th className="text-right p-2">Cumulative</th>
                  <th className="text-right p-2">Operating Hours</th>
                  <th className="text-right p-2">Cost/Hour</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((f, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">
                      {f.monthName} {f.year}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(f.projectedCost, currency)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(f.cumulativeCost, currency)}
                    </td>
                    <td className="text-right p-2">
                      {f.operatingHours.toFixed(1)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(f.costPerHour, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
