import Decimal from "decimal.js"
import {
  calculateAnnualDepreciation,
  calculateMonthlyDepreciation,
  calculateTotalFixedCosts,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  calculateCostPerHour,
  calculateBreakEvenHours,
  calculateMemberCost,
  formatCurrency,
  compareScenarios,
  type Scenario,
} from "./calculations"

export interface MonthlyReportData {
  month: string
  year: number
  totalCost: Decimal
  fixedCosts: Decimal
  variableCosts: Decimal
  depreciation: Decimal
  operatingHours: Decimal
  costPerHour: Decimal
  memberAllocations: Array<{
    memberId: string
    memberName: string
    allocatedCost: Decimal
  }>
}

export interface AnnualForecastData {
  month: number
  monthName: string
  year: number
  projectedCost: Decimal
  cumulativeCost: Decimal
  operatingHours: Decimal
  costPerHour: Decimal
}

export interface DepreciationScheduleItem {
  equipmentId: string
  equipmentName: string
  purchasePrice: Decimal
  salvageValue: Decimal
  serviceLifeYears: number
  annualDepreciation: Decimal
  monthlyDepreciation: Decimal
  yearsRemaining: number
  currentBookValue: Decimal
}

export interface ScenarioAnalysisResult {
  scenarioName: string
  totalMonthlyCost: Decimal
  costPerHour: Decimal
  breakEvenHours: Decimal
  annualCost: Decimal
  difference: Decimal
  differencePercent: Decimal
}

/**
 * Generate monthly summary report data
 */
export function generateMonthlyReport(
  project: any,
  targetMonth?: Date
): MonthlyReportData {
  const now = targetMonth || new Date()
  const month = now.toLocaleString("default", { month: "long" })
  const year = now.getFullYear()

  // Calculate depreciation
  const totalMonthlyDepreciation = project.equipment.reduce((sum: Decimal, eq: any) => {
    const annual = calculateAnnualDepreciation(
      eq.purchasePrice,
      eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1).toString(),
      eq.serviceLifeYears
    )
    const monthly = calculateMonthlyDepreciation(annual)
    return sum.plus(monthly)
  }, new Decimal(0))

  // Get current operating parameters (month = null)
  const currentParams = Array.isArray(project.operatingParams)
    ? project.operatingParams.find((p: any) => !p.month) || project.operatingParams[0]
    : project.operatingParams

  const opParams = currentParams || {
    operatingHoursPerMonth: "0",
    fuelCostPerHour: "0",
    maintenanceCostPerHour: "0",
    insuranceMonthly: "0",
    staffSalariesMonthly: "0",
    facilityRentMonthly: "0",
    otherExpenses: [],
  }

  const operatingHours = new Decimal(opParams.operatingHoursPerMonth || "0")

  // Calculate costs
  const fixedCosts = calculateTotalFixedCosts(
    opParams.insuranceMonthly || "0",
    opParams.staffSalariesMonthly || "0",
    opParams.facilityRentMonthly || "0",
    opParams.otherExpenses.map((e: any) => ({ amount: e.amount || "0" }))
  )

  const variableCosts = calculateMonthlyVariableCosts(
    opParams.fuelCostPerHour || "0",
    opParams.maintenanceCostPerHour || "0",
    operatingHours
  )

  const totalCost = calculateTotalMonthlyCost(
    fixedCosts,
    variableCosts,
    totalMonthlyDepreciation
  )

  const costPerHour = calculateCostPerHour(totalCost, operatingHours)

  // Calculate member allocations
  const activeMembers = project.members.filter((m: any) => m.status === "active")
  const totalMemberHours = activeMembers.reduce(
    (sum: Decimal, m: any) => sum.plus(m.operatingHoursPerMonth || "0"),
    new Decimal(0)
  )

  const memberAllocations = activeMembers.map((member: any) => {
    const allocatedCost = calculateMemberCost(
      totalCost,
      project.costAllocationMethod as "by_hours" | "equal" | "percentage",
      {
        hours: member.operatingHoursPerMonth || "0",
        share: member.ownershipShare || "0",
      },
      {
        totalHours: totalMemberHours,
        memberCount: activeMembers.length,
      }
    )

    return {
      memberId: member.user.id,
      memberName: member.user.name || member.user.email,
      allocatedCost,
    }
  })

  return {
    month,
    year,
    totalCost,
    fixedCosts,
    variableCosts,
    depreciation: totalMonthlyDepreciation,
    operatingHours,
    costPerHour,
    memberAllocations,
  }
}

/**
 * Generate annual forecast (12 months)
 */
