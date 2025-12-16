"use client"

import { useState, useEffect, useMemo, memo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Settings, Users, Package, TrendingUp, DollarSign, Clock, Target, FileText } from "lucide-react"
import Link from "next/link"
import Decimal from "decimal.js"
import {
  calculateTotalFixedCosts,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  calculateCostPerHour,
  calculateBreakEvenHours,
  calculateAnnualDepreciation,
  calculateMonthlyDepreciation,
  formatCurrency,
  calculateMemberCost,
} from "@/lib/calculations"
import { FinancialDashboard } from "@/components/financial-dashboard"
import { EquipmentList } from "@/components/equipment-list"
import { OperatingParametersForm } from "@/components/operating-parameters-form"
import { TeamMembersList } from "@/components/team-members-list"

interface Project {
  id: string
  name: string
  description: string | null
  currency: string
  costAllocationMethod: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  equipment: Array<{
    id: string
    name: string
    category: string
    purchasePrice: string
    salvageValue: string | null
    serviceLifeYears: number
    depreciationMethod: string
    serialNumber: string | null
    registrationNumber: string | null
    notes: string | null
  }>
  members: Array<{
    id: string
    role: string
    ownershipShare: string
    operatingHoursPerMonth: string
    status: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
  operatingParams: {
    operatingHoursPerMonth: string
    fuelCostPerHour: string
    maintenanceCostPerHour: string
    insuranceMonthly: string
    staffSalariesMonthly: string
    facilityRentMonthly: string
    otherExpenses: Array<{ description: string; amount: string }>
  } | null | Array<{
    operatingHoursPerMonth: string
    fuelCostPerHour: string
    maintenanceCostPerHour: string
    insuranceMonthly: string
    staffSalariesMonthly: string
    facilityRentMonthly: string
    otherExpenses: Array<{ description: string; amount: string }>
  }>
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        })
        router.push("/dashboard/projects")
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
  }, [params.id, toast, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (!project) return null

    const currency = project.currency || "USD"
    
    // Calculate total depreciation
    const totalMonthlyDepreciation = project.equipment.reduce((sum, eq) => {
      const annual = calculateAnnualDepreciation(
        eq.purchasePrice,
        eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1).toString(),
        eq.serviceLifeYears
      )
      const monthly = calculateMonthlyDepreciation(annual)
      return sum.plus(monthly)
    }, new Decimal(0))

    // Get current operating parameters (first one if array, or single object)
    const currentParams = Array.isArray(project.operatingParams)
      ? project.operatingParams.find((p: any) => !p.month) || project.operatingParams[0]
      : project.operatingParams

    const opParams = (currentParams && !Array.isArray(currentParams)) ? currentParams : {
      operatingHoursPerMonth: "0",
      fuelCostPerHour: "0",
      maintenanceCostPerHour: "0",
      insuranceMonthly: "0",
      staffSalariesMonthly: "0",
      facilityRentMonthly: "0",
      otherExpenses: [],
    }

    const operatingHours = new Decimal(opParams.operatingHoursPerMonth)
    
    // Calculate fixed costs
    const fixedCosts = calculateTotalFixedCosts(
      opParams.insuranceMonthly,
      opParams.staffSalariesMonthly,
      opParams.facilityRentMonthly,
      opParams.otherExpenses.map(e => ({ amount: e.amount }))
    )

    // Calculate variable costs
    const variableCosts = calculateMonthlyVariableCosts(
      opParams.fuelCostPerHour,
      opParams.maintenanceCostPerHour,
      operatingHours
    )

    // Calculate total monthly cost
    const totalMonthlyCost = calculateTotalMonthlyCost(
      fixedCosts,
      variableCosts,
      totalMonthlyDepreciation
    )

    // Calculate cost per hour
    const costPerHour = calculateCostPerHour(totalMonthlyCost, operatingHours)

    // Calculate break-even hours
    const variableCostPerHour = new Decimal(opParams.fuelCostPerHour)
      .plus(opParams.maintenanceCostPerHour)
    const breakEvenHours = calculateBreakEvenHours(
      fixedCosts,
      totalMonthlyDepreciation,
      variableCostPerHour
    )

    // Calculate annual cost
    const annualCost = totalMonthlyCost.mul(12)

    // Calculate member costs
    const activeMembers = project.members.filter(m => m.status === "active")
    const totalMemberHours = activeMembers.reduce((sum, m) => 
      sum.plus(m.operatingHoursPerMonth), new Decimal(0)
    )

    const memberCosts = activeMembers.map(member => {
      const cost = calculateMemberCost(
        totalMonthlyCost,
        project.costAllocationMethod as "by_hours" | "equal" | "percentage",
        {
          hours: member.operatingHoursPerMonth,
          share: member.ownershipShare,
        },
        {
          totalHours: totalMemberHours,
          memberCount: activeMembers.length,
        }
      )
      return {
        member,
        monthlyCost: cost,
        annualCost: cost.mul(12),
      }
    })

    return {
      totalMonthlyDepreciation,
      fixedCosts,
      variableCosts,
      totalMonthlyCost,
      costPerHour,
      breakEvenHours,
      annualCost,
      operatingHours,
      memberCosts,
      currency,
    }
  }, [project])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const isOwner = project.owner.id === session?.user?.id
  const member = project.members.find(m => m.user.id === session?.user?.id)
  const canEdit = isOwner || member?.role === "admin" || member?.role === "member"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {project.description || "No description"}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Shared with {project.members.length} {project.members.length === 1 ? "person" : "people"}
          </p>
        </div>
        {canEdit && (
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/projects/${params.id}/settings`)}
            className="touch-target w-full sm:w-auto"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      {financialMetrics && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financialMetrics.totalMonthlyCost, financialMetrics.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(financialMetrics.annualCost, financialMetrics.currency)} annually
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
                {formatCurrency(financialMetrics.costPerHour, financialMetrics.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {financialMetrics.operatingHours.toFixed(1)} hours/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Break-Even Hours</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialMetrics.breakEvenHours.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Hours per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financialMetrics.totalMonthlyDepreciation, financialMetrics.currency)}
              </div>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 h-auto">
          <TabsTrigger value="dashboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Package className="mr-2 h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="costs">
            <DollarSign className="mr-2 h-4 w-4" />
            Operating Costs
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {financialMetrics && (
            <FinancialDashboard
              project={project}
              metrics={financialMetrics}
              onRefresh={fetchProject}
            />
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <EquipmentList
            projectId={project.id}
            equipment={project.equipment}
            currency={project.currency}
            canEdit={canEdit}
            onRefresh={fetchProject}
          />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <OperatingParametersForm
            projectId={project.id}
            operatingParams={Array.isArray(project.operatingParams) 
              ? (project.operatingParams.find((p: any) => !p.month) || project.operatingParams[0] || null)
              : project.operatingParams}
            currency={project.currency}
            canEdit={canEdit}
            onRefresh={fetchProject}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamMembersList
            projectId={project.id}
            members={project.members}
            ownerId={project.owner.id}
            costAllocationMethod={project.costAllocationMethod}
            totalMonthlyCost={financialMetrics?.totalMonthlyCost}
            currency={project.currency}
            canEdit={canEdit}
            onRefresh={fetchProject}
          />
        </TabsContent>
      </Tabs>

      {/* Reports Link */}
      <div className="flex justify-end pt-4">
        <Button asChild variant="outline" className="touch-target w-full sm:w-auto">
          <Link href={`/dashboard/projects/${params.id}/reports`}>
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Link>
        </Button>
      </div>
    </div>
  )
}
