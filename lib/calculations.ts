import Decimal from "decimal.js"

// Configure Decimal.js for financial precision
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

export type Currency = string

/**
 * Format currency value
 */
export function formatCurrency(
  value: Decimal | number | string,
  currency: Currency = "USD"
): string {
  const decimal = new Decimal(value)
  const formatted = decimal.toFixed(2)
  
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    RUB: "₽",
    JPY: "¥",
    CNY: "¥",
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

/**
 * Calculate annual depreciation using straight-line method
 */
export function calculateAnnualDepreciation(
  purchasePrice: Decimal | number | string,
  salvageValue: Decimal | number | string,
  lifeYears: number
): Decimal {
  const price = new Decimal(purchasePrice)
  const salvage = new Decimal(salvageValue)
  const years = new Decimal(lifeYears)
  
  if (years.lte(0)) {
    return new Decimal(0)
  }
  
  return price.minus(salvage).div(years)
}

/**
 * Calculate monthly depreciation
 */
export function calculateMonthlyDepreciation(
  annualDepreciation: Decimal | number | string
): Decimal {
  const annual = new Decimal(annualDepreciation)
  return annual.div(12)
}

/**
 * Calculate auto salvage value (10% of purchase price)
 */
export function calculateAutoSalvageValue(
  purchasePrice: Decimal | number | string
): Decimal {
  const price = new Decimal(purchasePrice)
  return price.mul(0.1)
}

/**
 * Calculate monthly variable costs
 */
export function calculateMonthlyVariableCosts(
  fuelCostPerHour: Decimal | number | string,
  maintenanceCostPerHour: Decimal | number | string,
  operatingHours: Decimal | number | string
): Decimal {
  const fuel = new Decimal(fuelCostPerHour)
  const maintenance = new Decimal(maintenanceCostPerHour)
  const hours = new Decimal(operatingHours)
  
  return fuel.plus(maintenance).mul(hours)
}

/**
 * Calculate total monthly cost
 */
export function calculateTotalMonthlyCost(
  fixedCosts: Decimal | number | string,
  variableCosts: Decimal | number | string,
  depreciation: Decimal | number | string
): Decimal {
  const fixed = new Decimal(fixedCosts)
  const variable = new Decimal(variableCosts)
  const dep = new Decimal(depreciation)
  
  return fixed.plus(variable).plus(dep)
}

/**
 * Calculate cost per hour
 */
export function calculateCostPerHour(
  totalMonthlyCost: Decimal | number | string,
  operatingHours: Decimal | number | string
): Decimal {
  const total = new Decimal(totalMonthlyCost)
  const hours = new Decimal(operatingHours)
  
  if (hours.lte(0)) {
    return new Decimal(0)
  }
  
  return total.div(hours)
}

/**
 * Allocate cost by hours
 */
export function allocateCostByHours(
  totalCost: Decimal | number | string,
  memberHours: Decimal | number | string,
  totalHours: Decimal | number | string
): Decimal {
  const cost = new Decimal(totalCost)
  const memberHrs = new Decimal(memberHours)
  const totalHrs = new Decimal(totalHours)
  
  if (totalHrs.lte(0)) {
    return new Decimal(0)
  }
  
  return cost.mul(memberHrs).div(totalHrs)
}

/**
 * Allocate cost by ownership share (percentage)
 */
export function allocateCostByShare(
  totalCost: Decimal | number | string,
  memberShare: Decimal | number | string
): Decimal {
  const cost = new Decimal(totalCost)
  const share = new Decimal(memberShare)
  
  return cost.mul(share).div(100)
}

/**
 * Allocate cost equally among members
 */
export function allocateCostEqually(
  totalCost: Decimal | number | string,
  memberCount: number
): Decimal {
  const cost = new Decimal(totalCost)
  const count = new Decimal(memberCount)
  
  if (count.lte(0)) {
    return new Decimal(0)
  }
  
  return cost.div(count)
}

/**
 * Calculate break-even hours per month
 */
export function calculateBreakEvenHours(
  fixedCosts: Decimal | number | string,
  depreciation: Decimal | number | string,
  variableCostPerHour: Decimal | number | string
): Decimal {
  const fixed = new Decimal(fixedCosts)
  const dep = new Decimal(depreciation)
  const variablePerHour = new Decimal(variableCostPerHour)
  
  if (variablePerHour.lte(0)) {
    return new Decimal(0)
  }
  
  return fixed.plus(dep).div(variablePerHour)
}

/**
 * Calculate monthly reserve (typically 15% of monthly cost)
 */
export function calculateMonthlyReserve(
  monthlyCost: Decimal | number | string,
  reservePercentage: number = 15
): Decimal {
  const cost = new Decimal(monthlyCost)
  const percentage = new Decimal(reservePercentage)
  
  return cost.mul(percentage).div(100)
}

/**
 * Calculate total fixed costs
 */
export function calculateTotalFixedCosts(
  insurance: Decimal | number | string,
  staffSalaries: Decimal | number | string,
  facilityRent: Decimal | number | string,
  otherExpenses: Array<{ amount: Decimal | number | string }> = []
): Decimal {
  const ins = new Decimal(insurance)
  const staff = new Decimal(staffSalaries)
  const rent = new Decimal(facilityRent)
  
  let total = ins.plus(staff).plus(rent)
  
  for (const expense of otherExpenses) {
    total = total.plus(expense.amount)
  }
  
  return total
}

/**
 * Calculate annual cost from monthly
 */
export function calculateAnnualCost(
  monthlyCost: Decimal | number | string
): Decimal {
  const monthly = new Decimal(monthlyCost)
  return monthly.mul(12)
}

/**
 * Calculate cost per member based on allocation method
 */
export function calculateMemberCost(
  totalCost: Decimal | number | string,
  allocationMethod: "by_hours" | "equal" | "percentage",
  memberData: {
    hours?: Decimal | number | string
    share?: Decimal | number | string
  },
  projectData: {
    totalHours?: Decimal | number | string
    memberCount?: number
  }
): Decimal {
  const cost = new Decimal(totalCost)
  
  switch (allocationMethod) {
    case "by_hours":
      if (memberData.hours && projectData.totalHours) {
        return allocateCostByHours(cost, memberData.hours, projectData.totalHours)
      }
      return new Decimal(0)
    
    case "equal":
      if (projectData.memberCount) {
        return allocateCostEqually(cost, projectData.memberCount)
      }
      return new Decimal(0)
    
    case "percentage":
      if (memberData.share) {
        return allocateCostByShare(cost, memberData.share)
      }
      return new Decimal(0)
    
    default:
      return new Decimal(0)
  }
}

/**
 * Scenario comparison
 */
export interface Scenario {
  name: string
  operatingHours: Decimal | number | string
  fixedCosts: Decimal | number | string
  variableCosts: Decimal | number | string
  depreciation: Decimal | number | string
}

export function compareScenarios(
  baseCase: Scenario,
  scenarios: Scenario[]
): Array<{
  name: string
  totalCost: Decimal
  costPerHour: Decimal
  difference: Decimal
  differencePercent: Decimal
}> {
  const baseTotal = calculateTotalMonthlyCost(
    baseCase.fixedCosts,
    baseCase.variableCosts,
    baseCase.depreciation
  )
  const basePerHour = calculateCostPerHour(
    baseTotal,
    baseCase.operatingHours
  )
  
  return scenarios.map((scenario) => {
    const scenarioTotal = calculateTotalMonthlyCost(
      scenario.fixedCosts,
      scenario.variableCosts,
      scenario.depreciation
    )
    const scenarioPerHour = calculateCostPerHour(
      scenarioTotal,
      scenario.operatingHours
    )
    
    const difference = scenarioTotal.minus(baseTotal)
    const differencePercent = baseTotal.gt(0)
      ? difference.div(baseTotal).mul(100)
      : new Decimal(0)
    
    return {
      name: scenario.name,
      totalCost: scenarioTotal,
      costPerHour: scenarioPerHour,
      difference,
      differencePercent,
    }
  })
}
