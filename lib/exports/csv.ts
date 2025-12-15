import Papa from "papaparse"
import { formatCurrency } from "../calculations"
import Decimal from "decimal.js"

export function generateCSVReport(data: any, currency: string = "USD"): string {
  const rows: any[] = []

  // Header
  rows.push(["Fleet Cost Tracker - Financial Report"])
  rows.push([`Generated: ${new Date().toISOString().split("T")[0]}`])
  rows.push([])

  // Monthly Summary
  if (data.monthlyReport) {
    const totalCost = data.monthlyReport.totalCost instanceof Decimal
      ? data.monthlyReport.totalCost
      : new Decimal(data.monthlyReport.totalCost)
    const operatingHours = data.monthlyReport.operatingHours instanceof Decimal
      ? data.monthlyReport.operatingHours
      : new Decimal(data.monthlyReport.operatingHours)
    const costPerHour = data.monthlyReport.costPerHour instanceof Decimal
      ? data.monthlyReport.costPerHour
      : new Decimal(data.monthlyReport.costPerHour)
    const fixedCosts = data.monthlyReport.fixedCosts instanceof Decimal
      ? data.monthlyReport.fixedCosts
      : new Decimal(data.monthlyReport.fixedCosts)
    const variableCosts = data.monthlyReport.variableCosts instanceof Decimal
      ? data.monthlyReport.variableCosts
      : new Decimal(data.monthlyReport.variableCosts)
    const depreciation = data.monthlyReport.depreciation instanceof Decimal
      ? data.monthlyReport.depreciation
      : new Decimal(data.monthlyReport.depreciation)

    rows.push(["MONTHLY SUMMARY"])
    rows.push(["Metric", "Value"])
    rows.push([
      "Total Monthly Cost",
      totalCost.toNumber().toString(),
    ])
    rows.push([
      "Operating Hours",
      operatingHours.toFixed(1),
    ])
    rows.push([
      "Cost Per Hour",
      costPerHour.toNumber().toString(),
    ])
    rows.push([
      "Fixed Costs",
      fixedCosts.toNumber().toString(),
    ])
    rows.push([
      "Variable Costs",
      variableCosts.toNumber().toString(),
    ])
    rows.push([
      "Depreciation",
      depreciation.toNumber().toString(),
    ])
    rows.push([])

    // Member Allocation
    if (data.monthlyReport.memberAllocations?.length > 0) {
      rows.push(["MEMBER ALLOCATION"])
      rows.push(["Member", "Monthly Cost", "Annual Cost"])
      data.monthlyReport.memberAllocations.forEach((m: any) => {
        const cost = m.allocatedCost instanceof Decimal
          ? m.allocatedCost
          : new Decimal(m.allocatedCost)
        rows.push([
          m.memberName,
          cost.toNumber().toString(),
          cost.mul(12).toNumber().toString(),
        ])
      })
      rows.push([])
    }
  }

  // Annual Forecast
  if (data.annualForecast?.length > 0) {
    rows.push(["ANNUAL FORECAST"])
    rows.push(["Month", "Year", "Projected Cost", "Cumulative Cost", "Operating Hours", "Cost Per Hour"])
    data.annualForecast.forEach((f: any) => {
      const projected = f.projectedCost instanceof Decimal
        ? f.projectedCost
        : new Decimal(f.projectedCost)
      const cumulative = f.cumulativeCost instanceof Decimal
        ? f.cumulativeCost
        : new Decimal(f.cumulativeCost)
      const hours = f.operatingHours instanceof Decimal
        ? f.operatingHours
        : new Decimal(f.operatingHours)
      const costPerHour = f.costPerHour instanceof Decimal
        ? f.costPerHour
        : new Decimal(f.costPerHour)
      rows.push([
        f.monthName,
        f.year.toString(),
        projected.toNumber().toString(),
        cumulative.toNumber().toString(),
        hours.toFixed(1),
        costPerHour.toNumber().toString(),
      ])
    })
    rows.push([])
  }

  // Depreciation Schedule
  if (data.depreciationSchedule?.length > 0) {
    rows.push(["DEPRECIATION SCHEDULE"])
    rows.push([
      "Equipment Name",
      "Purchase Price",
      "Salvage Value",
      "Service Life (Years)",
      "Annual Depreciation",
      "Monthly Depreciation",
      "Current Book Value",
      "Years Remaining",
    ])
    data.depreciationSchedule.forEach((d: any) => {
      const purchasePrice = d.purchasePrice instanceof Decimal
        ? d.purchasePrice
        : new Decimal(d.purchasePrice)
      const salvageValue = d.salvageValue instanceof Decimal
        ? d.salvageValue
        : new Decimal(d.salvageValue)
      const annualDep = d.annualDepreciation instanceof Decimal
        ? d.annualDepreciation
        : new Decimal(d.annualDepreciation)
      const monthlyDep = d.monthlyDepreciation instanceof Decimal
        ? d.monthlyDepreciation
        : new Decimal(d.monthlyDepreciation)
      const bookValue = d.currentBookValue instanceof Decimal
        ? d.currentBookValue
        : new Decimal(d.currentBookValue)
      rows.push([
        d.equipmentName,
        purchasePrice.toNumber().toString(),
        salvageValue.toNumber().toString(),
        d.serviceLifeYears.toString(),
        annualDep.toNumber().toString(),
        monthlyDep.toNumber().toString(),
        bookValue.toNumber().toString(),
        d.yearsRemaining.toString(),
      ])
    })
  }

  return Papa.unparse(rows, {
    delimiter: ",",
    newline: "\n",
    quotes: true,
    escapeChar: '"',
  })
}

export function generateCSVFileName(projectName: string): string {
  const sanitized = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  const date = new Date().toISOString().split("T")[0]
  return `Financial_Report_${sanitized}_${date}.csv`
}
