"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"
import Decimal from "decimal.js"
import {
  calculateTotalFixedCosts,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  calculateCostPerHour,
} from "@/lib/calculations"

interface OperatingParams {
  id: string
  operatingHoursPerMonth: Decimal
  fuelCostPerHour: Decimal
  maintenanceCostPerHour: Decimal
  insuranceMonthly: Decimal
  staffSalariesMonthly: Decimal
  facilityRentMonthly: Decimal
  otherExpenses: Array<{ description: string; amount: number }> | null
}

export default function OperatingParameters({
  projectId,
  currency,
}: {
  projectId: string
  currency: string
}) {
  const { toast } = useToast()
  const [params, setParams] = useState<OperatingParams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    operatingHoursPerMonth: "0",
    fuelCostPerHour: "0",
    maintenanceCostPerHour: "0",
    insuranceMonthly: "0",
    staffSalariesMonthly: "0",
    facilityRentMonthly: "0",
    otherExpenses: [] as Array<{ description: string; amount: string }>,
  })

  useEffect(() => {
    fetchParams()
  }, [projectId])

  const fetchParams = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/operating-parameters`)
      if (response.ok) {
        const data = await response.json()
        setParams(data)
        setFormData({
          operatingHoursPerMonth: data.operatingHoursPerMonth?.toString() || "0",
          fuelCostPerHour: data.fuelCostPerHour?.toString() || "0",
          maintenanceCostPerHour: data.maintenanceCostPerHour?.toString() || "0",
          insuranceMonthly: data.insuranceMonthly?.toString() || "0",
          staffSalariesMonthly: data.staffSalariesMonthly?.toString() || "0",
          facilityRentMonthly: data.facilityRentMonthly?.toString() || "0",
          otherExpenses: data.otherExpenses || [],
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load operating parameters",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        operatingHoursPerMonth: parseFloat(formData.operatingHoursPerMonth),
        fuelCostPerHour: parseFloat(formData.fuelCostPerHour),
        maintenanceCostPerHour: parseFloat(formData.maintenanceCostPerHour),
        insuranceMonthly: parseFloat(formData.insuranceMonthly),
        staffSalariesMonthly: parseFloat(formData.staffSalariesMonthly),
        facilityRentMonthly: parseFloat(formData.facilityRentMonthly),
        otherExpenses: formData.otherExpenses
          .filter((exp) => exp.description && parseFloat(exp.amount) > 0)
          .map((exp) => ({
            description: exp.description,
            amount: parseFloat(exp.amount),
          })),
      }

      const response = await fetch(`/api/projects/${projectId}/operating-parameters`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Parameters updated",
          description: "Operating parameters have been saved successfully.",
        })
        fetchParams()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to save parameters",
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
      setIsSaving(false)
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

  // Real-time calculations
  const operatingHours = parseFloat(formData.operatingHoursPerMonth) || 0
  const fuelCost = parseFloat(formData.fuelCostPerHour) || 0
  const maintenanceCost = parseFloat(formData.maintenanceCostPerHour) || 0
  const insurance = parseFloat(formData.insuranceMonthly) || 0
  const staff = parseFloat(formData.staffSalariesMonthly) || 0
  const facility = parseFloat(formData.facilityRentMonthly) || 0
  const otherTotal = formData.otherExpenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0
  )

  const otherExpensesArray = formData.otherExpenses.map(exp => ({ amount: parseFloat(exp.amount) || 0 }))
  const fixedCosts = calculateTotalFixedCosts(insurance, staff, facility, otherExpensesArray)
  const variableCostPerHour = new Decimal(fuelCost).plus(new Decimal(maintenanceCost))
  const variableCosts = calculateMonthlyVariableCosts(fuelCost, maintenanceCost, operatingHours)
  const totalMonthlyCost = fixedCosts.plus(variableCosts) // Depreciation calculated separately

  const costPerHour = operatingHours > 0
    ? calculateCostPerHour(totalMonthlyCost, operatingHours)
    : new Decimal(0)

  const showWarning = operatingHours > 500

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Operating Parameters</h2>
        <p className="text-muted-foreground">Configure monthly operating costs and parameters</p>
      </div>

      <form onSubmit={handleSave}>
        <Tabs defaultValue="fixed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="fixed">Fixed Costs</TabsTrigger>
            <TabsTrigger value="variable">Variable Costs</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="fixed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fixed Monthly Costs</CardTitle>
                <CardDescription>Costs that remain constant regardless of usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance (Monthly)</Label>
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.insuranceMonthly}
                    onChange={(e) => setFormData({ ...formData, insuranceMonthly: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff/Salaries (Monthly)</Label>
                  <Input
                    id="staff"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.staffSalariesMonthly}
                    onChange={(e) => setFormData({ ...formData, staffSalariesMonthly: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility">Hangar/Facility Rent (Monthly)</Label>
                  <Input
                    id="facility"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.facilityRentMonthly}
                    onChange={(e) => setFormData({ ...formData, facilityRentMonthly: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Other Expenses</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOtherExpense}>
                      Add Expense
                    </Button>
                  </div>
                  {formData.otherExpenses.map((expense, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Description"
                        value={expense.description}
                        onChange={(e) => updateOtherExpense(index, "description", e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) => updateOtherExpense(index, "amount", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOtherExpense(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variable" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Variable Costs</CardTitle>
                <CardDescription>Costs that vary with operating hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours Per Month</Label>
                  <Input
                    id="operatingHours"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1000"
                    value={formData.operatingHoursPerMonth}
                    onChange={(e) => setFormData({ ...formData, operatingHoursPerMonth: e.target.value })}
                  />
                  {showWarning && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Operating hours exceed recommended maximum (500 hours/month)</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelCost">Fuel Cost Per Hour</Label>
                  <Input
                    id="fuelCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fuelCostPerHour}
                    onChange={(e) => setFormData({ ...formData, fuelCostPerHour: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceCost">Maintenance Cost Per Hour</Label>
                  <Input
                    id="maintenanceCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maintenanceCostPerHour}
                    onChange={(e) => setFormData({ ...formData, maintenanceCostPerHour: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
                <CardDescription>Real-time calculation preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fixed Costs</p>
                    <p className="text-2xl font-bold">{formatCurrency(fixedCosts, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variable Costs</p>
                    <p className="text-2xl font-bold">{formatCurrency(variableCosts, currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCost, currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      (Excluding depreciation - calculated separately)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Per Hour</p>
                    <p className="text-2xl font-bold">{formatCurrency(costPerHour, currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Parameters
          </Button>
        </div>
      </form>
    </div>
  )
}
