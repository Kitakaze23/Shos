import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency } from "../calculations"
import Decimal from "decimal.js"

interface PDFExportOptions {
  title: string
  projectName: string
  companyName?: string
  watermark?: string
  includeCharts?: boolean
}

export async function generatePDFReport(
  data: any,
  options: PDFExportOptions
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(options.title, margin, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Project: ${options.projectName}`, margin, yPosition)
  yPosition += 5

  if (options.companyName) {
    doc.text(`Company: ${options.companyName}`, margin, yPosition)
    yPosition += 5
  }

  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
  yPosition += 10

  // Add watermark if specified
  if (options.watermark) {
    doc.setFontSize(60)
    doc.setTextColor(200, 200, 200)
    doc.setFont("helvetica", "bold")
    doc.text(
      options.watermark,
      pageWidth / 2,
      pageHeight / 2,
      { align: "center", angle: 45 }
    )
    doc.setTextColor(0, 0, 0)
  }

  // Monthly Summary Section
  if (data.monthlyReport) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Monthly Summary", margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    // Key Metrics Table
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

    const metricsData = [
      [
        "Total Monthly Cost",
        formatCurrency(totalCost, data.currency || "USD"),
      ],
      [
        "Operating Hours",
        operatingHours.toFixed(1),
      ],
      [
        "Cost Per Hour",
        formatCurrency(costPerHour, data.currency || "USD"),
      ],
      [
        "Fixed Costs",
        formatCurrency(fixedCosts, data.currency || "USD"),
      ],
      [
        "Variable Costs",
        formatCurrency(variableCosts, data.currency || "USD"),
      ],
      [
        "Depreciation",
        formatCurrency(depreciation, data.currency || "USD"),
      ],
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: metricsData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    // Member Allocation Table
    if (data.monthlyReport.memberAllocations?.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Cost Allocation by Member", margin, yPosition)
      yPosition += 8

      const memberData = data.monthlyReport.memberAllocations.map((m: any) => {
        const cost = m.allocatedCost instanceof Decimal
          ? m.allocatedCost
          : new Decimal(m.allocatedCost)
        return [
          m.memberName,
          formatCurrency(cost, data.currency || "USD"),
        ]
      })

      autoTable(doc, {
        startY: yPosition,
        head: [["Member", "Allocated Cost"]],
        body: memberData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: margin, right: margin },
      })

      yPosition = (doc as any).lastAutoTable.finalY + 10
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Annual Forecast Section
  if (data.annualForecast?.length > 0) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Annual Forecast", margin, yPosition)
    yPosition += 8

    const forecastData = data.annualForecast.map((f: any) => {
      const projected = f.projectedCost instanceof Decimal
        ? f.projectedCost
        : new Decimal(f.projectedCost)
      const cumulative = f.cumulativeCost instanceof Decimal
        ? f.cumulativeCost
        : new Decimal(f.cumulativeCost)
      const hours = f.operatingHours instanceof Decimal
        ? f.operatingHours
        : new Decimal(f.operatingHours)
      return [
        `${f.monthName} ${f.year}`,
        formatCurrency(projected, data.currency || "USD"),
        formatCurrency(cumulative, data.currency || "USD"),
        hours.toFixed(1),
      ]
    })

    autoTable(doc, {
      startY: yPosition,
      head: [["Month", "Projected Cost", "Cumulative", "Hours"]],
      body: forecastData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Depreciation Schedule Section
  if (data.depreciationSchedule?.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Depreciation Schedule", margin, yPosition)
    yPosition += 8

    const depData = data.depreciationSchedule.map((d: any) => {
      const purchasePrice = d.purchasePrice instanceof Decimal
        ? d.purchasePrice
        : new Decimal(d.purchasePrice)
      const bookValue = d.currentBookValue instanceof Decimal
        ? d.currentBookValue
        : new Decimal(d.currentBookValue)
      const annualDep = d.annualDepreciation instanceof Decimal
        ? d.annualDepreciation
        : new Decimal(d.annualDepreciation)
      return [
        d.equipmentName,
        formatCurrency(purchasePrice, data.currency || "USD"),
        formatCurrency(bookValue, data.currency || "USD"),
        formatCurrency(annualDep, data.currency || "USD"),
        `${d.yearsRemaining} years`,
      ]
    })

    autoTable(doc, {
      startY: yPosition,
      head: [["Equipment", "Purchase Price", "Book Value", "Annual Depreciation", "Years Remaining"]],
      body: depData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: margin, right: margin },
    })
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  return doc.output("blob")
}

export function generateFileName(
  reportType: string,
  projectName: string,
  extension: string = "pdf"
): string {
  const sanitizedProjectName = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  const date = new Date().toISOString().split("T")[0]
  return `${reportType}_${sanitizedProjectName}_${date}.${extension}`
}
