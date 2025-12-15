"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, DollarSign, AlertTriangle } from "lucide-react"
import Decimal from "decimal.js"
import {
  calculateTotalFixedCosts,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  formatCurrency,
} from "@/lib/calculations"

interface OperatingParameters {
  operatingHoursPerMonth: string
  fuelCostPerHour: string
  maintenanceCostPerHour: string
  insuranceMonthly: string
  staffSalariesMonthly: string
  facilityRentMonthly: string
  otherExpenses: Array<{ description: string; amount: string }>
}

interface OperatingParametersFormProps {
  projectId: string
  operatingParams: OperatingParameters | null
  currency: string
  canEdit: boolean
  onRefresh: () => void
}

export function OperatingParametersForm({
  projectId,
  operatingParams,
  currency,
  canEdit,
  onRefresh,
}: OperatingParametersFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OperatingParameters>({
    operatingHoursPerMonth: "0",
    fuelCostPerHour: "0",
    maintenanceCostPerHour: "0",
    insuranceMonthly: "0",
    staffSalariesMonthly: "0",
    facilityRentMonthly: "0",
    otherExpenses: [],
  })

  useEffect(() => {
    if (operatingParams) {
      setFormData(operatingParams)
    }
  }, [operatingParams])

  // Real-time calculations
  const calculations = useMemo(() => {
    const operatingHours = new Decimal(formData.operatingHoursPerMonth || "0")
    
    // Fixed costs
    const fixedCosts = calculateTotalFixedCosts(
      formData.insuranceMonthly || "0",
      formData.staffSalariesMonthly || "0",
      formData.facilityRentMonthly || "0",
      formData.otherExpenses.map(e => ({ amount: e.amount || "0" }))
    )

    // Variable costs
    const variableCosts = calculateMonthlyVariableCosts(
      formData.fuelCostPerHour || "0",
      formData.maintenanceCostPerHour || "0",
      operatingHours
    )

    // Total monthly cost (without depreciation - that's calculated separately)
    const totalMonthlyCost = fixedCosts.plus(variableCosts)

    // Cost per hour
    const costPerHour = operatingHours.gt(0)
      ? totalMonthlyCost.div(operatingHours)
      : new Decimal(0)

    // Warnings
    const warnings: string[] = []
    if (operatingHours.gt(500)) {
      warnings.push("Operating hours exceed 500/month. Please verify this is correct.")
    }
    if (operatingHours.lt(0)) {
      warnings.push("Operating hours cannot be negative.")
    }

    return {
      fixedCosts,
      variableCosts,
      totalMonthlyCost,
      costPerHour,
      operatingHours,
      warnings,
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/operating-parameters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Operating parameters updated",
          description: "Your operating costs have been saved successfully.",
        })
        onRefresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update operating parameters",
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

  const addOtherExpense = () => {
    setFormData({
      ...formData,
      otherExpenses: [...formData.otherExpenses, { description: "", amount: "0" }],
    })
  }

  const removeOtherExpense = (index: number) => {
    setFormData({
      ...formData,
      otherExpenses: formData.otherExpenses.filter((_, i) => i !== index),
    })
  }

  const updateOtherExpense = (index: number, field: "description" | "amount", value: string) => {
    const updated = [...formData.otherExpenses]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, otherExpenses: updated })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Operating Parameters</CardTitle>
          <CardDescription>
            Configure monthly operating costs and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="variable" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="variable">Variable Costs</TabsTrigger>
                <TabsTrigger value="fixed">Fixed Costs</TabsTrigger>
              </TabsList>

              <TabsContent value="variable" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours per Month *</Label>
                  <Input
                    id="operatingHours"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.operatingHoursPerMonth}
                    onChange={(e) => setFormData({ ...formData, operatingHoursPerMonth: e.target.value })}
                    disabled={!canEdit}
                    required
                  />
                  {calculations.warnings.map((warning, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      {warning}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelCost">Fuel Cost per Hour</Label>
                  <Input
                    id="fuelCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fuelCostPerHour}
                    onChange={(e) => setFormData({ ...formData, fuelCostPerHour: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceCost">Maintenance Cost per Hour</Label>
                  <Input
                    id="maintenanceCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maintenanceCostPerHour}
                    onChange={(e) => setFormData({ ...formData, maintenanceCostPerHour: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Variable Costs:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.variableCosts, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost per Hour:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.costPerHour, currency)}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fixed" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance (Monthly)</Label>
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.insuranceMonthly}
                    onChange={(e) => setFormData({ ...formData, insuranceMonthly: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Salaries (Monthly)</Label>
                  <Input
                    id="staff"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.staffSalariesMonthly}
                    onChange={(e) => setFormData({ ...formData, staffSalariesMonthly: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facility">Facility Rent (Monthly)</Label>
                  <Input
                    id="facility"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.facilityRentMonthly}
                    onChange={(e) => setFormData({ ...formData, facilityRentMonthly: e.target.value })}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Other Expenses</Label>
                    {canEdit && (
                      <Button type="button" variant="outline" size="sm" onClick={addOtherExpense}>
                        Add Expense
                      </Button>
                    )}
                  </div>
                  {formData.otherExpenses.map((expense, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Description"
                        value={expense.description}
                        onChange={(e) => updateOtherExpense(index, "description", e.target.value)}
                        disabled={!canEdit}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) => updateOtherExpense(index, "amount", e.target.value)}
                        disabled={!canEdit}
                        className="w-32"
                      />
                      {canEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOtherExpense(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Fixed Costs:</span>
                    <span className="font-semibold">
                      {formatCurrency(calculations.fixedCosts, currency)}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Monthly Cost</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(calculations.totalMonthlyCost, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    (Excluding depreciation - calculated separately)
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>

            {canEdit && (
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Operating Parameters
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
