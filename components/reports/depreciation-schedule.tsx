"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"
import Decimal from "decimal.js"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DepreciationScheduleReportProps {
  projectId: string
  currency: string
}

export function DepreciationScheduleReport({
  projectId,
  currency,
}: DepreciationScheduleReportProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [scheduleData, setScheduleData] = useState<any[]>([])

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/reports/depreciation`)
      if (response.ok) {
        const data = await response.json()
        setScheduleData(data.schedule)
      } else {
        toast({
          title: "Error",
          description: "Failed to load depreciation schedule",
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
  }, [projectId, toast])

  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/reports/export/${format}?type=depreciation`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = response.headers.get("Content-Disposition")?.split('filename="')[1]?.replace(/"/g, "") || `depreciation.${format === "excel" ? "xlsx" : format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export successful",
          description: `Depreciation schedule exported as ${format.toUpperCase()}`,
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

  // Calculate totals
  const totalPurchasePrice = scheduleData.reduce(
    (sum, item) => sum.plus(item.purchasePrice),
    new Decimal(0)
  )
  const totalSalvageValue = scheduleData.reduce(
    (sum, item) => sum.plus(item.salvageValue),
    new Decimal(0)
  )
  const totalAnnualDepreciation = scheduleData.reduce(
    (sum, item) => sum.plus(item.annualDepreciation),
    new Decimal(0)
  )
  const totalMonthlyDepreciation = scheduleData.reduce(
    (sum, item) => sum.plus(item.monthlyDepreciation),
    new Decimal(0)
  )
  const totalCurrentBookValue = scheduleData.reduce(
    (sum, item) => sum.plus(item.currentBookValue),
    new Decimal(0)
  )

  // Prepare chart data
  const bookValueData = scheduleData.map((item) => ({
    name: item.equipmentName.substring(0, 15),
    purchasePrice: item.purchasePrice.toNumber(),
    currentBookValue: item.currentBookValue.toNumber(),
    annualDepreciation: item.annualDepreciation.toNumber(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Depreciation Schedule</h2>
          <p className="text-muted-foreground">
            Equipment depreciation tracking and book values
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalPurchasePrice, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Salvage Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalSalvageValue, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Annual Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalAnnualDepreciation, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalMonthlyDepreciation, currency)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Book Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(totalCurrentBookValue, currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Price vs Book Value</CardTitle>
            <CardDescription>Current asset values</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
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
                <Bar dataKey="purchasePrice" fill="#3b82f6" name="Purchase Price" />
                <Bar dataKey="currentBookValue" fill="#10b981" name="Current Book Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual Depreciation by Equipment</CardTitle>
            <CardDescription>Depreciation amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
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
                <Bar dataKey="annualDepreciation" fill="#f59e0b" name="Annual Depreciation" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Depreciation Details</CardTitle>
          <CardDescription>Complete depreciation schedule for all equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Equipment</th>
                  <th className="text-right p-2">Purchase Price</th>
                  <th className="text-right p-2">Salvage Value</th>
                  <th className="text-right p-2">Service Life</th>
                  <th className="text-right p-2">Annual Depreciation</th>
                  <th className="text-right p-2">Monthly Depreciation</th>
                  <th className="text-right p-2">Years Remaining</th>
                  <th className="text-right p-2">Current Book Value</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((item) => (
                  <tr key={item.equipmentId} className="border-b">
                    <td className="p-2 font-medium">{item.equipmentName}</td>
                    <td className="text-right p-2">
                      {formatCurrency(item.purchasePrice, currency)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(item.salvageValue, currency)}
                    </td>
                    <td className="text-right p-2">{item.serviceLifeYears} years</td>
                    <td className="text-right p-2">
                      {formatCurrency(item.annualDepreciation, currency)}
                    </td>
                    <td className="text-right p-2">
                      {formatCurrency(item.monthlyDepreciation, currency)}
                    </td>
                    <td className="text-right p-2">
                      {item.yearsRemaining} {item.yearsRemaining === 1 ? "year" : "years"}
                    </td>
                    <td className="text-right p-2 font-semibold">
                      {formatCurrency(item.currentBookValue, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="p-2">Total</td>
                  <td className="text-right p-2">
                    {formatCurrency(totalPurchasePrice, currency)}
                  </td>
                  <td className="text-right p-2">
                    {formatCurrency(totalSalvageValue, currency)}
                  </td>
                  <td className="text-right p-2">-</td>
                  <td className="text-right p-2">
                    {formatCurrency(totalAnnualDepreciation, currency)}
                  </td>
                  <td className="text-right p-2">
                    {formatCurrency(totalMonthlyDepreciation, currency)}
                  </td>
                  <td className="text-right p-2">-</td>
                  <td className="text-right p-2">
                    {formatCurrency(totalCurrentBookValue, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
