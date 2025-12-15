import { formatCurrency } from "./calculations"

import Decimal from "decimal.js"

export function generateMonthlyReportEmail(
  projectName: string,
  reportData: any,
  recipientName?: string
): { subject: string; html: string; text: string } {
  // Ensure Decimal values
  const totalCost = reportData.totalCost instanceof Decimal
    ? reportData.totalCost
    : new Decimal(reportData.totalCost || 0)
  const costPerHour = reportData.costPerHour instanceof Decimal
    ? reportData.costPerHour
    : new Decimal(reportData.costPerHour || 0)
  const operatingHours = reportData.operatingHours instanceof Decimal
    ? reportData.operatingHours
    : new Decimal(reportData.operatingHours || 0)
  const fixedCosts = reportData.fixedCosts instanceof Decimal
    ? reportData.fixedCosts
    : new Decimal(reportData.fixedCosts || 0)
  const variableCosts = reportData.variableCosts instanceof Decimal
    ? reportData.variableCosts
    : new Decimal(reportData.variableCosts || 0)
  const depreciation = reportData.depreciation instanceof Decimal
    ? reportData.depreciation
    : new Decimal(reportData.depreciation || 0)
  const subject = `Monthly Financial Report - ${projectName} - ${new Date().toLocaleDateString()}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Financial Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .metric {
      background: #f9fafb;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 4px solid #3b82f6;
    }
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    .table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .table tr:hover {
      background: #f9fafb;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Monthly Financial Report</h1>
    <p>${projectName}</p>
  </div>
  <div class="content">
    ${recipientName ? `<p>Hello ${recipientName},</p>` : ""}
    <p>Please find your monthly financial report for <strong>${projectName}</strong> below.</p>
    
    <div class="metric">
      <div class="metric-label">Total Monthly Cost</div>
      <div class="metric-value">${formatCurrency(totalCost, reportData.currency || "USD")}</div>
    </div>
    
    <div class="metric">
      <div class="metric-label">Cost Per Hour</div>
      <div class="metric-value">${formatCurrency(costPerHour, reportData.currency || "USD")}</div>
    </div>
    
    <div class="metric">
      <div class="metric-label">Operating Hours</div>
      <div class="metric-value">${operatingHours.toFixed(1)} hours</div>
    </div>

    <h3>Cost Breakdown</h3>
    <table class="table">
      <tr>
        <th>Category</th>
        <th>Amount</th>
      </tr>
      <tr>
        <td>Fixed Costs</td>
        <td>${formatCurrency(fixedCosts, reportData.currency || "USD")}</td>
      </tr>
      <tr>
        <td>Variable Costs</td>
        <td>${formatCurrency(variableCosts, reportData.currency || "USD")}</td>
      </tr>
      <tr>
        <td>Depreciation</td>
        <td>${formatCurrency(depreciation, reportData.currency || "USD")}</td>
      </tr>
    </table>

    ${reportData.memberAllocations?.length > 0 ? `
    <h3>Cost Allocation by Member</h3>
    <table class="table">
      <tr>
        <th>Member</th>
        <th>Monthly Cost</th>
        <th>Annual Cost</th>
      </tr>
      ${reportData.memberAllocations.map((m: any) => {
        const cost = m.allocatedCost instanceof Decimal
          ? m.allocatedCost
          : new Decimal(m.allocatedCost || 0)
        return `
        <tr>
          <td>${m.memberName}</td>
          <td>${formatCurrency(cost, reportData.currency || "USD")}</td>
          <td>${formatCurrency(cost.mul(12), reportData.currency || "USD")}</td>
        </tr>
      `
      }).join("")}
    </table>
    ` : ""}

    <p style="margin-top: 30px;">
      <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard/projects" class="button">
        View Full Report
      </a>
    </p>
  </div>
  <div class="footer">
    <p>This is an automated report from Fleet Cost Tracker.</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `.trim()

  const text = `
Monthly Financial Report - ${projectName}

Generated: ${new Date().toLocaleDateString()}

Key Metrics:
- Total Monthly Cost: ${formatCurrency(totalCost, reportData.currency || "USD")}
- Cost Per Hour: ${formatCurrency(costPerHour, reportData.currency || "USD")}
- Operating Hours: ${operatingHours.toFixed(1)} hours

Cost Breakdown:
- Fixed Costs: ${formatCurrency(fixedCosts, reportData.currency || "USD")}
- Variable Costs: ${formatCurrency(variableCosts, reportData.currency || "USD")}
- Depreciation: ${formatCurrency(depreciation, reportData.currency || "USD")}

${reportData.memberAllocations?.length > 0 ? `
Cost Allocation:
${reportData.memberAllocations.map((m: any) => {
  const cost = m.allocatedCost instanceof Decimal
    ? m.allocatedCost
    : new Decimal(m.allocatedCost || 0)
  return `- ${m.memberName}: ${formatCurrency(cost, reportData.currency || "USD")}/month`
}).join("\n")}
` : ""}

View full report: ${process.env.APP_URL || "http://localhost:3000"}/dashboard/projects
  `.trim()

  return { subject, html, text }
}
