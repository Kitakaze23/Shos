export const CURRENCIES = [
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
] as const

export const EQUIPMENT_CATEGORIES = [
  "Helicopter",
  "Vehicle",
  "Machinery",
  "Other",
] as const

export const DEPRECIATION_METHODS = [
  { value: "straight_line", label: "Straight Line" },
  { value: "units_of_production", label: "Units of Production" },
] as const

export const COST_ALLOCATION_METHODS = [
  { value: "by_hours", label: "By Operating Hours" },
  { value: "equal", label: "Equal Split" },
  { value: "percentage", label: "By Ownership Share" },
] as const

export const MEMBER_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const

export const MEMBER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const

export const REPORT_TYPES = [
  { value: "monthly", label: "Monthly Summary" },
  { value: "annual", label: "Annual Forecast" },
  { value: "depreciation", label: "Depreciation Schedule" },
  { value: "scenarios", label: "Scenario Analysis" },
] as const

export const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF", extension: ".pdf" },
  { value: "excel", label: "Excel", extension: ".xlsx" },
  { value: "csv", label: "CSV", extension: ".csv" },
] as const

export const TOAST_DURATION = 5000 // 5 seconds

export const CACHE_DURATIONS = {
  PROJECT: 5 * 60 * 1000, // 5 minutes
  CALCULATION: 60 * 1000, // 1 minute
  REPORT: 4 * 60 * 60 * 1000, // 4 hours
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const