export function generateAnnualForecast(
  project: any,
  startMonth: number = new Date().getMonth() + 1,
  startYear: number = new Date().getFullYear()
): AnnualForecastData[] {
  const forecast: AnnualForecastData[] = []
  let cumulativeCost = new Decimal(0)

  // Get current operating parameters
  const currentParams = Array.isArray(project.operatingParams)
    ? project.operatingParams.find((p: any) => !p.month) || project.operatingParams[0]
    : project.operatingParams

  const opParams = currentParams || {
    operatingHoursPerMonth: "0",
    fuelCostPerHour: "0",
    maintenanceCostPerHour: "0",
    insuranceMonthly: "0",
    staffSalariesMonthly: "0",
    facilityRentMonthly: "0",
    otherExpenses: [],
  }

  // Calculate base depreciation (constant)
  const totalMonthlyDepreciation = project.equipment.reduce((sum: Decimal, eq: any) => {
    const annual = calculateAnnualDepreciation(
      eq.purchasePrice,
      eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1).toString(),
      eq.serviceLifeYears
    )
    return sum.plus(calculateMonthlyDepreciation(annual))
  }, new Decimal(0))

  const fixedCosts = calculateTotalFixedCosts(
    opParams.insuranceMonthly || "0",
    opParams.staffSalariesMonthly || "0",
    opParams.facilityRentMonthly || "0",
    opParams.otherExpenses.map((e: any) => ({ amount: e.amount || "0" }))
  )

  const operatingHours = new Decimal(opParams.operatingHoursPerMonth || "0")
  const variableCostPerHour = new Decimal(opParams.fuelCostPerHour || "0")
    .plus(opParams.maintenanceCostPerHour || "0")

  for (let i = 0; i < 12; i++) {
    const monthNum = ((startMonth - 1 + i) % 12) + 1
    const year = startYear + Math.floor((startMonth - 1 + i) / 12)
    const date = new Date(year, monthNum - 1, 1)
    const monthName = date.toLocaleString("default", { month: "short" })

    // Variable costs based on operating hours
    const variableCosts = variableCostPerHour.mul(operatingHours)

    // Total monthly cost
    const monthlyCost = fixedCosts.plus(variableCosts).plus(totalMonthlyDepreciation)

    cumulativeCost = cumulativeCost.plus(monthlyCost)

    const costPerHour = calculateCostPerHour(monthlyCost, operatingHours)

    forecast.push({
      month: monthNum,
      monthName,
      year,
      projectedCost: monthlyCost,
      cumulativeCost: cumulativeCost,
      operatingHours,
      costPerHour,
    })
  }

  return forecast
}

/**
 * Generate depreciation schedule
 */
export function generateDepreciationSchedule(project: any): DepreciationScheduleItem[] {
  const now = new Date()
  const currentYear = now.getFullYear()

  return project.equipment.map((eq: any) => {
    const purchaseDate = new Date(eq.acquisitionDate)
    const purchaseYear = purchaseDate.getFullYear()
    const yearsSincePurchase = currentYear - purchaseYear

    const salvageValue = eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1)
    const annualDepreciation = calculateAnnualDepreciation(
      eq.purchasePrice,
      salvageValue,
      eq.serviceLifeYears
    )
    const monthlyDepreciation = calculateMonthlyDepreciation(annualDepreciation)

    // Calculate current book value
    const totalDepreciation = annualDepreciation.mul(Math.min(yearsSincePurchase, eq.serviceLifeYears))
    const currentBookValue = new Decimal(eq.purchasePrice).minus(totalDepreciation)
    const yearsRemaining = Math.max(0, eq.serviceLifeYears - yearsSincePurchase)

    return {
      equipmentId: eq.id,
      equipmentName: eq.name,
      purchasePrice: new Decimal(eq.purchasePrice),
      salvageValue: new Decimal(salvageValue),
      serviceLifeYears: eq.serviceLifeYears,
      annualDepreciation,
      monthlyDepreciation,
      yearsRemaining,
      currentBookValue: currentBookValue.gt(salvageValue) ? currentBookValue : new Decimal(salvageValue),
    }
  })
}

/**
 * Generate scenario analysis
 */
