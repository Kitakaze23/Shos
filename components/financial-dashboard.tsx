"use client"

import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/calculations"
import Decimal from "decimal.js"

interface FinancialDashboardProps {
  project: any
  metrics: {
    totalMonthlyDepreciation: Decimal
    fixedCosts: Decimal
    variableCosts: Decimal
    totalMonthlyCost: Decimal
    costPerHour: Decimal
    breakEvenHours: Decimal
    annualCost: Decimal
    operatingHours: Decimal
    memberCosts: Array<{
      member: any
      monthlyCost: Decimal
      annualCost: Decimal
    }>
    currency: string
  }
  onRefresh: () => void
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export const FinancialDashboard = memo(function FinancialDashboard({ project, metrics, onRefresh }: FinancialDashboardProps) {
  // Prepare cost breakdown data for pie chart
  const costBreakdown = [
    {
      name: "Fixed Costs",
      value: metrics.fixedCosts.toNumber(),
      color: COLORS[0],
    },
    {
      name: "Variable Costs",
      value: metrics.variableCosts.toNumber(),
      color: COLORS[1],
    },
    {
      name: "Depreciation",
      value: metrics.totalMonthlyDepreciation.toNumber(),
      color: COLORS[2],
    },
  ]

  // Prepare team allocation data for bar chart
  const teamAllocation = metrics.memberCosts.map((mc, index) => ({
    name: mc.member.user.name || mc.member.user.email.split("@")[0],
    monthly: mc.monthlyCost.toNumber(),
    annual: mc.annualCost.toNumber(),
    share: parseFloat(mc.member.ownershipShare || "0"),
    color: COLORS[index % COLORS.length],
  }))

  const totalCost = metrics.totalMonthlyCost.toNumber()
  const fixedPercent = totalCost > 0 
    ? (metrics.fixedCosts.toNumber() / totalCost * 100).toFixed(1)
    : "0"
  const variablePercent = totalCost > 0
    ? (metrics.variableCosts.toNumber() / totalCost * 100).toFixed(1)
    : "0"
  const depPercent = totalCost > 0
    ? (metrics.totalMonthlyDepreciation.toNumber() / totalCost * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-4">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, metrics.currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Details</CardTitle>
            <CardDescription>Monthly cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[0] }} />
                  <span className="text-sm font-medium">Fixed Costs</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(metrics.fixedCosts, metrics.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">{fixedPercent}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[1] }} />
                  <span className="text-sm font-medium">Variable Costs</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(metrics.variableCosts, metrics.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">{variablePercent}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[2] }} />
                  <span className="text-sm font-medium">Depreciation</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(metrics.totalMonthlyDepreciation, metrics.currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">{depPercent}%</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Monthly Cost</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(metrics.totalMonthlyCost, metrics.currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Allocation */}
      {teamAllocation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Cost Allocation</CardTitle>
            <CardDescription>
              Cost distribution by {project.costAllocationMethod === "by_hours" ? "operating hours" : 
                project.costAllocationMethod === "percentage" ? "ownership share" : "equal split"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamAllocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => {
                    const num = Math.abs(value)
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
                    return num.toString()
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, metrics.currency)}
                />
                <Legend />
                <Bar dataKey="monthly" fill={COLORS[0]} name="Monthly Cost" />
                <Bar dataKey="annual" fill={COLORS[1]} name="Annual Cost" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {teamAllocation.map((member) => (
                <div key={member.name} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    {project.costAllocationMethod === "percentage" && (
                      <div className="text-xs text-muted-foreground">
                        {member.share}% ownership
                      </div>
                    )}
                    {project.costAllocationMethod === "by_hours" && (
                      <div className="text-xs text-muted-foreground">
                        {metrics.memberCosts.find(mc => 
                          (mc.member.user.name || mc.member.user.email) === member.name
                        )?.member.operatingHoursPerMonth || "0"} hours/month
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(member.monthly, metrics.currency)}/month
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(member.annual, metrics.currency)}/year
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})
