"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { EmailReportDialog } from "@/components/email-report-dialog"
import { formatCurrency } from "@/lib/calculations"
import Decimal from "decimal.js"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

interface MonthlySummaryReportProps {
  projectId: string
  currency: string
}

export function MonthlySummaryReport({ projectId, currency }: MonthlySummaryReportProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchReport()
  }, [projectId, selectedMonth, selectedYear])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`
      )
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load monthly report",
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
  }

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/reports/export/${format}?month=${selectedMonth}&year=${selectedYear}`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = response.headers.get("Content-Disposition")?.split('filename="')[1]?.replace(/"/g, "") || `report.${format === "excel" ? "xlsx" : format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export successful",
          description: `Report exported as ${format.toUpperCase()}`,
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

  if (!reportData) {
    return null
  }

  const { report, trend, healthScore } = reportData

  // Prepare cost breakdown for pie chart
  const costBreakdown = [
    { name: "Fixed Costs", value: report.fixedCosts.toNumber() },
    { name: "Variable Costs", value: report.variableCosts.toNumber() },
    { name: "Depreciation", value: report.depreciation.toNumber() },
  ]

  // Prepare trend data for line chart
  const trendChartData = trend.map((t: any) => ({
    month: t.month.substring(0, 3),
    cost: t.totalCost.toNumber(),
    hours: t.operatingHours.toNumber(),
  }))

  // Prepare member allocation data
  const memberAllocation = report.memberAllocations.map((m: any, index: number) => ({
    name: m.memberName.split("@")[0],
    cost: m.allocatedCost.toNumber(),
    color: COLORS[index % COLORS.length],
  }))

  const totalCost = report.totalCost.toNumber()
  const fixedPercent = totalCost > 0 ? (report.fixedCosts.toNumber() / totalCost * 100).toFixed(1) : "0"
  const variablePercent = totalCost > 0 ? (report.variableCosts.toNumber() / totalCost * 100).toFixed(1) : "0"
  const depPercent = totalCost > 0 ? (report.depreciation.toNumber() / totalCost * 100).toFixed(1) : "0"

  // Generate months/years for selector
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monthly Summary Report</h2>
          <p className="text-muted-foreground">
            {report.month} {report.year} - Cost breakdown and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
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
            value={String(selectedYear)}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
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
            <EmailReportDialog projectId={projectId} reportType="monthly" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(report.totalCost, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operating Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.operatingHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(report.costPerHour, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthScore.score.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {healthScore.score >= 80 ? "Excellent" :
               healthScore.score >= 60 ? "Good" :
               healthScore.score >= 40 ? "Fair" : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Monthly cost distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3-Month Trend</CardTitle>
            <CardDescription>Cost and hours over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cost"
                  stroke={COLORS[0]}
                  name="Total Cost"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="hours"
                  stroke={COLORS[1]}
                  name="Operating Hours"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Details and Member Allocation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Details</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[0] }} />
                <span className="text-sm">Fixed Costs</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(report.fixedCosts, currency)}
                </div>
                <div className="text-xs text-muted-foreground">{fixedPercent}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[1] }} />
                <span className="text-sm">Variable Costs</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(report.variableCosts, currency)}
                </div>
                <div className="text-xs text-muted-foreground">{variablePercent}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[2] }} />
                <span className="text-sm">Depreciation</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(report.depreciation, currency)}
                </div>
                <div className="text-xs text-muted-foreground">{depPercent}%</div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency(report.totalCost, currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-Member Allocation</CardTitle>
            <CardDescription>Cost distribution by team member</CardDescription>
          </CardHeader>
          <CardContent>
            {memberAllocation.length > 0 ? (
              <div className="space-y-3">
                {memberAllocation.map((member: any) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(member.cost, currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No team members</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Score Factors */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Score Breakdown</CardTitle>
          <CardDescription>Factors contributing to the health score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthScore.factors.map((factor: any) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{factor.name}</span>
                  <span className="font-semibold">
                    {factor.score.toFixed(1)} / {factor.weight}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(factor.score / factor.weight) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