export function generateScenarioAnalysis(
  project: any,
  scenarios: Array<{
    name: string
    operatingHoursMultiplier?: number
    costMultiplier?: number
  }>
): ScenarioAnalysisResult[] {
  const baseReport = generateMonthlyReport(project)

  // Get current operating parameters
  const currentParams = Array.isArray(project.operatingParams)
    ? project.operatingParams.find((p: any) => !p.month) || project.operatingParams[0]
    : project.operatingParams

  const opParams = currentParams || {
    operatingHoursPerMonth: "0",
    fuelCostPerHour: "0",
    maintenanceCostPerHour: "0",
    insuranceMonthly: "0",
    staffSalariesMonthly: "0",
    facilityRentMonthly: "0",
    otherExpenses: [],
  }

  const baseOperatingHours = new Decimal(opParams.operatingHoursPerMonth || "0")
  const baseFixedCosts = calculateTotalFixedCosts(
    opParams.insuranceMonthly || "0",
    opParams.staffSalariesMonthly || "0",
    opParams.facilityRentMonthly || "0",
    opParams.otherExpenses.map((e: any) => ({ amount: e.amount || "0" }))
  )

  const baseVariableCostPerHour = new Decimal(opParams.fuelCostPerHour || "0")
    .plus(opParams.maintenanceCostPerHour || "0")

  const totalMonthlyDepreciation = project.equipment.reduce((sum: Decimal, eq: any) => {
    const annual = calculateAnnualDepreciation(
      eq.purchasePrice,
      eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1).toString(),
      eq.serviceLifeYears
    )
    return sum.plus(calculateMonthlyDepreciation(annual))
  }, new Decimal(0))

  const results: ScenarioAnalysisResult[] = []

  scenarios.forEach((scenario) => {
    const hoursMultiplier = scenario.operatingHoursMultiplier || 1
    const costMultiplier = scenario.costMultiplier || 1

    const scenarioHours = baseOperatingHours.mul(hoursMultiplier)
    const scenarioFixedCosts = baseFixedCosts.mul(costMultiplier)
    const scenarioVariableCostPerHour = baseVariableCostPerHour.mul(costMultiplier)
    const scenarioVariableCosts = scenarioVariableCostPerHour.mul(scenarioHours)

    const totalMonthlyCost = scenarioFixedCosts
      .plus(scenarioVariableCosts)
      .plus(totalMonthlyDepreciation)

    const costPerHour = calculateCostPerHour(totalMonthlyCost, scenarioHours)

    const variableCostPerHour = scenarioVariableCostPerHour
    const breakEvenHours = calculateBreakEvenHours(
      scenarioFixedCosts,
      totalMonthlyDepreciation,
      variableCostPerHour
    )

    const annualCost = totalMonthlyCost.mul(12)

    const difference = totalMonthlyCost.minus(baseReport.totalCost)
    const differencePercent = baseReport.totalCost.gt(0)
      ? difference.div(baseReport.totalCost).mul(100)
      : new Decimal(0)

    results.push({
      scenarioName: scenario.name,
      totalMonthlyCost,
      costPerHour,
      breakEvenHours,
      annualCost,
      difference,
      differencePercent,
    })
  })

  return results
}

/**
 * Calculate financial health score (0-100)
 */
export function calculateFinancialHealthScore(
  project: any,
  monthlyReport: MonthlyReportData
): {
  score: number
  factors: Array<{ name: string; score: number; weight: number }>
} {
  const factors: Array<{ name: string; score: number; weight: number }> = []

  // Factor 1: Operating hours utilization (0-30 points)
  const recommendedHours = 200 // Industry standard
  const hoursScore = monthlyReport.operatingHours.gte(recommendedHours)
    ? 30
    : monthlyReport.operatingHours.div(recommendedHours).mul(30).toNumber()
  factors.push({ name: "Operating Hours Utilization", score: hoursScore, weight: 30 })

  // Factor 2: Cost efficiency (0-25 points)
  // Lower cost per hour is better, but we need a baseline
  const baselineCostPerHour = 50000 // Example baseline
  const efficiencyScore = monthlyReport.costPerHour.lte(baselineCostPerHour)
    ? 25
    : Math.max(0, 25 - (monthlyReport.costPerHour.minus(baselineCostPerHour).div(10000).toNumber()))
  factors.push({ name: "Cost Efficiency", score: efficiencyScore, weight: 25 })

  // Factor 3: Equipment utilization (0-20 points)
  const equipmentCount = project.equipment.length
  const equipmentScore = equipmentCount > 0 ? 20 : 0
  factors.push({ name: "Equipment Utilization", score: equipmentScore, weight: 20 })

  // Factor 4: Team allocation balance (0-15 points)
  const memberCount = monthlyReport.memberAllocations.length
  const allocationBalance = memberCount > 1 ? 15 : 10
  factors.push({ name: "Team Allocation Balance", score: allocationBalance, weight: 15 })

  // Factor 5: Cost structure (0-10 points)
  // Balanced cost structure (not too much in one category)
  const fixedRatio = monthlyReport.fixedCosts.div(monthlyReport.totalCost).toNumber()
  const variableRatio = monthlyReport.variableCosts.div(monthlyReport.totalCost).toNumber()
  const structureScore = (fixedRatio > 0.2 && fixedRatio < 0.6 && variableRatio > 0.2) ? 10 : 5
  factors.push({ name: "Cost Structure", score: structureScore, weight: 10 })

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0)

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    factors,
  }
}

/**
 * Generate 3-month trend data
 */
export function generateTrendData(
  project: any,
  months: number = 3
): Array<{
  month: string
  year: number
  totalCost: Decimal
  operatingHours: Decimal
}> {
  const trend: Array<{
    month: string
    year: number
    totalCost: Decimal
    operatingHours: Decimal
  }> = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const report = generateMonthlyReport(project, date)
    trend.push({
      month: report.month,
      year: report.year,
      totalCost: report.totalCost,
      operatingHours: report.operatingHours,
    })
  }

  return trend
}
