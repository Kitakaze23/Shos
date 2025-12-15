import ExcelJS from "exceljs"
import { formatCurrency } from "../calculations"

interface ExcelExportOptions {
  projectName: string
  currency: string
}

export async function generateExcelReport(
  data: any,
  options: ExcelExportOptions
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Fleet Cost Tracker"
  workbook.created = new Date()

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary")
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 20 },
  ]

  if (data.monthlyReport) {
    summarySheet.addRow({ metric: "Project Name", value: options.projectName })
    summarySheet.addRow({ metric: "Report Date", value: new Date().toLocaleDateString() })
    summarySheet.addRow({ metric: "Total Monthly Cost", value: formatCurrency(data.monthlyReport.totalCost, options.currency) })
    summarySheet.addRow({ metric: "Operating Hours", value: data.monthlyReport.operatingHours.toFixed(1) })
    summarySheet.addRow({ metric: "Cost Per Hour", value: formatCurrency(data.monthlyReport.costPerHour, options.currency) })
    summarySheet.addRow({ metric: "Fixed Costs", value: formatCurrency(data.monthlyReport.fixedCosts, options.currency) })
    summarySheet.addRow({ metric: "Variable Costs", value: formatCurrency(data.monthlyReport.variableCosts, options.currency) })
    summarySheet.addRow({ metric: "Depreciation", value: formatCurrency(data.monthlyReport.depreciation, options.currency) })
  }

  // Format header row
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  }
  summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

  // Assets Sheet
  if (data.depreciationSchedule?.length > 0) {
    const assetsSheet = workbook.addWorksheet("Assets")
    assetsSheet.columns = [
      { header: "Equipment Name", key: "name", width: 30 },
      { header: "Purchase Price", key: "purchasePrice", width: 18 },
      { header: "Salvage Value", key: "salvageValue", width: 18 },
      { header: "Service Life (Years)", key: "serviceLife", width: 18 },
      { header: "Annual Depreciation", key: "annualDep", width: 20 },
      { header: "Monthly Depreciation", key: "monthlyDep", width: 20 },
      { header: "Current Book Value", key: "bookValue", width: 20 },
      { header: "Years Remaining", key: "yearsRemaining", width: 15 },
    ]

    data.depreciationSchedule.forEach((item: any) => {
      assetsSheet.addRow({
        name: item.equipmentName,
        purchasePrice: item.purchasePrice.toNumber(),
        salvageValue: item.salvageValue.toNumber(),
        serviceLife: item.serviceLifeYears,
        annualDep: item.annualDepreciation.toNumber(),
        monthlyDep: item.monthlyDepreciation.toNumber(),
        bookValue: item.currentBookValue.toNumber(),
        yearsRemaining: item.yearsRemaining,
      })
    })

    // Format header
    assetsSheet.getRow(1).font = { bold: true }
    assetsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    assetsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

    // Format number columns
    const numberColumns = ["purchasePrice", "salvageValue", "annualDep", "monthlyDep", "bookValue"]
    numberColumns.forEach((col) => {
      assetsSheet.getColumn(col).numFmt = `"${options.currency}"#,##0.00`
    })

    // Alternating row colors
    assetsSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" },
        }
      }
    })
  }

  // Costs Sheet
  if (data.monthlyReport) {
    const costsSheet = workbook.addWorksheet("Costs")
    costsSheet.columns = [
      { header: "Cost Category", key: "category", width: 25 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Percentage", key: "percentage", width: 15 },
    ]

    const totalCost = data.monthlyReport.totalCost.toNumber()
    const costs = [
      { category: "Fixed Costs", amount: data.monthlyReport.fixedCosts.toNumber() },
      { category: "Variable Costs", amount: data.monthlyReport.variableCosts.toNumber() },
      { category: "Depreciation", amount: data.monthlyReport.depreciation.toNumber() },
    ]

    costs.forEach((cost) => {
      const percentage = totalCost > 0 ? (cost.amount / totalCost * 100).toFixed(1) : "0"
      costsSheet.addRow({
        category: cost.category,
        amount: cost.amount,
        percentage: `${percentage}%`,
      })
    })

    costsSheet.getRow(1).font = { bold: true }
    costsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    costsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

    costsSheet.getColumn("amount").numFmt = `"${options.currency}"#,##0.00`
  }

  // Allocation Sheet
  if (data.monthlyReport?.memberAllocations?.length > 0) {
    const allocationSheet = workbook.addWorksheet("Allocation")
    allocationSheet.columns = [
      { header: "Member", key: "member", width: 30 },
      { header: "Monthly Cost", key: "monthly", width: 20 },
      { header: "Annual Cost", key: "annual", width: 20 },
    ]

    data.monthlyReport.memberAllocations.forEach((m: any) => {
      allocationSheet.addRow({
        member: m.memberName,
        monthly: m.allocatedCost.toNumber(),
        annual: m.allocatedCost.mul(12).toNumber(),
      })
    })

    allocationSheet.getRow(1).font = { bold: true }
    allocationSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    allocationSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

    allocationSheet.getColumn("monthly").numFmt = `"${options.currency}"#,##0.00`
    allocationSheet.getColumn("annual").numFmt = `"${options.currency}"#,##0.00`
  }

  // Forecast Sheet
  if (data.annualForecast?.length > 0) {
    const forecastSheet = workbook.addWorksheet("Forecast")
    forecastSheet.columns = [
      { header: "Month", key: "month", width: 15 },
      { header: "Year", key: "year", width: 10 },
      { header: "Projected Cost", key: "projected", width: 20 },
      { header: "Cumulative Cost", key: "cumulative", width: 20 },
      { header: "Operating Hours", key: "hours", width: 15 },
      { header: "Cost Per Hour", key: "costPerHour", width: 18 },
    ]

    data.annualForecast.forEach((f: any) => {
      forecastSheet.addRow({
        month: f.monthName,
        year: f.year,
        projected: f.projectedCost.toNumber(),
        cumulative: f.cumulativeCost.toNumber(),
        hours: f.operatingHours.toNumber(),
        costPerHour: f.costPerHour.toNumber(),
      })
    })

    forecastSheet.getRow(1).font = { bold: true }
    forecastSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    }
    forecastSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }

    forecastSheet.getColumn("projected").numFmt = `"${options.currency}"#,##0.00`
    forecastSheet.getColumn("cumulative").numFmt = `"${options.currency}"#,##0.00`
    forecastSheet.getColumn("costPerHour").numFmt = `"${options.currency}"#,##0.00`
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export function generateExcelFileName(projectName: string): string {
  const sanitized = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  const date = new Date().toISOString().split("T")[0]
  return `Financial_Report_${sanitized}_${date}.xlsx`
}
