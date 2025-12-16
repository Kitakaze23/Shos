"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, TrendingUp, Clock, Target } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface FinancialData {
  monthlyCost: number
  costPerHour: number
  breakEvenHours: number
  fixedCosts: number
  variableCosts: number
  depreciation: number
  costBreakdown: {
    fixed: number
    variable: number
    depreciation: number
  }
  teamAllocation: Array<{
    memberId: string
    userId: string
    name: string
    ownershipShare: number
    operatingHours: number
    allocatedCost: number
    allocatedCostAnnual: number
  }>
  currency: string
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function ProjectDashboard({
  projectId,
  currency,
}: {
  projectId: string
  currency: string
}) {
  const { toast } = useToast()
  const [data, setData] = useState<FinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCalculations = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/calculations`)
      if (response.ok) {
        const financialData = await response.json()
        setData(financialData)
      } else {
        toast({
          title: "Error",
          description: "Failed to load financial data",
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
    fetchCalculations()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCalculations, 30000)
    return () => clearInterval(interval)
  }, [fetchCalculations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No financial data available. Add equipment and operating parameters to see calculations.
          </p>
        </CardContent>
      </Card>
    )
  }

  const pieData = [
    { name: "Fixed Costs", value: data.costBreakdown.fixed },
    { name: "Variable Costs", value: data.costBreakdown.variable },
    { name: "Depreciation", value: data.costBreakdown.depreciation },
  ]

  const barData = data.teamAllocation.map((member) => ({
    name: member.name,
    "Annual Cost": member.allocatedCostAnnual,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.monthlyCost, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.monthlyCost * 12, currency)} annually
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.costPerHour, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Per operating hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Break-even Hours</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.breakEvenHours)} hours
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fixed Costs:</span>
                <span className="font-medium">{formatCurrency(data.costBreakdown.fixed, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Variable Costs:</span>
                <span className="font-medium">{formatCurrency(data.costBreakdown.variable, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Depreciation:</span>
                <span className="font-medium">{formatCurrency(data.costBreakdown.depreciation, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Allocation</CardTitle>
            <CardDescription>Annual cost per team member</CardDescription>
          </CardHeader>
          <CardContent>
            {data.teamAllocation.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No team members assigned
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Legend />
                    <Bar dataKey="Annual Cost" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.teamAllocation.map((member) => (
                    <div key={member.memberId} className="flex justify-between text-sm">
                      <span>
                        {member.name} ({member.ownershipShare}%)
                      </span>
                      <span className="font-medium">
                        {formatCurrency(member.allocatedCostAnnual, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
