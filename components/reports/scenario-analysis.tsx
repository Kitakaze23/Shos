"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"
import Decimal from "decimal.js"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ScenarioAnalysisReportProps {
  projectId: string
  currency: string
}

interface Scenario {
  name: string
  operatingHoursMultiplier?: number
  costMultiplier?: number
}

export function ScenarioAnalysisReport({
  projectId,
  currency,
}: ScenarioAnalysisReportProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { name: "High Usage", operatingHoursMultiplier: 1.2 },
    { name: "Low Usage", operatingHoursMultiplier: 0.8 },
    { name: "Cost Increase", costMultiplier: 1.1 },
    { name: "Cost Decrease", costMultiplier: 0.9 },
  ])
  const [results, setResults] = useState<any[]>([])
  const [newScenario, setNewScenario] = useState({
    name: "",
    operatingHoursMultiplier: "",
    costMultiplier: "",
  })

  const handleAddScenario = () => {
    if (!newScenario.name.trim()) {
      toast({
        title: "Error",
        description: "Scenario name is required",
        variant: "destructive",
      })
      return
    }

    if (!newScenario.operatingHoursMultiplier && !newScenario.costMultiplier) {
      toast({
        title: "Error",
        description: "At least one multiplier is required",
        variant: "destructive",
      })
      return
    }

    setScenarios([
      ...scenarios,
      {
        name: newScenario.name,
        operatingHoursMultiplier: newScenario.operatingHoursMultiplier
          ? parseFloat(newScenario.operatingHoursMultiplier)
          : undefined,
        costMultiplier: newScenario.costMultiplier
          ? parseFloat(newScenario.costMultiplier)
          : undefined,
      },
    ])

    setNewScenario({ name: "", operatingHoursMultiplier: "", costMultiplier: "" })
  }

  const handleRemoveScenario = (index: number) => {
    setScenarios(scenarios.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/reports/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarios }),
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to analyze scenarios",
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

  // Prepare chart data
  const chartData = results.map((r) => ({
    name: r.scenarioName,
    monthlyCost: r.totalMonthlyCost.toNumber(),
    annualCost: r.annualCost.toNumber(),
    costPerHour: r.costPerHour.toNumber(),
    breakEvenHours: r.breakEvenHours.toNumber(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Scenario Analysis</h2>
        <p className="text-muted-foreground">
          Compare different usage and cost scenarios
        </p>
      </div>

      {/* Scenario Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Scenarios</CardTitle>
          <CardDescription>
            Define scenarios by adjusting operating hours or cost multipliers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Scenarios */}
          <div className="space-y-2">
            {scenarios.map((scenario, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {scenario.operatingHoursMultiplier && (
                      <span>Hours: {scenario.operatingHoursMultiplier}x</span>
                    )}
                    {scenario.operatingHoursMultiplier && scenario.costMultiplier && " • "}
                    {scenario.costMultiplier && (
                      <span>Costs: {scenario.costMultiplier}x</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveScenario(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Scenario */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t">
            <Input
              placeholder="Scenario name"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Hours multiplier (e.g., 1.2)"
              value={newScenario.operatingHoursMultiplier}
              onChange={(e) =>
                setNewScenario({ ...newScenario, operatingHoursMultiplier: e.target.value })
              }
            />
            <Input
              type="number"
              step="0.1"
              placeholder="Cost multiplier (e.g., 1.1)"
              value={newScenario.costMultiplier}
              onChange={(e) =>
                setNewScenario({ ...newScenario, costMultiplier: e.target.value })
              }
            />
            <Button onClick={handleAddScenario}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          <Button onClick={handleAnalyze} disabled={isLoading || scenarios.length === 0} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Scenarios
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
              <CardDescription>Monthly cost comparison across scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
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
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                  <Legend />
                  <Bar dataKey="monthlyCost" fill="#3b82f6" name="Monthly Cost" />
                  <Bar dataKey="annualCost" fill="#10b981" name="Annual Cost" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Scenario Results</CardTitle>
              <CardDescription>Complete analysis for each scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">Monthly Cost</th>
                      <th className="text-right p-2">Annual Cost</th>
                      <th className="text-right p-2">Cost/Hour</th>
                      <th className="text-right p-2">Break-Even Hours</th>
                      <th className="text-right p-2">Difference</th>
                      <th className="text-right p-2">Difference %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{result.scenarioName}</td>
                        <td className="text-right p-2">
                          {formatCurrency(result.totalMonthlyCost, currency)}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(result.annualCost, currency)}
                        </td>
                        <td className="text-right p-2">
                          {formatCurrency(result.costPerHour, currency)}
                        </td>
                        <td className="text-right p-2">
                          {result.breakEvenHours.toFixed(1)} hours
                        </td>
                        <td
                          className={`text-right p-2 ${
                            result.difference.gte(0) ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {result.difference.gte(0) ? "+" : ""}
                          {formatCurrency(result.difference, currency)}
                        </td>
                        <td
                          className={`text-right p-2 ${
                            result.differencePercent.gte(0) ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {result.differencePercent.gte(0) ? "+" : ""}
                          {result.differencePercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
